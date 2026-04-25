# PanelX API — Quick Reference Card

## Setup
```bash
pip install -r requirements.txt
cp .env.example .env
# Configure: SECRET_KEY, JWT_SECRET_KEY, ENCRYPTION_KEY, DATABASE_URL, SMTP_*

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Base URLs
- API: `http://localhost:8000/api/v1`
- Docs: `http://localhost:8000/api/v1/docs`
- MinIO: `http://localhost:9001`

---

## Auth Flow

### Register (removed — admin only)
### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass@123"
  }'
```
Returns: `{ "access_token": "...", "refresh_token": "...", "token_type": "bearer" }`

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "..."}'
```

### Logout
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "..."}'
```

### Forgot Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:8000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABC123...",
    "new_password": "NewPass@456"
  }'
```

---

## User Profile

### Get Profile
```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN" \
  -F "full_name=New Name" \
  -F "email=new@example.com" \
  -F "profile_image=@image.jpg"
```

### Change Password
```bash
curl -X PUT http://localhost:8000/api/v1/users/me/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "Old@123",
    "new_password": "New@456"
  }'
```

---

## User Management (Admin Only)

### List Users
```bash
curl http://localhost:8000/api/v1/users?skip=0&limit=50 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Create User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Pass@123",
    "full_name": "New User",
    "role_id": "UUID",
    "is_superuser": false
  }'
```

### Assign Role
```bash
curl -X POST http://localhost:8000/api/v1/users/assign-role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "UUID",
    "role_id": "UUID"
  }'
```

### Remove Role
```bash
curl -X DELETE http://localhost:8000/api/v1/users/remove-role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "UUID",
    "role_id": "UUID"
  }'
```

---

## Roles

### List Roles
```bash
curl http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer TOKEN"
```

### List Permissions
```bash
curl http://localhost:8000/api/v1/roles/permissions \
  -H "Authorization: Bearer TOKEN"
```

### Create Role (Admin)
```bash
curl -X POST http://localhost:8000/api/v1/roles \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Role",
    "description": "Role description"
  }'
```

---

## Projects

### Create Project
```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Name",
    "description": "Optional description"
  }'
```

### List Projects
```bash
curl http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer TOKEN"
```

### Get Project
```bash
curl http://localhost:8000/api/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Update Project
```bash
curl -X PUT http://localhost:8000/api/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

### Delete Project (Admin)
```bash
curl -X DELETE http://localhost:8000/api/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Assign User to Project
```bash
curl -X POST http://localhost:8000/api/v1/projects/assign-user \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "UUID", "project_id": "PROJECT_ID"}'
```

---

## Files

### Upload File
```bash
curl -X POST http://localhost:8000/api/v1/files/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "project_id=PROJECT_ID" \
  -F "file=@myfile.dwg"
```

### List Files
```bash
curl http://localhost:8000/api/v1/files?project_id=PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Download File
```bash
curl http://localhost:8000/api/v1/files/FILE_ID/download \
  -H "Authorization: Bearer TOKEN" \
  -o myfile.dwg
```

### Delete File
```bash
curl -X DELETE http://localhost:8000/api/v1/files/FILE_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## SFTP Sync

### Test Connection
```bash
curl -X POST http://localhost:8000/api/v1/sync/test-connection \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_address": "sftp.example.com",
    "port": 22,
    "username": "user",
    "password": "pass",
    "file_path": "/dwg"
  }'
```

### Create Sync Config
```bash
curl -X POST http://localhost:8000/api/v1/sync/config?project_id=PROJECT_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_address": "sftp.example.com",
    "port": 22,
    "username": "user",
    "password": "pass",
    "file_path": "/dwg",
    "sync_frequency": "daily"
  }'
```

### Get Sync Config
```bash
curl http://localhost:8000/api/v1/sync/config/PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Delete Sync Config
```bash
curl -X DELETE http://localhost:8000/api/v1/sync/config/PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Error Handling

### 401 Unauthorized
```json
{"detail": "Could not validate credentials"}
```
→ Missing token or token expired. Call `/auth/refresh` or log in again.

### 403 Forbidden
```json
{"detail": "Not enough permissions"}
```
→ Your role lacks the required permission.

### 409 Conflict
```json
{"detail": "Email already registered"}
```
→ Resource already exists.

### 422 Validation Error
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "password"],
      "msg": "Password must contain at least one uppercase letter"
    }
  ]
}
```
→ Request validation failed.

---

## Tokens

- **Access Token**: 15 minutes (read from `ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Refresh Token**: 7 days (read from `REFRESH_TOKEN_EXPIRE_DAYS`)
- **Reset Token**: 60 minutes (read from `PASSWORD_RESET_EXPIRE_MINUTES`)

Always include token in header:
```
Authorization: Bearer <token>
```

---

## Predefined Roles

| Role | Permissions |
|---|---|
| Admin | All |
| Project Manager | Create/manage projects, assign users, configure sync |
| Designer/Engineer | Read projects, upload/read files |
| Field Personnel | Read projects/files, upload files |
| External Client | Read-only projects and files |

---

## Database Tables (Milestone 1)

- `users` — User accounts + profile_image_url
- `roles` — Role definitions
- `permissions` — Permission definitions
- `user_roles` — User ↔ Role mapping
- `role_permissions` — Role ↔ Permission mapping
- `projects` — Project records
- `project_users` — Project ↔ User assignment
- `files` — File metadata
- `sync_configs` — SFTP sync configurations
- `refresh_tokens` — JWT refresh tokens (per session)
- `password_reset_tokens` — Password reset tokens (single-use)

---

## Environment Variables

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `SECRET_KEY` | string | — | General app secret (32-byte hex) |
| `JWT_SECRET_KEY` | string | — | JWT signing key (32-byte hex) |
| `ENCRYPTION_KEY` | string | — | Fernet key for SFTP passwords |
| `DATABASE_URL` | string | — | PostgreSQL connection |
| `REDIS_URL` | string | `redis://localhost:6379/0` | Redis broker |
| `MINIO_*` | string | — | S3 storage config |
| `SMTP_*` | string | — | Email SMTP settings |
| `FRONTEND_URL` | string | `http://localhost:3000` | Frontend base URL |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | int | 30 | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | int | 7 | Refresh token lifetime |
| `PASSWORD_RESET_EXPIRE_MINUTES` | int | 60 | Reset token lifetime |

---

**Last Updated:** April 16, 2026  
**Version:** Milestone 1 Complete
