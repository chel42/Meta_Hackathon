# Runbook de démonstration VERA

Mode simulé (`MOCK_PROVIDER=1`) : aucune clé Meta n’est requise.

## Démarrage

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Vérifications :

- Application : http://localhost:8080
- Santé : `GET http://localhost:8080/api/v1/health` → `{"status":"ok"}`
- Docs : http://localhost:8080/api/docs

## Parcours de démo

1. `POST /api/v1/auth/register` avec e-mail et mot de passe (≥ 10 caractères).
2. `POST /api/v1/submissions` `{ "type": "text", "content": "Paris est la capitale de la France." }`.
3. Suivre `GET /api/v1/runs/{run_id}/stream` (SSE).
4. Ouvrir `GET /api/v1/reports/{report_id}`.
5. Vérifier l’historique `GET /api/v1/runs`.

Collection Postman : `docs/postman/vera.postman_collection.json`.

## Récupération après échec

| Symptôme | Action |
|---|---|
| `/health` ne répond pas | `docker compose logs api` puis `docker compose up --build` |
| Base indisponible | attendre le healthcheck Postgres, relancer `api` |
| Run resté `running` après crash | au redémarrage il passe en `failed` / `interrupted` |
| Cookie rejeté | vérifier `COOKIE_SECURE=0` en HTTP local |
| Démo sans Meta | conserver `MOCK_PROVIDER=1` |

Les journaux n’écrivent pas le contenu intégral ni les secrets. Les mots de passe et jetons sont stockés uniquement sous forme de hash.
