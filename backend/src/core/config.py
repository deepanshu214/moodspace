from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# This value shipped as the default in a public repository, so it must be
# treated as compromised forever. It is the FastAPI tutorial's example key.
# Anything it ever signed or encrypted should be considered readable by anyone.
LEAKED_SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    PROJECT_NAME: str = "MoodSpace Backend"

    # JWT Auth Settings.
    #
    # No default: SECRET_KEY signs every access token AND derives the AES-256
    # key that encrypts journal notes and messages (see core/security.py). A
    # fallback default would mean a misconfigured deploy silently runs on a
    # guessable key instead of refusing to start, so this is required.
    SECRET_KEY: str
    ALGORITHM: str = "HS256" # Simple standard JWT for dev, production uses RS256 with AWS KMS per specs
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Database Settings
    DATABASE_URL: str # Enforces that this must be provided via environment variable

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("SECRET_KEY")
    @classmethod
    def reject_unsafe_secret_key(cls, value: str) -> str:
        if value == LEAKED_SECRET_KEY:
            raise ValueError(
                "SECRET_KEY is the example key that was committed to this public "
                "repository. Generate a fresh one with `openssl rand -hex 32`. "
                "Note that rotating it invalidates existing tokens and makes "
                "previously encrypted notes and messages unreadable."
            )
        if len(value) < MIN_SECRET_KEY_LENGTH:
            raise ValueError(
                f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters. "
                "Generate one with `openssl rand -hex 32`."
            )
        return value


settings = Settings()
