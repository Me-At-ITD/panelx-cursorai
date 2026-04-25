from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission, require_project_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.project import (
    AssignUserToProjectRequest,
    BulkAssignResponse,
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectStatsResponse,
    ProjectUpdate,
    RemoveUserFromProjectRequest,
    UpdateUserProjectsRequest,
)
from app.services.project_service import ProjectService

router = APIRouter()


# ── Project CRUD ──────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project (Admin / Project Manager only)",
)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(require_permission("create_project")),
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(db)
    project = await service.create_project(data, owner_id=current_user.id)
    return ProjectResponse.model_validate(project)


@router.get(
    "",
    response_model=ProjectListResponse,
    summary="List projects (Admin/PM: all | others: assigned only)",
)
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_permission("read_project")),
    db: AsyncSession = Depends(get_db),
) -> ProjectListResponse:
    service = ProjectService(db)
    projects, total = await service.list_projects(user=current_user, skip=skip, limit=limit)
    from app.schemas.project import ProjectAssignedUserResponse
    items = []
    for p in projects:
        users = []
        for pu in getattr(p, "project_users", []):
            if pu.user is not None:
                role_name = pu.role.name if getattr(pu, "role", None) is not None else None
                users.append(ProjectAssignedUserResponse(
                    user_id=pu.user.id,
                    full_name=pu.user.full_name,
                    email=pu.user.email,
                    role_id=pu.role_id,
                    role_name=role_name,
                ))
        item = ProjectResponse.model_validate(p)
        item.users = users
        items.append(item)
    return ProjectListResponse(
        total=total,
        items=items,
    )


@router.get(
    "/stats/total",
    response_model=ProjectStatsResponse,
    summary="Get total number of projects and count by status",
)
async def get_total_projects(
    current_user: User = Depends(require_permission("read_project")),
    db: AsyncSession = Depends(get_db),
) -> ProjectStatsResponse:
    service = ProjectService(db)
    stats = await service.get_total_projects_count()
    return ProjectStatsResponse(**stats)


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Get a single project by ID",
)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(require_permission("read_project")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(db)
    # Eager-load project_users, user, and role
    from sqlalchemy.orm import selectinload
    from app.models.project import Project, ProjectUser
    from app.schemas.project import ProjectAssignedUserResponse
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.project_users).selectinload(ProjectUser.user),
            selectinload(Project.project_users).selectinload(ProjectUser.role),
        )
        .where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    if project is None:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    users = []
    for pu in getattr(project, "project_users", []):
        if pu.user is not None:
            role_name = pu.role.name if getattr(pu, "role", None) is not None else None
            users.append(ProjectAssignedUserResponse(
                user_id=pu.user.id,
                full_name=pu.user.full_name,
                email=pu.user.email,
                role_id=pu.role_id,
                role_name=role_name,
            ))
    item = ProjectResponse.model_validate(project)
    item.users = users
    return item


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
    summary="Update a project (Admin / Project Manager only)",
)
async def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    current_user: User = Depends(require_permission("update_project")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> ProjectResponse:
    service = ProjectService(db)
    project = await service.update_project(project_id, data)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project (Admin / Project Manager only)",
)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(require_permission("delete_project")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = ProjectService(db)
    await service.delete_project(project_id)


# ── User assignment ───────────────────────────────────────────────────────────

@router.post(
    "/assign-user",
    response_model=BulkAssignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a user to one or more projects",
)
async def assign_user_to_projects(
    data: AssignUserToProjectRequest,
    current_user: User = Depends(require_permission("assign_project_users")),
    db: AsyncSession = Depends(get_db),
) -> BulkAssignResponse:
    service = ProjectService(db)
    return await service.assign_user(data, assigned_by_id=current_user.id)


@router.put(
    "/update-user-projects",
    response_model=BulkAssignResponse,
    summary="Replace all project assignments for a user",
)
async def update_user_projects(
    data: UpdateUserProjectsRequest,
    current_user: User = Depends(require_permission("assign_project_users")),
    db: AsyncSession = Depends(get_db),
) -> BulkAssignResponse:
    service = ProjectService(db)
    return await service.update_user_projects(data, assigned_by_id=current_user.id)


# @router.delete(
#     "/remove-user",
#     status_code=status.HTTP_204_NO_CONTENT,
#     summary="Remove a user from a project",
# )
# async def remove_user_from_project(
#     data: RemoveUserFromProjectRequest,
#     current_user: User = Depends(require_permission("assign_project_users")),
#     db: AsyncSession = Depends(get_db),
# ) -> None:
#     service = ProjectService(db)
#     await service.remove_user_from_project(data)




@router.delete("/{project_id}/users/{user_id}", status_code=204)
async def remove_user_from_project(
    project_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("assign_project_users")),
):
    service = ProjectService(db)
    await service.remove_user_from_project(
        RemoveUserFromProjectRequest(
            project_id=project_id,
            user_id=user_id
        )
    )    
