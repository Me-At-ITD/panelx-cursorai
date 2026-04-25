FROM python:3.12-slim

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Make entrypoint executable (Windows line endings are stripped by bash itself)
RUN sed -i 's/\r//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 8000

# The entrypoint runs `alembic upgrade head` then starts uvicorn.
# Worker/Beat services override this CMD with their own celery command.
ENTRYPOINT ["./entrypoint.sh"]
