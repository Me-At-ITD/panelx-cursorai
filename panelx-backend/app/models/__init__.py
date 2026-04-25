# Import every model so SQLAlchemy's metadata is fully populated before
# Alembic inspects it for autogenerate or the app creates tables.
from app.models.user import User  # noqa: F401
from app.models.role import Role, Permission, UserRole, RolePermission  # noqa: F401
from app.models.project import Project, ProjectUser  # noqa: F401
from app.models.file import File  # noqa: F401
from app.models.sync import SyncConfig  # noqa: F401
from app.models.token import RefreshToken  # noqa: F401
from app.models.password_reset import PasswordResetToken  # noqa: F401

__all__ = [
    "User",
    "Role",
    "Permission",
    "UserRole",
    "RolePermission",
    "Project",
    "ProjectUser",
    "File",
    "SyncConfig",
    "RefreshToken",
    "PasswordResetToken",
]
