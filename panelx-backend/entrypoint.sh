#!/bin/bash
set -e

echo "==> Waiting for database to be ready..."
# alembic itself will fail cleanly if DB is unreachable; docker-compose
# healthcheck already ensures postgres is up before this container starts.

echo "==> Running Alembic migrations..."
alembic upgrade head

echo "==> Starting PanelX API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
