from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.seed import seed_initial_data
from app.websocket.routes import ws_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting %s …", settings.APP_NAME)
    async with AsyncSessionLocal() as db:
        await seed_initial_data(db)
    logger.info("%s is ready.", settings.APP_NAME)
    yield
    logger.info("%s shutting down.", settings.APP_NAME)


# ── Application factory ───────────────────────────────────────────────────────
def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="DWG Processing Platform – Backend API",
        version="1.0.0",
        lifespan=lifespan,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    # Tighten allowed origins in production via an env list
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_STR)
    app.include_router(ws_router)

    # ── Health check ──────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"], include_in_schema=False)
    async def health() -> JSONResponse:
        return JSONResponse({"status": "healthy", "service": settings.APP_NAME})

    return app


app = create_application()
