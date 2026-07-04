from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.config.database import get_db

app = FastAPI(title="MoodSpace API", description="Stage 1 Backend Service", version="1.0.0")

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
