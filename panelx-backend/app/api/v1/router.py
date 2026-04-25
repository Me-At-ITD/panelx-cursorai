from fastapi import APIRouter

from app.api.v1.endpoints import auth, files, panels, projects, roles, sync, users

api_router = APIRouter()

api_router.include_router(auth.router,     prefix="/auth",     tags=["Authentication"])
api_router.include_router(users.router,    prefix="/users",    tags=["Users"])
api_router.include_router(roles.router,    prefix="/roles",    tags=["Roles & Permissions"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(files.router,    prefix="/files",    tags=["Files"])
api_router.include_router(panels.router,   prefix="/panels",   tags=["Panels"])
api_router.include_router(sync.router,     prefix="/sync",     tags=["File Sync"])
