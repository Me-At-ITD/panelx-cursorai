from __future__ import annotations

from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project, ProjectUser
from app.models.role import Role, UserRole
from app.models.user import User
from app.schemas.project import (
    AssignUserToProjectRequest,
    BulkAssignResponse,
    ProjectCreate,
    ProjectUpdate,
    RemoveUserFromProjectRequest,
    UpdateUserProjectsRequest,
)

# Roles whose members can see / manage all projects without explicit membership
_PRIVILEGED_ROLES = {"Admin", "Project Manager"}


class ProjectService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    # ── Helpers ───────────────────────────────────────────────────────────
    async def _has_privileged_role(self, user_id: UUID) -> bool:
        """Return True if the user holds an Admin or Project Manager global role."""
        result = await self.db.execute(
            select(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                Role.name.in_(_PRIVILEGED_ROLES),
            )
            .limit(1)
        )
        return result.scalar_one_or_none() is not None

    # ── Project CRUD ──────────────────────────────────────────────────────
    async def create_project(self, data: ProjectCreate, owner_id: UUID) -> Project:
        project = Project(
            name=data.name,
            description=data.description,
            owner_id=owner_id,
        )
        self.db.add(project)
        await self.db.flush()

        # Auto-enroll the creator as a project member
        self.db.add(
            ProjectUser(
                user_id=owner_id,
                project_id=project.id,
                assigned_by=owner_id,
            )
        )
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def get_project(self, project_id: UUID) -> Project:
        result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        project = result.scalar_one_or_none()
        if project is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return project

    async def list_projects(
        self,
        user: User,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Project], int]:
        """
        - Superusers / Admin / Project Manager → all projects
        - Everyone else → only projects they own or are members of
        """
        from sqlalchemy.orm import selectinload
        see_all = user.is_superuser or await self._has_privileged_role(user.id)

        if see_all:
            count_result = await self.db.execute(select(Project))
            result = await self.db.execute(
                select(Project)
                .options(
                    selectinload(Project.project_users).selectinload(ProjectUser.user),
                    selectinload(Project.project_users).selectinload(ProjectUser.role),
                )
                .offset(skip).limit(limit)
            )
        else:
            subq = (
                select(ProjectUser.project_id)
                .where(ProjectUser.user_id == user.id)
                .scalar_subquery()
            )
            query = select(Project).where(
                or_(Project.owner_id == user.id, Project.id.in_(subq))
            )
            count_result = await self.db.execute(query)
            result = await self.db.execute(
                query.options(
                    selectinload(Project.project_users).selectinload(ProjectUser.user),
                    selectinload(Project.project_users).selectinload(ProjectUser.role),
                )
                .offset(skip).limit(limit)
            )

        total = len(list(count_result.scalars().all()))
        projects = list(result.scalars().all())
        return projects, total

    async def update_project(self, project_id: UUID, data: ProjectUpdate) -> Project:
        project = await self.get_project(project_id)
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.status is not None:
            allowed_statuses = {"active", "archived", "completed"}
            if data.status not in allowed_statuses:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid status. Allowed: {', '.join(sorted(allowed_statuses))}",
                )
            project.status = data.status
        await self.db.commit()
        await self.db.refresh(project)
        return project

    async def delete_project(self, project_id: UUID) -> None:
        project = await self.get_project(project_id)
        await self.db.delete(project)
        await self.db.commit()

    async def get_total_projects_count(self) -> dict:
        """Get the total number of projects and count by status."""
        # Get total count
        total_result = await self.db.execute(
            select(func.count(Project.id))
        )
        total = total_result.scalar() or 0

        # Get count by status
        statuses = ["active", "on_hold", "completed"]
        status_counts = {}

        for status in statuses:
            count_result = await self.db.execute(
                select(func.count(Project.id)).where(Project.status == status)
            )
            status_counts[status] = count_result.scalar() or 0

        return {
            "total": total,
            "active": status_counts.get("active", 0),
            "on_hold": status_counts.get("on_hold", 0),
            "completed": status_counts.get("completed", 0),
        }

    # ── User assignment ───────────────────────────────────────────────────
    async def assign_user(
        self,
        data: AssignUserToProjectRequest,
        assigned_by_id: UUID,
    ) -> BulkAssignResponse:
        """Assign a user to one or more projects. Returns created and skipped project IDs."""
        # Verify user exists
        user_result = await self.db.execute(
            select(User).where(User.id == data.user_id)
        )
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        assigned: list[ProjectUser] = []
        skipped: list[UUID] = []

        for project_id in data.project_ids:
            # Verify project exists
            await self.get_project(project_id)

            existing = await self.db.execute(
                select(ProjectUser).where(
                    ProjectUser.user_id == data.user_id,
                    ProjectUser.project_id == project_id,
                )
            )
            if existing.scalar_one_or_none() is not None:
                skipped.append(project_id)
                continue

            pu = ProjectUser(
                user_id=data.user_id,
                project_id=project_id,
                role_id=data.role_id,
                assigned_by=assigned_by_id,
            )
            self.db.add(pu)
            assigned.append(pu)

        await self.db.commit()
        for pu in assigned:
            await self.db.refresh(pu)

        return BulkAssignResponse(assigned=assigned, skipped=skipped)

    async def update_user_projects(
        self,
        data: UpdateUserProjectsRequest,
        assigned_by_id: UUID,
    ) -> BulkAssignResponse:
        """Replace all project assignments for a user with the provided list."""
        # Verify user exists
        user_result = await self.db.execute(
            select(User).where(User.id == data.user_id)
        )
        if user_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Verify all target projects exist
        for project_id in data.project_ids:
            await self.get_project(project_id)

        # Remove all existing assignments for this user
        await self.db.execute(
            delete(ProjectUser).where(ProjectUser.user_id == data.user_id)
        )

        # Insert fresh assignments
        new_assignments: list[ProjectUser] = []
        for project_id in data.project_ids:
            pu = ProjectUser(
                user_id=data.user_id,
                project_id=project_id,
                role_id=data.role_id,
                assigned_by=assigned_by_id,
            )
            self.db.add(pu)
            new_assignments.append(pu)

        await self.db.commit()
        for pu in new_assignments:
            await self.db.refresh(pu)

        return BulkAssignResponse(assigned=new_assignments, skipped=[])

    async def remove_user_from_project(
        self,
        data: RemoveUserFromProjectRequest,
    ) -> None:
        result = await self.db.execute(
            select(ProjectUser).where(
                ProjectUser.user_id == data.user_id,
                ProjectUser.project_id == data.project_id,
            )
        )
        assignment = result.scalar_one_or_none()
        if assignment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User is not a member of this project",
            )
        await self.db.delete(assignment)
        await self.db.commit()

