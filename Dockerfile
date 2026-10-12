# MoodSpace API. Runs anywhere that takes a container: Fly.io, Render,
# Railway, Cloud Run, App Runner.
#
# Required environment variables at runtime (never baked into the image):
#   DATABASE_URL   Supabase pooler connection string
#   SECRET_KEY     openssl rand -hex 32 — signs JWTs and derives the AES key
#                  for notes and messages, so it must stay stable across
#                  deploys or existing encrypted content becomes unreadable
#   CORS_ORIGINS   comma-separated web origins, e.g. https://moodspace.app
#   MEDIA_ROOT     optional; point at a mounted volume (see note below)
FROM python:3.12-slim

# psycopg2 and cryptography need a compiler toolchain and libpq headers; the
# build deps come back out in the same layer so they don't ship in the image.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv

COPY backend/requirements.txt ./requirements.txt
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/ ./backend/
COPY app/ ./app/

# Uploads are written to disk. On a platform with an ephemeral filesystem this
# directory vanishes on every redeploy — mount a volume here, or move uploads
# to object storage, before relying on it in production.
ENV MEDIA_ROOT=/srv/media
RUN mkdir -p /srv/media

# Run as a non-root user; it needs to own the upload directory.
RUN useradd --create-home --uid 10001 moodspace \
    && chown -R moodspace:moodspace /srv/media
USER moodspace

EXPOSE 8000

# Most hosts inject $PORT. Migrations are deliberately NOT run here — see
# DEPLOYMENT.md; they belong in a release step so concurrent instances don't
# race each other applying the same revision.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
