import os
import logging

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

load_dotenv()

logger = logging.getLogger(__name__)

# Default to the docker-compose settings
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://moodlens:dev_password@localhost:5432/moodlens")

# The default DB is a remote Supabase pooler. Without a timeout, an unreachable
# host blocks each request for the OS TCP timeout (~75s) and the app appears hung.
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "5"))

_engine_kwargs = {}
if make_url(DATABASE_URL).get_backend_name() == "postgresql":
    _engine_kwargs = {
        "connect_args": {"connect_timeout": DB_CONNECT_TIMEOUT},
        "pool_pre_ping": True,           # drop connections the pooler has closed
        "pool_timeout": DB_CONNECT_TIMEOUT,
        "pool_recycle": 300,
    }

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database() -> bool:
    """Return whether the database answers within DB_CONNECT_TIMEOUT. Never raises."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError:
        logger.warning("Database health check failed", exc_info=True)
        return False
