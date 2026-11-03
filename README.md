# VERA

VERA transforme un texte ou un lien en dossier de vérification : affirmations examinées, sources et limites. Il ne rend pas de verdict absolu.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/Web-TypeScript-3178C6?logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Frontend-Expo-000020?logo=expo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED?logo=docker&logoColor=white)
![Meta](https://img.shields.io/badge/Meta-0467DF?logo=meta&logoColor=white)
![Meta AI](https://img.shields.io/badge/Meta%20AI-muse--spark--1.3-0467DF?logo=meta&logoColor=white)

## Stack technique

| Domaine | Technologies |
|---|---|
| Frontend | Expo, Expo Router, React Native Web, TypeScript |
| Backend | FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2, Alembic |
| Base de données | PostgreSQL 16, SQLite pour les tests locaux |
| IA | Meta Model API (`muse-spark-1.3`), `MetaProvider`, `FakeProvider`, `FallbackProvider` |
| Infrastructure | Docker Compose, Nginx |

## État de validation backend (3 novembre 2026)

Le backend a été exécuté dans Docker avec PostgreSQL et Nginx en mode `FakeProvider`.

- Routes health et docs via Nginx : HTTP 200.
- Migration PostgreSQL `0001_initial`, tables applicatives et persistance après redémarrage vérifiées.
- Tests backend : **35 passés**.
- Newman : **28 requêtes, 124 assertions, 0 échec** au dernier passage.
- Évaluation FakeProvider des 24 cas : **20/24** d'accord strict. Les contrôles structurels des citations et la cohérence des verdicts sont 24/24 ; les données simulées ne prouvent pas l'exactitude factuelle.

Les appels Meta réels ne sont pas encore validés. Avant de conclure sur B-05, B-13, B-14 ou B-16, exécuter les essais réels avec des clés autorisées. Le Web Expo reste une page d'accueil, sans les parcours UI Beta.

Le statut détaillé B-01 à B-16 et les commandes de validation sont dans [`docs/BACKEND.md`](docs/BACKEND.md).

## Structure

```text
vera/
├─ apps/
│  ├─ api/                 # API FastAPI, agents, providers et tests
│  └─ web/                 # Client Expo Web
├─ docs/
│  ├─ AGENTS.md            # Agents IA et intégration Meta
│  ├─ BACKEND.md           # Spécifications Backend
│  ├─ DEMO_RUNBOOK.md      # Démonstration du backend
│  └─ FRONTEND.md          # Spécifications Frontend
├─ infra/nginx/            # Configuration Nginx
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Démarrer avec Docker

Prérequis : Docker Desktop démarré et Docker Compose. Après avoir copié `.env.example`, configurez un mot de passe PostgreSQL local robuste et utilisez le même dans `DATABASE_URL`.

```powershell
git clone https://github.com/chel42/Meta_Hackathon.git vera
Set-Location vera
Copy-Item .env.example .env
docker compose config
docker compose up --build -d
docker compose ps
```

| Service | Adresse |
|---|---|
| Application | http://localhost:8080 |
| Documentation API | http://localhost:8080/api/docs |
| Santé API | http://localhost:8080/api/v1/health |

Le mode simulé (`MOCK_PROVIDER=1`) est activé par défaut ; aucune clé Meta n'est requise pour démarrer.

## Développement local

Dans un terminal, depuis la racine du dépôt :

```powershell
Set-Location apps\api
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --reload --port 8000
```

Dans un autre terminal :

```powershell
Set-Location apps\web
npm install
npm run web
```

## Tests backend et Postman

Depuis `apps\api` :

```powershell
python -m pip install -e ".[dev]"
python -m pytest
```

Dernière exécution locale : **35 passed**. Depuis la racine du dépôt, après démarrage de Docker :

```powershell
npx newman run docs/postman/vera.postman_collection.json --reporters cli
```

Dernière exécution Newman : **28 requêtes, 124 assertions, 0 échec**.

Évaluation reproductible en mode simulé, depuis `apps\api` :

```powershell
$env:MOCK_PROVIDER = "1"
python scripts\evaluate.py
```

Le dernier résultat FakeProvider est 20/24 d'accord strict. Il valide le pipeline simulé, pas la véracité des résultats Meta.

## Intégration continue

GitHub Actions teste l'API et le Web et construit les images Docker sur les pull requests et les pushes vers `main`. Pour une PR interne vers `main`, les trois jobs activent automatiquement la fusion squash : GitHub fusionne dès que les contrôles requis sont verts et que les autres règles de branche sont satisfaites. Les PR provenant d'un fork ne sont pas fusionnées automatiquement. Les pushes directs, force-push et suppressions de `main` restent bloqués. Après une fusion sur `main`, le workflow publie le Web sur Netlify et déclenche le déploiement de l'API sur Render.

Pour préparer le déploiement :

1. Importez le Web dans Netlify avec le dépôt ; les paramètres de build sont dans `netlify.toml`. Désactivez les déploiements automatiques Netlify : GitHub Actions publie après les contrôles CI.
2. Créez le service Render depuis `render.yaml`. Configurez `MODEL_API_KEY` et `MOCK_PROVIDER=0` pour les appels Meta, ainsi qu'une base PostgreSQL accessible par `DATABASE_URL`.
3. Créez l'environnement GitHub `production` et ajoutez les secrets `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` et `RENDER_DEPLOY_HOOK`. Définissez la variable `EXPO_PUBLIC_API_BASE` avec l'URL de l'API Render, terminée par `/api/v1`.

Les étapes de déploiement sont ignorées avec un avertissement tant que leurs secrets ne sont pas définis.

Après avoir configuré le remote et poussé `main`, exécutez depuis la racine :

```powershell
.\.github\scripts\protect-main.ps1
```

Le script GitHub CLI exige une pull request, rend `API tests`, `Web checks` et `Docker build` obligatoires, permet la fusion automatique sans approbation obligatoire, et interdit les force-push et la suppression de `main`. Il active également l'auto-merge sur le dépôt. Il faut disposer des droits d'administration sur le dépôt GitHub.

Test Meta réel optionnel (consomme des appels API), depuis `apps\api` :

```powershell
$env:MODEL_API_KEY = "..."
$env:MOCK_PROVIDER = "0"
python scripts\meta_smoke.py
```

Le script écrit un rapport dans `eval\results\meta-smoke.json` et renvoie un code non nul si ses critères obligatoires échouent. Les runs à trois affirmations, l'analyse d'image et la confirmation de politique régionale sont des contrôles optionnels explicites ; ils peuvent consommer des appels supplémentaires.

## Documentation

- [Agents IA et intégration Meta](docs/AGENTS.md)
- [Spécifications Backend](docs/BACKEND.md)
- [Spécifications Frontend](docs/FRONTEND.md)

## Bonnes pratiques

- Créer des branches courtes et ciblées : `feat/B-05-llm-provider`, `fix/health-check`.
- Utiliser des commits conventionnels : `feat:`, `fix:`, `docs:`, `test:`.
- Garder chaque pull request centrée sur un ticket ; ajouter ou mettre à jour les tests et la documentation concernés.
- Lancer les tests et validations pertinentes avant d'ouvrir une pull request.
- Ne jamais committer de secrets ou de données personnelles ; utiliser les variables d'environnement et `.env.example`.
- Considérer le contenu soumis et les résultats web comme des données non fiables ; ne pas soumettre d'informations sensibles à un fournisseur externe.
