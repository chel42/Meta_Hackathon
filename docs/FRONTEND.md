# TRAUNES AI — Frontend (Beta)

Expo (React Native Web) · Expo Router · TypeScript. Le frontend fourni dans `meta-hackathon-4-nov-2026-05-54-31/apps/web` est repris comme référence visuelle et fonctionnelle ; son export Web est servi par Nginx. Échéance du dépôt : 5 nov. 2026, 02h00 UTC (à reconfirmer). Tâches **P0** (indispensable) et **P1**.

### État de la reprise

Les écrans, composants, thèmes et assets du frontend de référence sont présents dans `apps/web`. Cette version source est une démonstration : l'authentification, les vérifications et plusieurs espaces utilisent des données simulées et `localStorage`. Elle n'est pas encore connectée aux routes métier de l'API ; les critères d'intégration API et de session ci-dessous restent à réaliser avant la Beta.

Le frontend fourni contient aussi des espaces hors périmètre Beta (Académie EMI, communauté, quiz, carte et badges). Ils sont conservés pour respecter la demande de reprise complète, sans remplacer le périmètre fonctionnel P0/P1.

## 1. Périmètre

- **P0** : inscription, connexion, déconnexion, nouvelle vérification, progression en direct, preuve TRAUNES AI, historique.
- **P1** : profil et paramètres complets, envoi d'image, partage.
- **Hors Beta** : mot de passe oublié, vérification d'e-mail, mode sombre, application native.

## 2. Écrans

| Route | Accès | Contenu | Prio |
|---|---|---|---|
| `/login`, `/register` | Public | Formulaires, erreurs par champ | P0 |
| `/` | Connecté | Nouvelle vérification : onglets Texte et Lien, compteur (8 000 caractères max), langue, 3 exemples préremplis | P0 |
| `/runs/[runId]` | Connecté | Progression en direct | P0 |
| `/reports/[reportId]` | Connecté | Preuve TRAUNES AI | P0 |
| `/historique` | Connecté | Liste paginée, filtre par statut, ouverture, suppression | P0 |
| `/profil` | Connecté | Identité, statistiques, préférences, sécurité, zone sensible | P1 |

Navigation : barre latérale sur ordinateur, barre d'onglets sur mobile (Nouvelle vérification, Historique, Profil).

## 3. Session et accès — cible Beta

Les règles ci-dessous décrivent le comportement attendu avant la Beta ; la démonstration actuellement reprise n'est pas encore connectée à l'API.
- La session est un **cookie HttpOnly** posé par l'API. Le client n'en lit jamais le contenu et n'y stocke aucun jeton.
- Toutes les requêtes utilisent `credentials: 'include'`. En production, Nginx sert le Web et `/api` sur la même origine.
- Au démarrage, `AuthProvider` appelle `GET /auth/me` : utilisateur connu, ou redirection vers `/login?next=…`.
- Toute réponse 401 vide le cache de requêtes et renvoie vers `/login`. La déconnexion appelle `POST /auth/logout`.
- Le flux SSE passe par le même cookie ; aucun jeton dans l'URL.

## 4. Design system

| Élément | Valeur |
|---|---|
| Primaire | `#0F766E` (teal), foncé `#115E59` |
| Fond, surface, bordure | `#F5F8FA`, `#FFFFFF`, `#E2E8F0` |
| Texte, texte secondaire | `#172B3A`, `#475569` |
| Verdicts | Confirmée `#15803D` · Contredite `#B91C1C` · Non vérifiable `#475569` |
| Limites (alerte douce) | texte `#B45309` sur `#FFFBEB` |
| Typographie | Police système ; tailles 12, 14, 16, 20, 28 |
| Espacement et rayons | Espacements définis par écran ; rayons 6, 8, 12, 16 et pill |

Règles : chaque verdict a une **icône et un libellé**, jamais la couleur seule ; contraste AA à vérifier à l'implémentation ; cibles tactiles ≥ 44 px ; « vrai » et « faux » n'apparaissent nulle part. Libellés : « Confirmée par les éléments disponibles », « Contredite par les éléments disponibles », « Non vérifiable ». Les couleurs et rayons proviennent de `apps/web/src/theme/colors.ts`.

## 5. Composants

`AppShell`, `TraunesAIHeroEngine`, `RunTimeline`, `ClaimCard`, `VerdictBadge`, `SourceCard`, `LimitsPanel`, `AdviceCallout`, `StatCard`, `ErrorState`, `EmptyState` et `TraunesAILogo`.

## 6. Écrans clés

