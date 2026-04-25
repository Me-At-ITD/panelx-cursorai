"""
Startup seed: idempotently create default permissions, roles, and the
optional admin superuser.  Safe to run on every application boot.
"""
from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.role import Permission, Role, RolePermission, UserRole
from app.models.user import User

logger = logging.getLogger(__name__)

# ── Permission catalogue ──────────────────────────────────────────────────────
PERMISSIONS: list[tuple[str, str]] = [
    ("create_project",        "Create new projects"),
    ("read_project",          "View project details"),
    ("update_project",        "Update project information"),
    ("delete_project",        "Delete projects"),
    ("upload_file",           "Upload files to projects"),
    ("read_file",             "View and download files"),
    ("delete_file",           "Delete files from projects"),
    ("manage_users",          "Manage user accounts"),
    ("manage_roles",          "Manage roles and permissions"),
    ("configure_sync",        "Configure SFTP sync settings"),
    ("view_sync",             "View SFTP sync configurations"),
    ("assign_project_users",  "Assign users to projects"),
]

# ── Default role definitions ──────────────────────────────────────────────────
ROLES: dict[str, dict] = {
    "Admin": {
        "description": "Full system access",
        "permissions": [p[0] for p in PERMISSIONS],  # all
    },
    "Project Manager": {
        "description": "Manages projects and teams",
        "permissions": [
            "create_project", "read_project", "update_project",
            "upload_file", "read_file",
            "configure_sync", "view_sync",
            "assign_project_users",
        ],
    },
    "Designer/Engineer": {
        "description": "Technical project contributor",
        "permissions": [
            "read_project", "upload_file", "read_file", "view_sync",
        ],
    },
    "Field Personnel": {
        "description": "On-site team member with upload capability",
        "permissions": [
            "read_project", "read_file", "upload_file",
        ],
    },
    "External Client": {
        "description": "Read-only external stakeholder access",
        "permissions": [
            "read_project", "read_file",
        ],
    },
}


async def seed_initial_data(db: AsyncSession) -> None:
    try:
        # ── 1. Permissions ────────────────────────────────────────────────
        permission_map: dict[str, Permission] = {}
        for name, description in PERMISSIONS:
            result = await db.execute(
                select(Permission).where(Permission.name == name)
            )
            perm = result.scalar_one_or_none()
            if perm is None:
                perm = Permission(name=name, description=description)
                db.add(perm)
                await db.flush()
                logger.info("Seeded permission: %s", name)
            permission_map[name] = perm

        # ── 2. Roles + permission associations ────────────────────────────
        for role_name, role_meta in ROLES.items():
            result = await db.execute(select(Role).where(Role.name == role_name))
            role = result.scalar_one_or_none()
            if role is None:
                role = Role(name=role_name, description=role_meta["description"])
                db.add(role)
                await db.flush()
                logger.info("Seeded role: %s", role_name)

            for perm_name in role_meta["permissions"]:
                perm = permission_map.get(perm_name)
                if perm is None:
                    continue
                existing_rp = await db.execute(
                    select(RolePermission).where(
                        RolePermission.role_id == role.id,
                        RolePermission.permission_id == perm.id,
                    )
                )
                if existing_rp.scalar_one_or_none() is None:
                    db.add(RolePermission(role_id=role.id, permission_id=perm.id))

        await db.commit()

        # ── 3. Optional admin superuser ───────────────────────────────────
        if settings.ADMIN_EMAIL and settings.ADMIN_PASSWORD:
            result = await db.execute(
                select(User).where(User.email == settings.ADMIN_EMAIL)
            )
            admin = result.scalar_one_or_none()
            if admin is None:
                admin = User(
                    email=settings.ADMIN_EMAIL,
                    password_hash=hash_password(settings.ADMIN_PASSWORD),
                    full_name=settings.ADMIN_FULL_NAME,
                    is_active=True,
                    is_superuser=True,
                )
                db.add(admin)
                await db.flush()

                # Assign the "Admin" role to the superuser as well
                admin_role_result = await db.execute(
                    select(Role).where(Role.name == "Admin")
                )
                admin_role = admin_role_result.scalar_one_or_none()
                if admin_role:
                    db.add(UserRole(user_id=admin.id, role_id=admin_role.id))

                await db.commit()
                logger.info("Seeded admin user: %s", settings.ADMIN_EMAIL)

    except Exception:
        await db.rollback()
        logger.exception("Failed to seed initial data – rolling back")
        raise
