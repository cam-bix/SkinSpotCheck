# SkinSpotCheck

SkinSpotCheck is an Android-first Expo React Native app with a FastAPI backend for rough skin spot risk screening.

Important: SkinSpotCheck is not a medical device and does not provide a diagnosis. Users should see a doctor or dermatologist for spots that are concerning, changing, painful, bleeding, or unusual.

## Monorepo Layout

- `mobile/` - React Native Expo Android app written in TypeScript
- `backend/` - FastAPI backend with JWT auth, PostgreSQL models, scan endpoints, storage, and tests
- `ml/` - Replaceable placeholder ML inference interface
- `docs/` - Architecture, setup, API, and safety documentation

## Local Setup

1. Copy `.env.example` to `.env` and replace placeholder values.
2. Start PostgreSQL locally and create the `skinspotcheck` database/user, or update `DATABASE_URL`.
3. Run the backend from `backend/`.
4. Run the mobile app from `mobile/` with Expo for Android.

See [docs/setup.md](docs/setup.md) for step-by-step instructions.

## Safety Position

The initial ML pipeline is intentionally conservative and placeholder-only. It does not claim medical accuracy. See [docs/ml_safety.md](docs/ml_safety.md).

## Repository Owner

Planned GitHub owner: `cam-bix`.