**Progression.** Six étapes avec durée à la fin de chaque une. Dès `claims.extracted`, une `ClaimCard` par affirmation ; le compteur de sources monte à chaque `source.found` ; le verdict apparaît à `claim.verdict`. À `report.ready`, bouton « Voir la Preuve » puis navigation. À `run.failed`, `ErrorState` avec « Réessayer ». Un rechargement rouvre le flux depuis le début (l'API rejoue les événements).

**Preuve TRAUNES AI.** Ordre : contenu examiné et date, synthèse (« 3 affirmations : 1 confirmée, 1 contredite, 1 non vérifiable »), une section par affirmation (verdict, justification, éléments favorables, éléments contradictoires, limites), analyse du média (P1, avec « provenance non évaluée »), liste des sources, **limites générales toujours visibles**, conseil, traçabilité repliable. Une source `not_confirmed` ou `unreachable` porte le badge « Source non confirmée » et n'est jamais présentée comme preuve ferme. Liens externes en `rel="noopener noreferrer"`, schémas http et https seulement.

**Historique.** Liste paginée par curseur : extrait, date, statut, pastilles de verdicts. Suppression avec confirmation. État vide avec lien vers la première vérification.

**Profil (P1).** Nom affiché, e-mail, langue, statistiques (nombre de vérifications, répartition des verdicts), changement de mot de passe, déconnexion, suppression du compte avec confirmation explicite.

## 7. Intégration API

- **Cible non encore implémentée dans la reprise du frontend source :** générer les types depuis l'OpenAPI du backend (`/api/openapi.json`), envoyer les formulaires à l'API et traiter les réponses comme `unknown` jusqu'à validation de leur forme. Les règles suivantes sont également des critères d'intégration à venir.
- `EXPO_PUBLIC_API_BASE` définit le préfixe API. En production, la valeur par défaut `/api/v1` passe par le proxy Nginx de même origine ; en développement, Expo utilise `http://localhost:8000/api/v1` par défaut.
- Toutes les requêtes utilisent `credentials: 'include'` ; le cookie HttpOnly n'est jamais lu ni stocké par le client.
- `useRunStream(runId)` : `EventSource` du navigateur, reconnexion avec `Last-Event-ID`, puis repli sur `GET /runs/{id}` toutes les 2 s après trois échecs. Un événement inconnu est ignoré.
- Correspondance des erreurs : 401 → connexion ; 409 → « Cette adresse est déjà utilisée » ; 422 → message sous le champ ; 429 → « Trop de demandes, réessayez dans quelques minutes » ; 503 ou `run.failed` → `ErrorState`.
- Développement sans backend : `MOCK_PROVIDER=1` côté API, ou fixtures dans `src/mocks/`.

## 8. Sécurité côté client

La version source utilise `localStorage` pour conserver des données de démonstration. Avant la Beta, les données de compte et de vérification doivent être remplacées par les réponses API et ne pas persister localement. Aucun secret ne doit être ajouté au bundle ; les textes de l'API doivent être rendus en texte brut, jamais en HTML, et aucun traceur tiers ne doit être ajouté.

## 9. Tâches Frontend

| ID | Tâche | Prio | Est. | Dépend de | Critère d'acceptation |
|---|---|---|---|---|---|
| F-01 | Initialiser Expo Router, thème, build Docker et Nginx | P0 | 2 h | B-01 | `docker compose up` sert l'application |
| F-02 | Client API typé, gestion du 401, fixtures | P0 | 2 h | B-08 | Types générés, mocks disponibles |
| F-03 | Inscription, connexion, déconnexion, `AuthProvider`, garde de routes | P0 | 3 h | F-02, B-03 | Page protégée inaccessible sans session |
| F-04 | `AppShell` et navigation | P0 | 1,5 h | F-01 | Correct sur mobile et ordinateur |
| F-05 | Écran de nouvelle vérification | P0 | 2,5 h | F-03 | POST réussi, erreurs 422 affichées |
| F-06 | Progression : `useRunStream`, timeline, cartes d'affirmations | P0 | 5 h | F-05, B-09 | Survit à un rechargement et à une coupure |
| F-07 | Preuve TRAUNES AI et composants associés | P0 | 5 h | F-02 | Tous les blocs de la section 6 présents |
| F-08 | Historique : liste, pagination, filtre, suppression | P0 | 3 h | F-03, B-08 | Seules les vérifications de l'utilisateur apparaissent |
| F-09 | États d'erreur, vide, chargement ; accessibilité | P0 | 2 h | F-06, F-07 | Tous les cas de la section 7 gérés |
| F-10 | Profil et paramètres | P1 | 3 h | F-03, B-12 | Modification, mot de passe, suppression fonctionnels |
| F-11 | Envoi d'image : aperçu, compression, validation | P1 | 3 h | F-05, B-13 | Observations affichées dans la Preuve |
| F-12 | Tests : composants, reducer SSE, parcours de bout en bout | P1 | 2 h | F-07 | Verts en intégration continue |

Total P0 : environ 26 h. **Chemin critique** : F-03 → F-05 → F-06. Le Frontend développe sur fixtures sans attendre le Backend.

## 10. Définition de terminé (Beta)

Parcours complet sur Chrome ordinateur et mobile : inscription, vérification, progression en direct, Preuve avec limites visibles et sources ouvrables, retrouvée dans l'historique, puis déconnexion. Les trois verdicts s'affichent avec icône et libellé. Une page protégée redirige vers la connexion.
