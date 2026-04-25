from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission, require_project_access
from app.core.database import get_db
from app.models.user import User
from app.schemas.file import FileListResponse, FileResponse, FileStatusResponse
from app.services.file_service import FileService

router = APIRouter()


@router.post(
    "/upload",
    response_model=FileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file to a project (max 250 MB)",
)
async def upload_file(
    project_id: UUID = Form(..., description="Target project UUID"),
    file: UploadFile = File(..., description="File to upload (max 250 MB)"),
    current_user: User = Depends(require_permission("upload_file")),
    db: AsyncSession = Depends(get_db),
) -> FileResponse:
    # Check project access inline (project_id is a form field, not path param)
    await require_project_access(project_id=project_id, current_user=current_user, db=db)
    service = FileService(db)
    file_record = await service.upload_file(
        upload=file,
        project_id=project_id,
        uploaded_by=current_user.id,
    )
    return FileResponse.model_validate(file_record)


@router.get(
    "/{project_id}",
    response_model=FileListResponse,
    summary="List files belonging to a project",
)
async def list_files(
    project_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> FileListResponse:
    service = FileService(db)
    files, total = await service.list_files(project_id, skip=skip, limit=limit)
    return FileListResponse(
        total=total,
        items=[FileResponse.model_validate(f) for f in files],
    )


@router.get(
    "/{project_id}/{file_id}/download-url",
    summary="Get a pre-signed download URL for a file",
)
async def get_download_url(
    project_id: UUID,
    file_id: UUID,
    expires_in: int = 3600,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = FileService(db)
    url = await service.get_download_url(file_id, expires_in=expires_in)
    return {"download_url": url, "expires_in": expires_in}


@router.delete(
    "/{project_id}/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a file from a project",
)
async def delete_file(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(require_permission("delete_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = FileService(db)
    await service.delete_file(file_id)


# ── Pipeline endpoints ─────────────────────────────────────────────────────────


@router.post(
    "/{project_id}/{file_id}/process",
    response_model=FileStatusResponse,
    summary="Dispatch the DWG processing pipeline for a file",
)
async def trigger_processing(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(require_permission("upload_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> FileStatusResponse:
    service = FileService(db)
    file_record = await service.trigger_processing(file_id)
    return FileStatusResponse.model_validate(file_record)


@router.get(
    "/{project_id}/{file_id}/status",
    response_model=FileStatusResponse,
    summary="Poll pipeline status and progress for a file",
)
async def get_file_status(
    project_id: UUID,
    file_id: UUID,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> FileStatusResponse:
    service = FileService(db)
    file_record = await service.get_file_status(file_id)
    return FileStatusResponse.model_validate(file_record)


@router.get(
    "/{project_id}/{file_id}/dxf-url",
    summary="Get a presigned download URL for the converted DXF",
)
async def get_dxf_url(
    project_id: UUID,
    file_id: UUID,
    expires_in: int = 3600,
    current_user: User = Depends(require_permission("read_file")),
    _access: User = Depends(require_project_access),
    db: AsyncSession = Depends(get_db),
) -> dict:
    service = FileService(db)
    url = await service.get_dxf_url(file_id, expires_in=expires_in)
    return {"dxf_url": url, "expires_in": expires_in}

