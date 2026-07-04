# MoodSpace Backend - Stage 1

Welcome to the backend repository for MoodSpace. This repository contains the foundational infrastructure, including the FastAPI application structure, Dockerized PostgreSQL (with PostGIS and pgvector) and Redis instances, and the complete SQLAlchemy ORM models mapped to Alembic migrations.

## Getting Started

Follow these steps to set up your local development environment.

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/get-started)
- Python 3.10+

### 1. Start the Infrastructure
We use Docker to run our core services (PostgreSQL + Redis).
```bash
docker compose up -d --build
```
*Note: The custom PostgreSQL image compiles `pgvector` and installs `postgis` automatically. It may take a minute or two on the first build.*

### 2. Set Up Python Environment
Create a virtual environment and install the dependencies:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Apply Database Migrations
The initial schema is already generated. Apply it to your local Docker database:
```bash
alembic upgrade head
```

### 4. Verify Setup
Run the development server to verify everything is working:
```bash
uvicorn src.main:app --reload
```
Open [http://localhost:8000/health](http://localhost:8000/health) in your browser. You should see `{"status": "ok", "database": "connected"}`.

## What's Included (Stage 1 Complete)
- **Database Models**: All models (`User`, `MoodEntry`, `Community`, `Conversation`, etc.) are located in `src/models/`.
- **Geospatial & Vector Support**: The `MoodEntry` model natively supports `Geometry(POINT)` and `Vector(1536)` columns.
- **Alembic**: Fully configured in `alembic/env.py` to auto-detect schema changes.

## Next Steps (Stage 2)
The next stage involves building out the Auth & Security modules! 
