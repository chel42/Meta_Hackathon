# TRAUNES AI — Backend (Beta)

FastAPI · Python 3.12 · PostgreSQL 16 · SSE. Échéance du dépôt : 5 nov. 2026, 02h00 UTC (à reconfirmer sur la page officielle). Tâches classées **P0** (indispensable) et **P1**.

## 1. Périmètre

- **P0** : compte e-mail + mot de passe, sessions, soumission texte ou lien, run asynchrone, flux SSE, preuve TRAUNES AI, historique par utilisateur.
- **P1** : profil (modification, mot de passe, suppression de compte), image, évaluation, purge, fournisseur de repli.
- **Hors Beta** : OAuth, vérification d'e-mail, mot de passe oublié, vidéo et audio, file de jobs distribuée, rôles admin.

## 2. Architecture

Un seul processus FastAPI (1 worker Uvicorn). Les runs s'exécutent en tâches `asyncio` (3 simultanés au maximum), sans Redis. Au démarrage, tout run encore `running` passe en `failed` (`interrupted`).

```
apps/api/app/
  api/        auth, me, submissions, runs, reports, health
  core/       config, security, run_manager, event_bus, errors
  agents/     claim_extractor, investigator, verifier, judge, report_builder
  providers/  base (LLMProvider), meta, fake, fallback
  models/     ORM SQLAlchemy      schemas/  Pydantic (API, événements, Preuve)
```

## 3. Données

| Table | Contenu |
|---|---|
| `users` | `id`, `email` (unique, insensible à la casse), `password_hash`, `display_name`, `language`, `created_at` |
| `sessions` | `id`, `user_id`, `token_hash`, `expires_at`, `user_agent`, `created_at` |
| `submissions` | `id`, `user_id`, `type`, `content`, `language`, `expires_at` |
| `runs` | `id`, `user_id`, `submission_id`, `status`, `current_step`, `budget_used`, `report_id`, `error_code`, `created_at`, `finished_at` |
| `claims`, `sources`, `evidence` | Affirmations, sources (avec `support_status`), extraits rattachés |
| `reports` | `run_id`, `schema_version`, `payload` jsonb |
| `trace_events` | `run_id`, `seq`, `type`, `payload` jsonb ; journal d'audit **et** source du rejeu SSE |

Migrations Alembic. Toute requête sur `runs`, `reports`, `submissions` filtre par `user_id`.

## 4. Authentification et sessions

- Inscription : e-mail + mot de passe (10 caractères minimum), hachage **argon2id**.
- Session : jeton opaque aléatoire, seul son hash est stocké. Cookie `vera_session` **HttpOnly**, `SameSite=Lax`, `Secure` en HTTPS, durée 14 jours.
- Pourquoi un cookie : `EventSource` ne peut pas envoyer d'en-tête personnalisé, et le cookie protège le jeton du JavaScript.
- Protection CSRF : `SameSite=Lax` + contrôle de l'en-tête `Origin` sur toute requête qui modifie des données.
- Connexion limitée à 5 essais par minute (IP + e-mail). Message d'échec identique pour e-mail inconnu et mot de passe erroné.

## 5. API (`/api/v1`)

| Méthode et route | Rôle |
|---|---|
| `POST /auth/register` | Crée le compte, ouvre la session (201) |
| `POST /auth/login` · `POST /auth/logout` | Ouvre ou ferme la session |
| `GET /me` | Profil + statistiques (`runs_total`, répartition des verdicts) |
| `PATCH /me` · `POST /me/password` · `DELETE /me` | Profil, mot de passe, suppression du compte et des données (P1) |
| `POST /submissions` | `{ type: text\|url\|image, content, language?, file? }` → **202** `{ run_id }` |
| `GET /runs?status=&limit=&cursor=` | Historique paginé : `run_id`, `status`, `created_at`, extrait, décompte des verdicts, `report_id` |
| `GET /runs/{id}` | `status`, `current_step`, `budget_used`, `report_id`, `error` |
| `GET /runs/{id}/stream` | Flux SSE (`Last-Event-ID` géré, rejeu depuis `trace_events`) |
| `DELETE /runs/{id}` | Supprime une vérification (P1) |
| `GET /reports/{id}` | Preuve TRAUNES AI (JSON) |
| `GET /health` | Santé, sans information sensible |

