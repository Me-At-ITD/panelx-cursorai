# MILESTONE_1.md Update Summary

## Changes Made (April 16, 2026)

### New in Milestone 1 Endpoints Documentation

#### Authentication Endpoints (§3)
- ✅ `POST /auth/login` — Now documents **dual-token system** (access + refresh)
- ✅ `POST /auth/refresh` — New: Exchange refresh token for new token pair
- ✅ `POST /auth/logout` — New: Revoke session
- ✅ `POST /auth/forgot-password` — New: Request password reset link
- ✅ `POST /auth/reset-password` — New: Set new password with reset token

#### User Endpoints (§4)
- ✅ `GET /users/me` — Now includes `profile_image_url` field
- ✅ `PUT /users/me` — New: Update profile (full_name, email, profile image)
- ✅ `PUT /users/me/password` — New: Change password with current password verification
- ✅ `POST /users` — New: Admin-only user creation with optional role assignment
- ✅ All existing endpoints maintained (assign-role, remove-role, list users)

#### Configuration (.env)
New SMTP & password reset settings added:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=noreply@panelx.io
FRONTEND_URL=http://localhost:3000
PASSWORD_RESET_EXPIRE_MINUTES=60
```

### Database Schema Updates
- `users.avatar_url` → Renamed to `users.profile_image_url` (migration 004)
- `password_reset_tokens` table — NEW (migration 003)
  - Single-use tokens
  - SHA-256 hashed
  - Expire-time enforcement
  - Used-at tracking (prevents replays)

### Email Service
- New `app/services/email_service.py`
- Supports SMTP with TLS (STARTTLS)
- Graceful degradation if SMTP not configured (dev-friendly)
- HTML email templates for password reset

### Service Layer Enhancements
`app/services/auth_service.py` now includes:
- `create_user()` — Admin-only user creation
- `update_profile()` — Update name, email, profile image
- `update_password()` — Change password with verification
- `forgot_password()` — Initiate reset flow
- `reset_password()` — Consume reset token

### Security Features
✅ Password strength validation (8+ chars, 1 uppercase, 1 digit, 1 special char)
✅ Refresh token rotation (old token invalidated on refresh)
✅ Session invalidation on password change (all active sessions revoked)
✅ Single-use reset tokens (marked as used after consumption)
✅ User enumeration prevention (forgot-password always returns 202)
✅ Email uniqueness enforcement

### Documentation
- Comprehensive endpoint examples with cURL
- JSON request/response schemas for all endpoints
- Error codes and troubleshooting
- Complete workflow example (register → create project → upload file → configure sync)

---

## Testing Checklist

- [ ] POST /auth/login — returns access + refresh tokens
- [ ] POST /auth/refresh — rotates tokens
- [ ] POST /auth/logout — revokes session
- [ ] PUT /users/me — update full_name, email, profile_image
- [ ] PUT /users/me/password — change password with verification
- [ ] POST /auth/forgot-password — sends email (check SMTP config)
- [ ] POST /auth/reset-password — reset via token
- [ ] POST /users — admin creates user with optional role
- [ ] GET /users/me — includes profile_image_url field

---

## Deployment Notes

1. **Migrations**: Run `alembic upgrade head` to apply migrations 003 & 004
2. **Dependencies**: `pip install -r requirements.txt` (includes aiosmtplib)
3. **Email Config**: Set SMTP_* in .env (optional in dev, required in prod)
4. **Password Reset**: Frontend must have `/reset-password?token=` route
5. **File Storage**: Profile images stored in MinIO under `avatars/` prefix

---

## Files Modified

- `MILESTONE_1.md` — Full API documentation update
- `app/models/user.py` — Added `profile_image_url` column
- `app/models/password_reset.py` — NEW
- `app/schemas/user.py` — Added UpdateProfileRequest, UpdatePasswordRequest
- `app/schemas/auth.py` — Added ForgotPasswordRequest, ResetPasswordRequest
- `app/services/auth_service.py` — Added 6 new methods
- `app/services/email_service.py` — NEW
- `app/api/v1/endpoints/users.py` — Added PUT /users/me, PUT /users/me/password
- `app/api/v1/endpoints/auth.py` — Removed register, added forgot/reset
- `app/core/config.py` — Added SMTP + password reset settings
- `.env` — Added SMTP and password reset configuration
- `requirements.txt` — Added aiosmtplib
- `alembic/versions/003_*.py` — Add avatar + reset tokens table
- `alembic/versions/004_*.py` — Rename avatar_url → profile_image_url

---

## Next Steps (Milestone 2)

- [ ] Project-level RBAC (ProjectUser.role_id)
- [ ] Bulk project user assignment
- [ ] WebSocket live updates
- [ ] SFTP sync scheduling
- [ ] File versioning & history
- [ ] Activity audit logs
