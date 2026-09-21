import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from src.config.database import check_database
from src.models import base
from src.api.router import api_router
from src.api.error_handlers import register_error_handlers
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

# Create tables (In a real app, use Alembic migrations instead, which we are using)
# base.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoodSpace API", description="Stage 1 Backend Service", version="1.0.0")

# Expo web serves from its own origin (localhost:8081/8082/19006), so browsers enforce
# CORS; native apps don't. Set CORS_ORIGINS (comma-separated) to lock this down in prod.
_cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=None if _cors_origins else r"http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=False,  # auth is a Bearer header, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Uploaded keepsakes (photos, voice notes) are served straight off disk.
from src.services.mood_service import MEDIA_ROOT

MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")

register_error_handlers(app)

@app.get("/health")
def health_check():
    # Details go to the server log only; str(exc) would expose the DB host and user.
    if check_database():
        return {"status": "ok", "database": "connected"}
    return JSONResponse(
        status_code=503,
        content={"status": "degraded", "database": "unreachable"},
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to MoodSpace API"}
