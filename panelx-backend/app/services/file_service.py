from __future__ import annotations

from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.file import File
from app.models.project import Project
from app.services.s3_service import S3Service


class FileService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.s3 = S3Service()

    async def upload_file(
        self, upload: UploadFile, project_id: UUID, uploaded_by: UUID
    ) -> File:
        # Verify project exists
        project_result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        if project_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

        # Upload to object storage
        storage_info = await self.s3.upload_file(
            upload, str(project_id), prefix="projects"
        )

        # Derive a clean filename for display
        original_name = upload.filename or "unnamed"
        ext = ("." + original_name.rsplit(".", 1)[-1]) if "." in original_name else ""
        display_name = original_name

        file_record = File(
            project_id=project_id,
            filename=display_name,
            original_filename=original_name,
            file_size=storage_info["file_size"],
            content_type=upload.content_type,
            storage_key=storage_info["storage_key"],
            storage_url=storage_info["storage_url"],
            bucket_name=storage_info["bucket_name"],
            uploaded_by=uploaded_by,
        )
        self.db.add(file_record)
        await self.db.commit()
        await self.db.refresh(file_record)
        return file_record

    async def list_files(
        self, project_id: UUID, skip: int = 0, limit: int = 100
    ) -> Tuple[List[File], int]:
        result = await self.db.execute(
            select(File).where(File.project_id == project_id)
        )
        all_files = list(result.scalars().all())
        total = len(all_files)

        result_page = await self.db.execute(
            select(File)
            .where(File.project_id == project_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result_page.scalars().all()), total

    async def get_file(self, file_id: UUID) -> File:
        result = await self.db.execute(select(File).where(File.id == file_id))
        file_record = result.scalar_one_or_none()
        if file_record is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
            )
        return file_record

    async def delete_file(self, file_id: UUID) -> None:
        file_record = await self.get_file(file_id)
        await self.s3.delete_file(file_record.storage_key)
        await self.db.delete(file_record)
        await self.db.commit()

    async def get_download_url(self, file_id: UUID, expires_in: int = 3600) -> str:
        file_record = await self.get_file(file_id)
        return await self.s3.generate_presigned_url(
            file_record.storage_key, expires_in=expires_in
        )

    async def trigger_processing(self, file_id: UUID) -> File:
        """Dispatch a Celery DWG pipeline task and update the file record."""
        from app.workers.dwg_pipeline import process_dwg  # late import avoids circular

        file_record = await self.get_file(file_id)

        # Dispatch async Celery task
        task = process_dwg.delay(str(file_record.id), str(file_record.project_id))

        file_record.status = "processing"
        file_record.progress = 0
        file_record.task_id = task.id
        file_record.error_message = None
        await self.db.commit()
        await self.db.refresh(file_record)
        return file_record

    async def get_file_status(self, file_id: UUID) -> File:
        """Return the current pipeline status for a file."""
        return await self.get_file(file_id)

    async def get_dxf_url(self, file_id: UUID, expires_in: int = 3600) -> str:
        """Return a presigned URL for the converted DXF (after processing)."""
        file_record = await self.get_file(file_id)
        if not file_record.dxf_storage_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="DXF not available yet; file must be fully processed first",
            )
        return await self.s3.generate_presigned_url(
            file_record.dxf_storage_key, expires_in=expires_in
        )
