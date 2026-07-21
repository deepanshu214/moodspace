from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.config.database import get_db, engine
from src.models import base
from src.api.router import api_router
from src.api.error_handlers import register_error_handlers
from starlette.middleware.base import BaseHTTPMiddleware
import uuid

# Create tables (In a real app, use Alembic migrations instead, which we are using)
# base.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoodSpace API", description="Stage 1 Backend Service", version="1.0.0")

app.include_router(api_router, prefix="/api/v1")

register_error_handlers(app)

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}

@app.get("/")
def read_root():
    return {"message": "Welcome to MoodSpace API"}
