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
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| Base de données prévue | PostgreSQL 16, SQLAlchemy 2, Alembic |
| IA | Meta Model API (`muse-spark-1.3`), providers Meta et Fake |
| Infrastructure | Docker Compose, Nginx |

> PostgreSQL, l'authentification et les routes métier sont prévus dans l'architecture, mais ne sont pas encore intégrés au squelette actuel.

## État du projet

Le dépôt contient le squelette de la chaîne d'agents, une page Expo Web et les fichiers Docker. L'API expose uniquement `/api/v1/health`. L'authentification, les modèles et migrations, les routes métier, le flux SSE et les parcours complets restent à développer. Le projet n'est pas prêt pour la production.

## Structure

```text
vera/
├─ apps/
│  ├─ api/                 # API FastAPI, agents, providers et tests
│  └─ web/                 # Client Expo Web
├─ docs/
│  ├─ AGENTS.md            # Agents IA et intégration Meta
│  ├─ BACKEND.md           # Spécifications Backend
│  └─ FRONTEND.md          # Spécifications Frontend
├─ infra/nginx/            # Configuration Nginx
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Démarrer avec Docker

Prérequis : Docker et Docker Compose.

```powershell
git clone <url-du-depot> vera
Set-Location vera
Copy-Item .env.example .env
# Remplacez change-me-local dans POSTGRES_PASSWORD et DATABASE_URL
docker compose up --build
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

## Tests

Depuis `apps\api` :

```powershell
python -m pip install -e ".[dev]"
python -m pytest
```

## Intégration continue

GitHub Actions teste l'API et le Web et construit les images Docker sur les pull requests et les pushes vers `main`. Après une CI réussie sur un push de `main`, le workflow publie le Web sur Netlify et déclenche le déploiement de l'API sur Render.

Pour préparer le déploiement :

1. Importez le Web dans Netlify avec le dépôt ; les paramètres de build sont dans `netlify.toml`. Désactivez les déploiements automatiques Netlify : GitHub Actions publie après les contrôles CI.
2. Créez le service Render depuis `render.yaml`. Pour les appels Meta, ajoutez `MODEL_API_KEY` et passez `MOCK_PROVIDER` à `0`. Configurez `DATABASE_URL` avec Supabase ; le backend n'utilise pas encore PostgreSQL, et les migrations/persistance restent à développer.
3. Créez l'environnement GitHub `production` et ajoutez les secrets `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID` et `RENDER_DEPLOY_HOOK`. Définissez la variable `EXPO_PUBLIC_API_BASE` avec l'URL de l'API Render, terminée par `/api/v1`.

Les étapes de déploiement sont ignorées avec un avertissement tant que leurs secrets ne sont pas définis. Supabase est prévu comme base de données ; aucune connexion applicative ou migration n'est encore implémentée.

Après avoir configuré le remote et poussé `main`, exécutez depuis la racine :

```powershell
.\.github\scripts\protect-main.ps1
```

Le script GitHub CLI exige une pull request et une approbation, rend `API tests`, `Web checks` et `Docker build` obligatoires, et interdit les force-push et la suppression de `main`. Il faut disposer des droits d'administration sur le dépôt GitHub.

Test Meta réel optionnel (consomme des appels API), depuis `apps\api` :

```powershell
$env:MODEL_API_KEY = "..."
python scripts\meta_smoke.py
```

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
