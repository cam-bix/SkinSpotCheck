import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.rate_limit import limiter
from app.routers import auth, scan
from app.schemas import HealthResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skinspotcheck")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="SkinSpotCheck API",
        description="Rough skin spot risk screening API. This is not a diagnosis.",
        version="0.1.0",
    )
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )

    Base.metadata.create_all(bind=engine)

    @app.exception_handler(RateLimitExceeded)
    def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded."})

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled server error")
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok")

    app.include_router(auth.router)
    app.include_router(scan.router)
    return app


app = create_app()