**Énumérations** : `status` = `queued`, `running`, `completed`, `failed` · `current_step` = `intake`, `claim_extraction`, `investigation`, `source_verification`, `media_analysis`, `report_generation` · verdict = `supported`, `contradicted`, `unverifiable` · contrôle de source = `confirmed`, `not_confirmed`, `unreachable`.

**Erreurs** : `{ "error": { "code", "message", "request_id" } }` avec 401 `unauthenticated`, 403 `forbidden`, 404 `not_found`, 409 `email_taken`, 413 `payload_too_large`, 422 `invalid_input`, 429 `rate_limited`, 503 `provider_unavailable`.

## 6. Exécution d'un run

Pipeline : **intake** → **extraction** (3 affirmations atomiques au plus ; les opinions sont `unverifiable` sans recherche) → **recherche** (une requête par affirmation, en parallèle) → **contrôle des sources** → **rapport**.

**Contrôle des sources (V0)** : une source citée n'est `confirmed` que si son URL figure dans les résultats bruts de la recherche. **Verdict** : aucune source confirmée → `unverifiable` ; `contradicted` seulement si une source confirmée contredit.

Événements SSE (`id` = `seq` du run) : `run.started`, `step.started`, `step.completed`, `claims.extracted`, `source.found`, `claim.verdict`, `budget.update`, `report.ready` (`report_id`), `run.failed` (`code`, `retryable`). Le flux se ferme après `report.ready` ou `run.failed`.

## 7. Preuve TRAUNES AI (`schema_version` 1.0)

```json
{
  "schema_version": "1.0", "report_id": "…", "run_id": "…", "created_at": "…",
  "input": { "type": "text", "language": "fr", "excerpt": "…" },
  "claims": [{ "claim_id": "c1", "text": "…", "verdict": "contradicted", "rationale": "…",
    "evidence": [{ "stance": "contradicts", "source_id": "s1", "excerpt": "extrait court" }],
    "limits": ["…"] }],
  "sources": [{ "source_id": "s1", "url": "…", "title": "…", "publisher": "…",
    "published_at": "…", "retrieved_at": "…", "support_check": { "status": "confirmed" } }],
  "media_analysis": null,
  "limits": ["…"],
  "advice": { "level": "verify_source", "text": "…" },
  "trace": { "provider": "meta", "model": "muse-spark-1.3", "search_calls": 3, "budget_used": 0.12 }
}
```

`stance` vaut `supports`, `contradicts` ou `context`. Extraits courts uniquement. `advice.level` : `verify_source`, `ask_confirmation`, `avoid_sharing`.

## 8. LLMProvider et Meta

> **Le détail des agents (contrats, appels, prompts, contrôles, erreurs, tâches A-01 à A-09) est dans [`AGENTS.md`](AGENTS.md).** Cette section n'en donne que le résumé.

Interface unique : `generate_json`, `generate_text`, `grounded_search` (réponse, citations, **résultats bruts**), `describe_image`. Implémentations : `MetaProvider`, `FakeProvider` (réponses enregistrées, `MOCK_PROVIDER=1`), `FallbackProvider` (à désigner).

Points de la documentation Meta à respecter :
- URL `https://api.meta.ai/v1`, SDK OpenAI compatible, modèle `muse-spark-1.3` en **mode Standard** (jamais `-contributor` pour du contenu utilisateur).
- Recherche : outil `web_search` sur `/v1/responses` uniquement, avec `include: ["web_search_call.results"]` ; citations en annotations `url_citation`.
- Le modèle décide de chercher : vérifier la présence d'un appel de recherche, relancer une fois, sinon `unverifiable`.
- Une affirmation par requête (la recherche multi-étapes est moins fiable) ; `max_output_tokens` d'au moins 4 000.
- Sorties JSON : Chat Completions avec `response_format` `json_schema` ; recherche : Responses API. Les deux surfaces ne sont jamais mélangées.
- Format `strict`, coûts et latence (≈ 20 à 30 s par recherche selon un test tiers) : **à confirmer** par les tests de fumée A-01.

