# PanelX Backend — Milestone 1
## Complete API Reference & Configuration Guide

---

## Table of Contents

1. [Environment Configuration (.env)](#1-environment-configuration-env)
2. [Quick Start](#2-quick-start)
3. [Authentication Endpoints](#3-authentication-endpoints)
4. [User Endpoints](#4-user-endpoints)
5. [Role & Permission Endpoints](#5-role--permission-endpoints)
6. [Project Endpoints](#6-project-endpoints)
7. [File Endpoints](#7-file-endpoints)
8. [Sync (SFTP) Endpoints](#8-sync-sftp-endpoints)
9. [WebSocket Endpoints](#9-websocket-endpoints)
10. [RBAC Permission Reference](#10-rbac-permission-reference)
11. [Error Response Reference](#11-error-response-reference)

---

## Overview

**PanelX** is a production-grade backend for managing DWG (AutoCAD) files, projects, users, and SFTP synchronization. This document covers **Milestone 1** endpoints.

### Key Features
- ✅ **JWT-based authentication** with access + refresh tokens (15 min + 7 days)
- ✅ **Password management** — forgot/reset workflows with email confirmation
- ✅ **User profile management** — update name, email, profile image
- ✅ **Role-based access control (RBAC)** — 5 predefined roles + custom roles
- ✅ **Project management** — create, list, manage projects
- ✅ **File handling** — upload/download DWG files to MinIO S3
- ✅ **SFTP sync** — automated DWG synchronization from SFTP servers
- ✅ **Real-time notifications** — WebSocket live updates

### Architecture
- **Framework:** FastAPI 0.111.0 (Python 3.12+)
- **Database:** PostgreSQL 16 + PostGIS (geospatial extensions)
- **Cache/Queue:** Redis 7 (Celery broker + backend)
- **Storage:** MinIO (S3-compatible) or AWS S3
- **Authentication:** JWT (HS256 signing)
- **Email:** SMTP (Gmail, SendGrid, etc.)

## 1. Environment Configuration (.env)

Copy `.env.example` to `.env` and fill in every value before starting the server.

```bash
cp .env.example .env
```

### 1.1 Generate Required Secret Keys

You must generate three separate secret values. Run each command once and paste the output into `.env`.

```bash
# JWT_SECRET_KEY  (used to sign access tokens)
python -c "import secrets; print(secrets.token_hex(32))"

# SECRET_KEY  (general app secret, e.g. for future cookie signing)
python -c "import secrets; print(secrets.token_hex(32))"

# ENCRYPTION_KEY  (Fernet key — encrypts SFTP passwords in the database)
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

> ⚠️ `ENCRYPTION_KEY` must be a **valid Fernet key** (44 base64 chars ending in `=`).  
> Do **not** reuse the same value for `JWT_SECRET_KEY` and `ENCRYPTION_KEY`.

---

### 1.2 Full .env Reference

```dotenv
# ─────────────────────────────────────────────────────────────────────────────
# APPLICATION
# ─────────────────────────────────────────────────────────────────────────────

# Human-readable service name shown in API docs
APP_NAME=PanelX

# "development" | "staging" | "production"
APP_ENV=development

# true  → enables SQLAlchemy query echo and verbose logging
# false → production-safe silent mode
DEBUG=true

# URL prefix for all REST endpoints
API_V1_STR=/api/v1

# ─────────────────────────────────────────────────────────────────────────────
# SECURITY
# ─────────────────────────────────────────────────────────────────────────────

# General app secret (32-byte hex string)
SECRET_KEY=a1b2c3d4e5f6...

# Signs and verifies JWT access tokens (32-byte hex string)
JWT_SECRET_KEY=f6e5d4c3b2a1...

# Algorithm used for JWT signing — do not change unless you know what you are doing
JWT_ALGORITHM=HS256

# How long an access token is valid (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=30

# How long a refresh token is valid (days) — reserved for Milestone 2
REFRESH_TOKEN_EXPIRE_DAYS=7

# Fernet symmetric key — encrypts SFTP passwords stored in the database
# Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Example value (DO NOT USE IN PRODUCTION):
ENCRYPTION_KEY=abc123def456ghi789jkl012mno345pqr678stu=

# ─────────────────────────────────────────────────────────────────────────────
# POSTGRESQL + POSTGIS
# ─────────────────────────────────────────────────────────────────────────────

# Format: postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>
# Local Docker (matches docker-compose.yml defaults):
DATABASE_URL=postgresql+asyncpg://panelx:panelx_password@localhost:5432/panelx_db

# Remote / managed database (e.g. AWS RDS, Supabase):
# DATABASE_URL=postgresql+asyncpg://panelx:StrongPassword@db.example.com:5432/panelx_db

# ─────────────────────────────────────────────────────────────────────────────
# REDIS
# ─────────────────────────────────────────────────────────────────────────────

# Used as Celery broker and optional cache
# Local Docker:
REDIS_URL=redis://localhost:6379/0

# With password (production):
# REDIS_URL=redis://:yourRedisPassword@redis.example.com:6379/0

# ─────────────────────────────────────────────────────────────────────────────
# MINIO / AWS S3
# ─────────────────────────────────────────────────────────────────────────────

# MinIO local (Docker):
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=panelx-files
MINIO_USE_SSL=false

# AWS S3 production — set endpoint to the AWS regional hostname:
# MINIO_ENDPOINT=s3.amazonaws.com
# MINIO_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
# MINIO_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# MINIO_BUCKET_NAME=panelx-prod-files
# MINIO_USE_SSL=true
# AWS_REGION=eu-west-1

AWS_REGION=us-east-1

# ─────────────────────────────────────────────────────────────────────────────
# FILE UPLOAD
# ─────────────────────────────────────────────────────────────────────────────

# Maximum allowed upload size in megabytes (hard limit enforced server-side)
MAX_FILE_SIZE_MB=250

# ─────────────────────────────────────────────────────────────────────────────
# CELERY
# ─────────────────────────────────────────────────────────────────────────────

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# ─────────────────────────────────────────────────────────────────────────────
# ADMIN SEED USER (optional)
# If set, this superuser is created automatically on first boot.
# ─────────────────────────────────────────────────────────────────────────────

ADMIN_EMAIL=admin@panelx.io

# Must meet password policy: 8+ chars, 1 uppercase, 1 digit, 1 special char
ADMIN_PASSWORD=Admin@PanelX1

ADMIN_FULL_NAME=System Administrator
```

### 1.3 Variable Quick Reference

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SECRET_KEY` | ✅ | — | General app secret |
| `JWT_SECRET_KEY` | ✅ | — | Signs JWT tokens |
| `ENCRYPTION_KEY` | ✅ | — | Encrypts SFTP passwords |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ✅ | `redis://localhost:6379/0` | Redis for Celery |
| `MINIO_ENDPOINT` | ✅ | `localhost:9000` | S3-compatible storage host |
| `MINIO_ACCESS_KEY` | ✅ | `minioadmin` | MinIO / AWS access key |
| `MINIO_SECRET_KEY` | ✅ | `minioadmin123` | MinIO / AWS secret key |
| `MINIO_BUCKET_NAME` | ✅ | `panelx-files` | Storage bucket name |
| `MINIO_USE_SSL` | ❌ | `false` | `true` for AWS S3 / HTTPS |
| `AWS_REGION` | ❌ | `us-east-1` | AWS region (MinIO ignores it) |
| `MAX_FILE_SIZE_MB` | ❌ | `250` | Max upload size |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `30` | JWT lifetime |
| `ADMIN_EMAIL` | ❌ | — | Seeds admin user on boot |
| `ADMIN_PASSWORD` | ❌ | — | Seeds admin user on boot |
| `DEBUG` | ❌ | `false` | Enables SQL echo + verbose logs |

---

## 2. Quick Start

### 2.1 Docker (recommended)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env — generate SECRET_KEY, JWT_SECRET_KEY, ENCRYPTION_KEY (see §1.1)

# 2. Start all services (Postgres, Redis, MinIO, API, Worker, Beat)
docker compose up -d

Run the build again:
docker compose up -d --build
# 3. Run database migrations
docker compose exec api alembic upgrade head

# 4. Open interactive API docs
open http://localhost:8000/api/v1/docs
```

### 2.2 Local (without Docker)

```bash
# Prerequisites: Python 3.12+, running PostgreSQL+PostGIS, Redis, MinIO

pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL etc.

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
celery -A app.workers.celery_app worker --loglevel=info --concurrency=1 --pool=solo -n panelx@%COMPUTERNAME%
### 2.3 Useful URLs

| Service | URL |
|---|---|
| API docs (Swagger) | http://localhost:8000/api/v1/docs |
| API docs (ReDoc) | http://localhost:8000/api/v1/redoc |
| Health check | http://localhost:8000/health |
| MinIO console | http://localhost:9001 |


---

## 3. Authentication Endpoints

Base path: `/api/v1/auth`  
Most endpoints require no authentication (public); password reset is protected.

---

### POST `/auth/login`

Obtain JWT access + refresh tokens.

**Request body**

```json
{
  "email": "john.doe@example.com",
  "password": "Secure@123"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Secure@123"
  }'
```

**Success response — 200 OK**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJleHAiOjE3NDQ2NzI2MDAsInR5cGUiOiJhY2Nlc3MifQ...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJleHAiOjE3NDUyNzcwMDAsInR5cGUiOiJyZWZyZXNoIn0...",
  "token_type": "bearer"
}
```

**Token Details:**
- `access_token` — valid for **15 minutes** (from `ACCESS_TOKEN_EXPIRE_MINUTES=15`)
- `refresh_token` — valid for **7 days** (from `REFRESH_TOKEN_EXPIRE_DAYS=7`)
- Use `access_token` in the `Authorization: Bearer <access_token>` header for all protected endpoints
- When `access_token` expires, use `/auth/refresh` to get a new one without re-entering credentials

**Error responses**

| HTTP | Reason |
|---|---|
| 401 | Invalid email or password |
| 403 | Account is deactivated |

---

### POST `/auth/refresh`

Exchange a valid refresh token for a new access + refresh token pair.

**Request body**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success response — 200 OK**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJleHAiOjE3NDQ2NzM2MDAsInR5cGUiOiJhY2Nlc3MifQ...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZmE4NWY2NC01NzE3LTQ1NjItYjNmYy0yYzk2M2Y2NmFmYTYiLCJleHAiOjE3NDUyNzcwMDAsInR5cGUiOiJyZWZyZXNoIn0...",
  "token_type": "bearer"
}
```

> ⚠️ **Refresh token rotation**: Every time you refresh, the old refresh token is **invalidated**. You must use the new `refresh_token` for the next refresh.

**Error responses**

| HTTP | Reason |
|---|---|
| 401 | Invalid or expired refresh token |

---

### POST `/auth/logout`

Revoke the refresh token (invalidate the session).

**Request body**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Success response — 204 No Content**

> No body returned on success.

---

### POST `/auth/forgot-password`

Request a password reset link. Sends an email with a reset URL.  
**Always returns 202 Accepted** (even if email doesn't exist) — prevents user enumeration.

**Request body**

```json
{
  "email": "john.doe@example.com"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Success response — 202 Accepted**

```json
{
  "detail": "If an account with that email exists, a reset link has been sent."
}
```

**Email content example** (HTML email sent to the user):

```html
Reset your password

Hi John,

We received a request to reset the password for your PanelX account.

[Reset Password]
https://localhost:3000/reset-password?token=ABC123XYZ...

This link expires in 60 minutes.

If you did not request a password reset, you can safely ignore this email.
```

> **Configuration**: Set `FRONTEND_URL` in `.env` to your frontend's base URL (e.g., `http://localhost:3000`). The reset link will be `{FRONTEND_URL}/reset-password?token={token}`.

**Error responses**

No error responses — always returns 202 to prevent enumeration.

---

### POST `/auth/reset-password`

Consume a password reset token and set a new password.

**Request body**

```json
{
  "token": "ABC123XYZ...",
  "new_password": "NewSecure@456"
}
```

**Password requirements:** 8+ characters · 1 uppercase · 1 lowercase · 1 digit · 1 special character.

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123XYZ...",
    "new_password": "NewSecure@456"
  }'
```

**Success response — 204 No Content**

> No body returned. All active sessions are **invalidated** — user must log in again with the new password.

**Error responses**

| HTTP | Reason |
|---|---|
| 400 | Invalid, expired, or already-used reset token |

---

## 4. User Endpoints

Base path: `/api/v1/users`  
All endpoints require a valid JWT Bearer token (see §3 for obtaining tokens).

---

### GET `/users/me`

Return the authenticated user's full profile including their assigned global roles.

**cURL example**

```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success response — 200 OK**

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "profile_image_url": "http://localhost:9000/panelx-files/avatars/abc123...jpg",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-04-15T10:00:00Z",
  "updated_at": "2026-04-15T10:00:00Z",
  "roles": [
    {
      "id": "a1b2c3d4-...",
      "name": "Project Manager",
      "description": "Manages projects and teams",
      "created_at": "2026-04-15T09:00:00Z",
      "updated_at": "2026-04-15T09:00:00Z"
    }
  ]
}
```

---

### PUT `/users/me`

Update the authenticated user's profile (full name, email, and/or profile image).

**Request format:** `multipart/form-data`

**Form fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `full_name` | string | ❌ | Display name (max 255 chars) |
| `email` | string | ❌ | Email address (must be unique) |
| `profile_image` | file | ❌ | Image file (JPG/PNG, max 250 MB) |

**cURL example**

```bash
# Update full name only
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "full_name=John Smith"

# Update email only
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "email=john.smith@example.com"

# Update profile image
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "profile_image=@/path/to/image.jpg"

# Update all three
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "full_name=John Smith" \
  -F "email=john.smith@example.com" \
  -F "profile_image=@/path/to/image.jpg"
```

**Success response — 200 OK** (returns updated profile with roles)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "john.smith@example.com",
  "full_name": "John Smith",
  "profile_image_url": "http://localhost:9000/panelx-files/avatars/xyz789...jpg",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-04-15T10:00:00Z",
  "updated_at": "2026-04-16T11:30:00Z",
  "roles": [
    {
      "id": "a1b2c3d4-...",
      "name": "Project Manager",
      "description": "Manages projects and teams",
      "created_at": "2026-04-15T09:00:00Z",
      "updated_at": "2026-04-15T09:00:00Z"
    }
  ]
}
```

**Error responses**

| HTTP | Reason |
|---|---|
| 409 | Email already taken by another user |
| 413 | File exceeds 250 MB limit |
| 422 | Invalid file format or validation error |

---

### PUT `/users/me/password`

Change the authenticated user's password.

**Request body**

```json
{
  "current_password": "OldSecure@123",
  "new_password": "NewSecure@456"
}
```

**Password requirements for new password:** 8+ characters · 1 uppercase · 1 lowercase · 1 digit · 1 special character.

**cURL example**

```bash
curl -X PUT http://localhost:8000/api/v1/users/me/password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldSecure@123",
    "new_password": "NewSecure@456"
  }'
```

**Success response — 204 No Content**

> No body returned. **All active sessions are invalidated** — user must log in again with the new password.

**Error responses**

| HTTP | Reason |
|---|---|
| 400 | Current password is incorrect |
| 422 | New password does not meet strength requirements |

---

### GET `/users`

List all users. **Admin only.**

**cURL example**

```bash
curl "http://localhost:8000/api/v1/users?skip=0&limit=50" \
  -H "Authorization: Bearer <admin_access_token>"
```

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `skip` | integer | `0` | Number of records to skip (pagination offset) |
| `limit` | integer | `100` | Maximum records to return |

**Success response — 200 OK**

```json
{
  "total": 15,
  "items": [
    {
      "id": "3fa85f64-...",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "profile_image_url": null,
      "is_active": true,
      "is_superuser": false,
      "created_at": "2026-04-15T10:00:00Z",
      "updated_at": "2026-04-15T10:00:00Z"
    },
    {
      "id": "4gb96g75-...",
      "email": "jane.smith@example.com",
      "full_name": "Jane Smith",
      "profile_image_url": "http://localhost:9000/panelx-files/avatars/abc123...jpg",
      "is_active": true,
      "is_superuser": false,
      "created_at": "2026-04-15T10:15:00Z",
      "updated_at": "2026-04-15T10:15:00Z"
    }
  ]
}
```

---

### POST `/users`

Create a new user account and optionally assign a role. **Admin only.**

**Request body**

```json
{
  "email": "newuser@example.com",
  "password": "Secure@123",
  "full_name": "New User",
  "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6",
  "is_superuser": false
}
```

**cURL example**

```bash
# Create user without role
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Secure@123",
    "full_name": "New User",
    "is_superuser": false
  }'

# Create user and assign role in one call
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Secure@123",
    "full_name": "New User",
    "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6",
    "is_superuser": false
  }'
```

**Success response — 201 Created** (returns full user profile with roles)

```json
{
  "id": "5hc07h86-5717-4562-b3fc-2c963f66afa6",
  "email": "newuser@example.com",
  "full_name": "New User",
  "profile_image_url": null,
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-04-16T12:00:00Z",
  "updated_at": "2026-04-16T12:00:00Z",
  "roles": [
    {
      "id": "a1b2c3d4-...",
      "name": "Project Manager",
      "description": "Manages projects",
      "created_at": "2026-04-15T09:00:00Z",
      "updated_at": "2026-04-15T09:00:00Z"
    }
  ]
}
```

**Error responses**

| HTTP | Reason |
|---|---|
| 409 | Email already registered |
| 404 | Role not found |
| 422 | Validation failed (weak password, invalid email) |

---

### POST `/users/assign-role`

Assign a global role to a user. **Admin only.**

**Request body**

```json
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/users/assign-role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
  }'
```

**Success response — 200 OK** — returns the updated user object.

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "john.doe@example.com",
  "full_name": "John Doe",
  "profile_image_url": null,
  "is_active": true,
  "is_superuser": false,
  "created_at": "2026-04-15T10:00:00Z",
  "updated_at": "2026-04-15T10:00:00Z"
}
```

**Error responses**

| HTTP | Reason |
|---|---|
| 404 | User or role not found |
| 409 | User already has this role |

---

### DELETE `/users/remove-role`

Remove a global role from a user. **Admin only.**

**Request body**

```json
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
}
```

**cURL example**

```bash
curl -X DELETE http://localhost:8000/api/v1/users/remove-role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
  }'
```

**Success response — 204 No Content**

---
  "total": 3,
  "items": [
    {
      "id": "3fa85f64-...",
      "email": "john.doe@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "is_superuser": false,
      "created_at": "2026-04-15T10:00:00Z",
      "updated_at": "2026-04-15T10:00:00Z"
    }
  ]
}
```

---

### POST `/users/assign-role`

Assign a global role to a user. **Admin only.**

**Request body**

```json
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/users/assign-role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
  }'
```

**Success response — 200 OK** — returns the updated user object.

**Error responses**

| HTTP | Reason |
|---|---|
| 404 | User or role not found |
| 409 | User already has this role |

---

### DELETE `/users/remove-role`

Remove a global role from a user. **Admin only.**

**Request body**

```json
{
  "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
}
```

**cURL example**

```bash
curl -X DELETE http://localhost:8000/api/v1/users/remove-role \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "role_id": "a1b2c3d4-5678-9012-b3fc-2c963f66afa6"
  }'
```

**Success response — 204 No Content**

---

## 5. Role & Permission Endpoints

Base path: `/api/v1/roles`

### Predefined roles (seeded on first boot)

| Role | Description |
|---|---|
| **Admin** | Full system access — all permissions |
| **Project Manager** | Create/manage projects, configure sync, assign users |
| **Designer/Engineer** | Read projects, upload and read files |
| **Field Personnel** | Read projects and files, upload files |
| **External Client** | Read-only access to projects and files |

---

### POST `/roles`

Create a new role dynamically. **Admin only.**

**Request body**

```json
{
  "name": "QA Inspector",
  "description": "Can view projects and flag file issues"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "QA Inspector",
    "description": "Can view projects and flag file issues"
  }'
```

**Success response — 201 Created**

```json
{
  "id": "b9c8d7e6-...",
  "name": "QA Inspector",
  "description": "Can view projects and flag file issues",
  "created_at": "2026-04-15T11:00:00Z",
  "updated_at": "2026-04-15T11:00:00Z",
  "permissions": []
}
```

---

### GET `/roles`

List all roles including their permissions. Public to authenticated users.

**cURL example**

```bash
curl http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK**

```json
[
  {
    "id": "a1b2c3d4-...",
    "name": "Admin",
    "description": "Full system access",
    "created_at": "2026-04-15T09:00:00Z",
    "updated_at": "2026-04-15T09:00:00Z",
    "permissions": [
      { "id": "p1...", "name": "create_project", "description": "Create new projects" },
      { "id": "p2...", "name": "manage_users",   "description": "Manage user accounts" }
    ]
  }
]
```

---

### GET `/roles/permissions`

List every available permission in the system.

**cURL example**

```bash
curl http://localhost:8000/api/v1/roles/permissions \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK**

```json
[
  { "id": "p1...", "name": "create_project",       "description": "Create new projects" },
  { "id": "p2...", "name": "read_project",          "description": "View project details" },
  { "id": "p3...", "name": "update_project",        "description": "Update project information" },
  { "id": "p4...", "name": "delete_project",        "description": "Delete projects" },
  { "id": "p5...", "name": "upload_file",           "description": "Upload files to projects" },
  { "id": "p6...", "name": "read_file",             "description": "View and download files" },
  { "id": "p7...", "name": "delete_file",           "description": "Delete files from projects" },
  { "id": "p8...", "name": "manage_users",          "description": "Manage user accounts" },
  { "id": "p9...", "name": "manage_roles",          "description": "Manage roles and permissions" },
  { "id": "p10..","name": "configure_sync",         "description": "Configure SFTP sync settings" },
  { "id": "p11..","name": "view_sync",              "description": "View SFTP sync configurations" },
  { "id": "p12..","name": "assign_project_users",   "description": "Assign users to projects" }
]
```

---

### GET `/roles/{role_id}`

Get a single role by its UUID.

**cURL example**

```bash
curl http://localhost:8000/api/v1/roles/a1b2c3d4-5678-9012-b3fc-2c963f66afa6 \
  -H "Authorization: Bearer <access_token>"
```

---

### PUT `/roles/{role_id}`

Update a role's name or description. **Admin only.**

**Request body** (all fields optional)

```json
{
  "name": "QA Lead",
  "description": "Senior quality assurance role"
}
```

**cURL example**

```bash
curl -X PUT http://localhost:8000/api/v1/roles/b9c8d7e6-... \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "QA Lead", "description": "Senior quality assurance role"}'
```

**Success response — 200 OK** — returns updated role with permissions.

---

### DELETE `/roles/{role_id}`

Delete a role. **Admin only.**

```bash
curl -X DELETE http://localhost:8000/api/v1/roles/b9c8d7e6-... \
  -H "Authorization: Bearer <admin_access_token>"
```

**Success response — 204 No Content**

---

### PUT `/roles/{role_id}/permissions`

Replace a role's full permission set. **Admin only.**  
Send the complete list of permission IDs you want the role to have — existing permissions not in the list are removed.

**Request body**

```json
{
  "permission_ids": [
    "p2-uuid-read-project",
    "p6-uuid-read-file",
    "p5-uuid-upload-file"
  ]
}
```

**cURL example**

```bash
curl -X PUT http://localhost:8000/api/v1/roles/b9c8d7e6-.../permissions \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [
      "p2-uuid-read-project",
      "p6-uuid-read-file",
      "p5-uuid-upload-file"
    ]
  }'
```

**Success response — 200 OK** — returns the role with the new permission set.

---

## 6. Project Endpoints

Base path: `/api/v1/projects`  
Required permissions are noted per endpoint.

---

### POST `/projects`

Create a new project. Requires `create_project` permission.  
The calling user is automatically set as owner and enrolled as a project member.

**Request body**

```json
{
  "name": "Downtown Tower — Structural Review",
  "description": "Q2 2026 structural DWG review package"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Tower — Structural Review",
    "description": "Q2 2026 structural DWG review package"
  }'
```

**Success response — 201 Created**

```json
{
  "id": "c1d2e3f4-...",
  "name": "Downtown Tower — Structural Review",
  "description": "Q2 2026 structural DWG review package",
  "owner_id": "3fa85f64-...",
  "status": "active",
  "created_at": "2026-04-15T12:00:00Z",
  "updated_at": "2026-04-15T12:00:00Z"
}
```

---

### GET `/projects`

List all projects the caller has access to. Requires `read_project`.  
Admins see all projects; other users see only projects they own or are members of.

**cURL example**

```bash
curl "http://localhost:8000/api/v1/projects?skip=0&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK**

```json
{
  "total": 2,
  "items": [
    {
      "id": "c1d2e3f4-...",
      "name": "Downtown Tower — Structural Review",
      "description": "...",
      "owner_id": "3fa85f64-...",
      "status": "active",
      "created_at": "2026-04-15T12:00:00Z",
      "updated_at": "2026-04-15T12:00:00Z"
    }
  ]
}
```

---

### GET `/projects/{project_id}`

Get a single project by UUID. Requires `read_project`.

**cURL example**

```bash
curl http://localhost:8000/api/v1/projects/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>"
```

---

### PUT `/projects/{project_id}`

Update a project. Requires `update_project`.

**Request body** (all fields optional)

```json
{
  "name": "Downtown Tower — Final Structural Review",
  "description": "Updated scope",
  "status": "archived"
}
```

> `status` must be one of: `active`, `archived`, `completed`

**cURL example**

```bash
curl -X PUT http://localhost:8000/api/v1/projects/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

### DELETE `/projects/{project_id}`

Permanently delete a project and all its files / sync config (cascade). Requires `delete_project`.

```bash
curl -X DELETE http://localhost:8000/api/v1/projects/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 204 No Content**

---

### POST `/projects/assign-user`

Add a user to a project with an optional project-scoped role. Requires `assign_project_users`.

**Request body**

```json
{
  "user_id": "3fa85f64-...",
  "project_id": "c1d2e3f4-...",
  "role_id": "a1b2c3d4-..."
}
```

> `role_id` is optional. If omitted the user is added without a project-specific role.

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/projects/assign-user \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "3fa85f64-...",
    "project_id": "c1d2e3f4-...",
    "role_id": "a1b2c3d4-..."
  }'
```

**Success response — 201 Created**

```json
{
  "user_id": "3fa85f64-...",
  "project_id": "c1d2e3f4-...",
  "role_id": "a1b2c3d4-...",
  "assigned_at": "2026-04-15T13:00:00Z"
}
```

**Error responses**

| HTTP | Reason |
|---|---|
| 404 | Project or user not found |
| 409 | User is already a member of this project |

---

## 7. File Endpoints

Base path: `/api/v1/files`  
Files are stored in MinIO (or AWS S3). Maximum upload size: **250 MB** (configurable via `MAX_FILE_SIZE_MB`).

---

### POST `/files/upload`

Upload a file to a project. Requires `upload_file` permission.  
Use `multipart/form-data` — **not** JSON.

**Form fields**

| Field | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | ✅ | Target project |
| `file` | file | ✅ | The file to upload (max 250 MB) |

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/files/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "project_id=c1d2e3f4-5678-9012-b3fc-2c963f66afa6" \
  -F "file=@/path/to/drawing.dwg"
```

**Success response — 201 Created**

```json
{
  "id": "f1a2b3c4-...",
  "project_id": "c1d2e3f4-...",
  "filename": "drawing.dwg",
  "original_filename": "drawing.dwg",
  "file_size": 10485760,
  "content_type": "application/octet-stream",
  "storage_url": "http://localhost:9000/panelx-files/projects/c1d2e3f4.../uuid.dwg",
  "status": "uploaded",
  "uploaded_by": "3fa85f64-...",
  "created_at": "2026-04-15T14:00:00Z"
}
```

**Error responses**

| HTTP | Reason |
|---|---|
| 404 | Project not found |
| 413 | File exceeds MAX_FILE_SIZE_MB limit |

---

### GET `/files/{project_id}`

List all files for a project. Requires `read_file`.

**cURL example**

```bash
curl "http://localhost:8000/api/v1/files/c1d2e3f4-...?skip=0&limit=50" \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK**

```json
{
  "total": 2,
  "items": [
    {
      "id": "f1a2b3c4-...",
      "project_id": "c1d2e3f4-...",
      "filename": "drawing.dwg",
      "original_filename": "drawing.dwg",
      "file_size": 10485760,
      "content_type": "application/octet-stream",
      "storage_url": "http://...",
      "status": "uploaded",
      "uploaded_by": "3fa85f64-...",
      "created_at": "2026-04-15T14:00:00Z"
    }
  ]
}
```

---

### GET `/files/{project_id}/{file_id}/download-url`

Get a time-limited pre-signed download URL (direct from MinIO/S3). Requires `read_file`.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `expires_in` | integer | `3600` | URL validity in seconds |

**cURL example**

```bash
curl "http://localhost:8000/api/v1/files/c1d2e3f4-.../f1a2b3c4-.../download-url?expires_in=1800" \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK**

```json
{
  "download_url": "http://localhost:9000/panelx-files/projects/.../file.dwg?X-Amz-Signature=...",
  "expires_in": 1800
}
```

---

### DELETE `/files/{project_id}/{file_id}`

Delete a file from both the database and object storage. Requires `delete_file`.

```bash
curl -X DELETE http://localhost:8000/api/v1/files/c1d2e3f4-.../f1a2b3c4-... \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 204 No Content**

---

## 8. Sync (SFTP) Endpoints

Base path: `/api/v1/sync`  
Manages SFTP configuration for automatic file pull. Each project has **at most one** sync config.  
SFTP passwords are **never returned** in any API response — they are stored Fernet-encrypted.

---

### POST `/sync/config?project_id={uuid}`

Create SFTP sync configuration for a project. Requires `configure_sync`.

**Query parameter**

| Parameter | Required | Description |
|---|---|---|
| `project_id` | ✅ | UUID of the target project |

**Request body**

```json
{
  "server_address": "sftp.client-server.com",
  "port": 22,
  "username": "panelx_sync",
  "password": "SFTPpassword!9",
  "file_path": "/exports/dwg/project-101",
  "sync_frequency": "daily"
}
```

**Field reference**

| Field | Type | Required | Allowed values |
|---|---|---|---|
| `server_address` | string | ✅ | Hostname or IP |
| `port` | integer | ❌ | 1–65535 (default: `22`) |
| `username` | string | ✅ | SFTP username |
| `password` | string | ✅ | SFTP password (encrypted at rest, never returned) |
| `file_path` | string | ✅ | Absolute path on the remote server |
| `sync_frequency` | string | ❌ | `manual` · `hourly` · `daily` · `weekly` (default: `manual`) |

**cURL example**

```bash
curl -X POST "http://localhost:8000/api/v1/sync/config?project_id=c1d2e3f4-..." \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "server_address": "sftp.client-server.com",
    "port": 22,
    "username": "panelx_sync",
    "password": "SFTPpassword!9",
    "file_path": "/exports/dwg/project-101",
    "sync_frequency": "daily"
  }'
```

**Success response — 201 Created**

```json
{
  "id": "s1t2u3v4-...",
  "project_id": "c1d2e3f4-...",
  "server_address": "sftp.client-server.com",
  "port": 22,
  "username": "panelx_sync",
  "file_path": "/exports/dwg/project-101",
  "sync_frequency": "daily",
  "last_sync_at": null,
  "is_active": true,
  "created_at": "2026-04-15T15:00:00Z",
  "updated_at": "2026-04-15T15:00:00Z"
}
```

> Note: `password` is **never** included in any response.

**Error responses**

| HTTP | Reason |
|---|---|
| 409 | A sync config already exists for this project (use PUT to update) |
| 422 | Invalid port number or sync_frequency value |

---

### GET `/sync/config/{project_id}`

Retrieve the SFTP config for a project. Requires `view_sync`.

**cURL example**

```bash
curl http://localhost:8000/api/v1/sync/config/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 200 OK** — same schema as POST response above (no password field).

---

### PUT `/sync/config/{project_id}`

Update sync configuration fields. Requires `configure_sync`. All fields are optional.

**cURL example — change sync frequency and path**

```bash
curl -X PUT http://localhost:8000/api/v1/sync/config/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "/exports/dwg/project-101/v2",
    "sync_frequency": "hourly",
    "is_active": true
  }'
```

**cURL example — rotate password only**

```bash
curl -X PUT http://localhost:8000/api/v1/sync/config/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"password": "NewSFTPpass!7"}'
```

---

### DELETE `/sync/config/{project_id}`

Remove the SFTP configuration for a project. Requires `configure_sync`.

```bash
curl -X DELETE http://localhost:8000/api/v1/sync/config/c1d2e3f4-... \
  -H "Authorization: Bearer <access_token>"
```

**Success response — 204 No Content**

---

### POST `/sync/test-connection`

Test an SFTP connection **without saving any credentials**. Requires `configure_sync`.  
Useful for validating credentials before creating or updating a sync config.

**Request body**

```json
{
  "server_address": "sftp.client-server.com",
  "port": 22,
  "username": "panelx_sync",
  "password": "SFTPpassword!9",
  "file_path": "/exports/dwg/project-101"
}
```

**cURL example**

```bash
curl -X POST http://localhost:8000/api/v1/sync/test-connection \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "server_address": "sftp.client-server.com",
    "port": 22,
    "username": "panelx_sync",
    "password": "SFTPpassword!9",
    "file_path": "/exports/dwg/project-101"
  }'
```

**Success response — 200 OK (connection OK)**

```json
{
  "success": true,
  "message": "SFTP connection and path verification successful"
}
```

**Success response — 200 OK (connection failed)**

```json
{
  "success": false,
  "message": "Authentication failed: invalid credentials"
}
```

> The HTTP status code is always `200`. Check the `success` field in the body.

**Possible `message` values**

| `success` | `message` |
|---|---|
| `true` | `SFTP connection and path verification successful` |
| `false` | `Authentication failed: invalid credentials` |
| `false` | `Connected successfully but path '/some/path' was not found` |
| `false` | `Connection timed out` |
| `false` | `SSH error: <detail>` |
| `false` | `Network error: <detail>` |

---

## 9. WebSocket Endpoints

WebSocket connections are **not** under the `/api/v1` prefix.

---

### WS `/ws/projects/{project_id}`

Subscribe to real-time updates for a specific project (file processing progress, sync events, etc.).

**JavaScript example**

```javascript
const token = "eyJhbGci...";   // your JWT access token
const projectId = "c1d2e3f4-5678-9012-b3fc-2c963f66afa6";

const ws = new WebSocket(`ws://localhost:8000/ws/projects/${projectId}`);

ws.onopen = () => {
  console.log("Connected to project channel");
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log("Received:", msg);

  // Keep-alive ping
  if (msg.type === "connection_established") {
    setInterval(() => ws.send(JSON.stringify({ type: "ping" })), 30000);
  }
};

ws.onclose = () => console.log("Disconnected");
ws.onerror = (err) => console.error("WebSocket error:", err);
```

**Server → client message: connection_established**

```json
{
  "type": "connection_established",
  "project_id": "c1d2e3f4-...",
  "active_connections": 1
}
```

**Client → server ping / server → client pong**

```json
// send
{ "type": "ping" }

// receive
{ "type": "pong" }
```

**Future push events (Milestone 2+)**

```json
{
  "type": "file_processing_progress",
  "file_id": "f1a2b3c4-...",
  "progress": 65,
  "stage": "parsing_geometry"
}
```

---

### WS `/ws/status`

One-shot status connection. Returns server stats and closes immediately.

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/status");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

**Response**

```json
{
  "type": "status",
  "total_connections": 5,
  "active_projects": ["c1d2e3f4-...", "d2e3f4a5-..."]
}
```

---

## 10. RBAC Permission Reference

Every protected endpoint requires the calling user to hold a role that contains the listed permission. Superusers (`is_superuser=true`) bypass all permission checks.

| Permission | Endpoints protected |
|---|---|
| `create_project` | POST `/projects` |
| `read_project` | GET `/projects`, GET `/projects/{id}` |
| `update_project` | PUT `/projects/{id}` |
| `delete_project` | DELETE `/projects/{id}` |
| `upload_file` | POST `/files/upload` |
| `read_file` | GET `/files/{project_id}`, GET `/files/.../download-url` |
| `delete_file` | DELETE `/files/{project_id}/{file_id}` |
| `manage_users` | *(reserved — Milestone 2)* |
| `manage_roles` | *(reserved — Milestone 2)* |
| `configure_sync` | POST/PUT/DELETE `/sync/config`, POST `/sync/test-connection` |
| `view_sync` | GET `/sync/config/{project_id}` |
| `assign_project_users` | POST `/projects/assign-user` |

Admin-only endpoints (require `is_superuser=true` regardless of role):

- `GET /users`
- `POST /users/assign-role`
- `DELETE /users/remove-role`
- `POST /roles`
- `PUT /roles/{id}`
- `DELETE /roles/{id}`
- `PUT /roles/{id}/permissions`

---

## 11. Error Response Reference

All errors follow the same JSON structure:

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Code Reference

| Code | Meaning | Common causes |
|---|---|---|
| `400` | Bad Request | Malformed request body |
| `401` | Unauthorized | Missing, expired or invalid JWT token |
| `403` | Forbidden | Account deactivated · insufficient permissions |
| `404` | Not Found | Resource UUID does not exist |
| `409` | Conflict | Duplicate email · role already assigned · sync config already exists |
| `413` | Request Entity Too Large | File exceeds MAX_FILE_SIZE_MB |
| `422` | Unprocessable Entity | Pydantic validation failed (weak password, invalid UUID, bad enum value) |
| `500` | Internal Server Error | Unexpected server-side failure |

### Authentication error example

```json
{
  "detail": "Could not validate credentials"
}
```

### Validation error example (422)

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "password"],
      "msg": "Value error, Password must contain at least one uppercase letter",
      "input": "weakpassword1!"
    }
  ]
}
```

---

## Complete Workflow Example

The following sequence registers an admin, creates a project, uploads a file, and configures SFTP sync.

```bash
# 1. Login as the seeded admin user
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@panelx.io","password":"Admin@PanelX1"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"

# 2. Register a regular user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"engineer@example.com","password":"Engineer@1","full_name":"Alice Engineer"}'

# 3. Get the Designer/Engineer role ID
curl http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool

# 4. Assign the Designer/Engineer role to Alice (use role ID from step 3)
curl -X POST http://localhost:8000/api/v1/users/assign-role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<alice-uuid>","role_id":"<designer-role-uuid>"}'

# 5. Create a project (as admin)
PROJECT_ID=$(curl -s -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bridge Design Package","description":"2026 Q3 structural set"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['id'])")

echo "Project ID: $PROJECT_ID"

# 6. Assign Alice to the project
curl -X POST http://localhost:8000/api/v1/projects/assign-user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"<alice-uuid>\",\"project_id\":\"$PROJECT_ID\"}"

# 7. Upload a file
curl -X POST http://localhost:8000/api/v1/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "project_id=$PROJECT_ID" \
  -F "file=@bridge_structure.dwg"

# 8. Test SFTP before saving
curl -X POST http://localhost:8000/api/v1/sync/test-connection \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"server_address":"sftp.example.com","port":22,"username":"user","password":"pass","file_path":"/dwg"}'

# 9. Save the SFTP config
curl -X POST "http://localhost:8000/api/v1/sync/config?project_id=$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"server_address":"sftp.example.com","port":22,"username":"user","password":"pass","file_path":"/dwg","sync_frequency":"daily"}'
```
