# Security

## Secrets

Secrets and connection strings must come from environment variables. Do not hardcode JWT secrets, database URLs, API keys, ML keys, or cloud storage credentials in application code.

Local development uses `.env`; CI/CD uses GitHub Actions Secrets.

`DATABASE_URL` and `JWT_SECRET` are required backend settings. The backend should fail to start if either is missing.

## API Controls

- JWT bearer tokens protect scan endpoints.
- Auth and scan endpoints are rate limited with SlowAPI.
- Redis-backed rate limiting is used when `REDIS_URL` is configured.
- Local development falls back to in-memory rate limiting.
- CORS is restricted to development origins from `CORS_ORIGINS`.
- Uploads are limited by content type, size, and image verification.
- Logs avoid raw image data and sensitive request content.

## Medical Safety

The app must always show that SkinSpotCheck is not a diagnosis. Users should see a doctor or dermatologist for concerning, changing, painful, bleeding, or unusual spots.
