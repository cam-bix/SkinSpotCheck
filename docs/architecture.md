# Architecture

SkinSpotCheck uses a mobile client, API backend, PostgreSQL database, local development file storage, and a replaceable ML inference layer.

## Components

- Mobile: Expo React Native TypeScript app focused on Android.
- Backend: FastAPI application with OpenAPI docs, JWT auth, validation, rate limiting, and audit logs.
- Database: PostgreSQL stores users, scan metadata, and audit events.
- Storage: local filesystem storage for development. The storage service exposes a small interface so cloud object storage can replace it later.
- ML: placeholder inference function in `ml/` with a stable `predict_skin_spot(image) -> prediction` interface.

## Data Flow

1. User authenticates from the mobile app.
2. User captures or uploads a skin spot photo.
3. Mobile sends the image as multipart form data to `POST /scan` with a bearer token.
4. Backend validates the content type, size, and image structure.
5. Backend stores the file locally, runs placeholder inference, records metadata, and returns a risk screening result.

All scan results include the statement: `This is not a diagnosis.`
