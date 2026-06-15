# Setup

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
copy ..\.env.example ..\.env
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000` and OpenAPI docs at `http://localhost:8000/docs`.

## Database

Create a PostgreSQL database and update `DATABASE_URL` in `.env`.

For local experimentation, tests use SQLite in memory and do not require PostgreSQL.

## Mobile

```bash
cd mobile
npm install
npm run android
```

Android emulator requests to the host backend should use `http://10.0.2.2:8000`.

## Secrets

Never commit `.env` files. Use local `.env` files for development and GitHub Actions Secrets for CI/CD.
