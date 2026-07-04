import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Default to the docker-compose settings
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://moodlens:dev_password@localhost:5432/moodlens")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
