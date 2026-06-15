# API

FastAPI exposes interactive OpenAPI docs at `/docs`.

## Endpoints

- `GET /health` - service health check
- `POST /auth/register` - create an account
- `POST /auth/login` - return a JWT access token
- `POST /scan` - upload an image and receive a rough risk-screening result
- `GET /scan/history` - list the authenticated user's scan metadata

All authenticated endpoints use `Authorization: Bearer <token>`.
