# API

FastAPI exposes interactive OpenAPI docs at `/docs`.

## Endpoints

- `GET /health` - service health check
- `POST /auth/register` - create an account
- `POST /auth/login` - return a JWT access token
- `POST /scan` - upload an image and receive a rough risk-screening result
- `GET /scan/history` - list the authenticated user's scan metadata

All authenticated endpoints use `Authorization: Bearer <token>`.

## Scan Response

`POST /scan` returns one of:

- `Low concern`
- `Medium concern`
- `High concern`
- `Unable to analyze`

The placeholder model currently returns `Unable to analyze` with no confidence score. Every result includes `This is not a diagnosis.`

## Upload Validation

The backend accepts JPEG, PNG, and WebP files up to `MAX_UPLOAD_BYTES`. It verifies the image before storage and stores sanitized metadata only.
