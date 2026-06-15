# Setup

## Backend

```bash
docker compose up -d
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements-dev.txt
copy ..\.env.example ..\.env
$env:PYTHONPATH='..'
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000` and OpenAPI docs at `http://localhost:8000/docs`.

From the repo root, backend checks can be run with:

```bash
python -m ruff check backend ml
python -m pytest backend/tests
```

## Database

Create a PostgreSQL database and update `DATABASE_URL` in `.env`.

Backend tests use SQLite and do not require PostgreSQL.

## Redis Rate Limiting

Set `REDIS_URL=redis://localhost:6379/0` in `.env` to use Redis-backed rate limiting. If `REDIS_URL` is blank, the backend falls back to in-memory rate limiting for local development.

## Mobile

```bash
cd mobile
npm install
npm run android
```

Android emulator requests to the host backend should use `http://10.0.2.2:8000`.
Run `npm run typecheck` before committing mobile changes.

## Secrets

Never commit `.env` files. Use local `.env` files for development and GitHub Actions Secrets for CI/CD.

Recommended GitHub repository secrets:

- `JWT_SECRET`
- Production `DATABASE_URL`, if deployment workflows are added later
- Cloud object storage credentials, if cloud storage is added later