## 9. Garde-fous

Entrée ≤ 8 000 caractères ; 3 affirmations ; 2 recherches par affirmation ; 3 runs simultanés ; run limité à 180 s et 0,50 USD ; 20 soumissions par heure et par utilisateur ; image ≤ 5 Mo. Le backend **ne télécharge aucune URL** (elle est transmise à la recherche). Le contenu soumis et les pages web sont traités comme données non fiables ; toute sortie est validée par schéma ; les agents n'ont aucun outil à effet de bord. Conservation 7 jours ; journaux sans contenu intégral ; aucun secret dans le dépôt.

## 10. Tâches Backend

| ID | Tâche | Prio | Est. | Dépend de | Critère d'acceptation |
|---|---|---|---|---|---|
| B-01 | Squelette API, Compose, `/health` | P0 | 2 h | — | `docker compose up` démarre api, db, web |
| B-02 | Modèle de données et migrations | P0 | 2 h | B-01 | Toutes les tables créées par Alembic |
| B-03 | Authentification : register, login, logout, `/auth/me`, sessions | P0 | 3 h | B-02 | Cookie HttpOnly, limite de connexion, tests |
| B-04 | Dépendance `current_user`, filtre par propriétaire, erreurs uniformes, limites de débit | P0 | 1,5 h | B-03 | Accès à la ressource d'un autre utilisateur : 404 |
| B-05 | `LLMProvider`, `MetaProvider`, `FakeProvider` ; tests de fumée Meta (A-01, A-02) | P0 | 4 h | — | JSON, recherche avec résultats bruts, citations, coût et latence mesurés |
| B-06 | Agents : extraction, recherche, contrôle V0, verdict, rapport (A-03 à A-07) | P0 | 8 h | B-05 | Preuve v1 valide sur 5 cas |
| B-07 | `RunManager`, `EventBus`, `trace_events`, reprise au démarrage, orchestrateur (A-08) | P0 | 5 h | B-02 | Arrêt simulé → `failed/interrupted` |
| B-08 | Endpoints soumissions, runs, historique paginé, reports | P0 | 3 h | B-04, B-07 | Conformes à la section 5 |
| B-09 | Flux SSE avec rejeu, maintien de connexion, config Nginx | P0 | 2,5 h | B-07 | Rechargement en cours de run : rien n'est perdu |
| B-10 | Tests pytest (auth, propriété, agents sur `FakeProvider`, SSE) | P0 | 2 h | B-08 | Verts en intégration continue |
| B-11 | Durcissement et runbook de démo (run de secours enregistré) | P0 | 2 h | B-09 | Démo rejouable en `MOCK_PROVIDER=1` |
| B-12 | Profil : `PATCH /me`, mot de passe, suppression de compte | P1 | 2 h | B-03 | Suppression efface aussi les données liées |
| B-13 | Image : validation, analyse, cohérence avec la légende | P1 | 4 h | B-06 | Aucune accusation de falsification |
| B-14 | Évaluation : 24 cas, script, rapport | P1 | 3 h | B-06 | Accord des verdicts, validité des citations, latence, coût |
| B-15 | Purge de conservation, `DELETE /runs/{id}` | P1 | 1,5 h | B-08 | Données expirées supprimées |
| B-16 | `FallbackProvider` | P1 | 2 h | B-05 | Mêmes tests de contrat verts |

Total P0 : environ 35 h. **Chemin critique** : B-05 → B-06 → B-08 → B-11.

## 11. Définition de terminé (Beta)

Un utilisateur crée un compte, soumet un texte, suit l'enquête en direct, ouvre une Preuve dont chaque source est consultable et contrôlée, puis la retrouve dans son historique. Un autre utilisateur ne peut pas y accéder. La démo de secours fonctionne sans clé Meta.
