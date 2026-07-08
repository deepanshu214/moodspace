from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "MoodSpace Backend"
    
    # JWT Auth Settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # In production, use a secure random key
    ALGORITHM: str = "HS256" # Simple standard JWT for dev, production uses RS256 with AWS KMS per specs
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Database Settings
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/moodlens"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
