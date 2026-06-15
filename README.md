# SkinSpotCheck

SkinSpotCheck is an Android-first Expo React Native app with a FastAPI backend for rough skin spot risk screening.

Important: SkinSpotCheck is not a medical device and does not provide a diagnosis. Users should see a doctor or dermatologist for spots that are concerning, changing, painful, bleeding, or unusual.

## Monorepo Layout

- `mobile/` - React Native Expo Android app written in TypeScript
- `backend/` - FastAPI backend with JWT auth, PostgreSQL models, scan endpoints, storage, and tests
- `ml/` - Replaceable placeholder ML inference interface and optional PyTorch adapter scaffold
- `docs/` - Architecture, setup, API, and safety documentation

## Local Setup

1. Copy `.env.example` to `.env` and replace placeholder values.
2. Start PostgreSQL and Redis with `docker compose up -d`, or update `DATABASE_URL` and `REDIS_URL`.
3. Run the backend from `backend/`.
4. Run the mobile app from `mobile/` with Expo for Android.

See [docs/setup.md](docs/setup.md) for step-by-step instructions.

## Development Checks

```bash
python -m pytest backend/tests
python -m ruff check backend ml
cd mobile && npm run typecheck
```

CI runs these same checks on pushes and pull requests. Keep `.env` local only; use GitHub Actions Secrets for deployment credentials or stronger CI secrets.

## Safety Position

The initial ML pipeline is intentionally conservative and placeholder-only. It does not claim medical accuracy. See [docs/ml_safety.md](docs/ml_safety.md).

## Repository Owner

Planned GitHub owner: `cam-bix`.
