"""
WebSocket endpoint definitions.

/ws/projects/{project_id}  – subscribe to real-time updates for a project
/ws/status                 – server health / connection count (unauthenticated)
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import manager

logger = logging.getLogger(__name__)

ws_router = APIRouter()


@ws_router.websocket("/ws/projects/{project_id}")
async def project_updates(websocket: WebSocket, project_id: str) -> None:
    """
    Subscribe to real-time progress and notification events for a project.

    Messages received from the client are silently acknowledged so the
    connection stays alive; the server pushes events when background tasks
    complete (wired in Milestone 2+).
    """
    await manager.connect(websocket, project_id)
    try:
        await manager.send_personal(
            websocket,
            {
                "type": "connection_established",
                "project_id": project_id,
                "active_connections": manager.count(project_id),
            },
        )
        while True:
            # Keep connection alive; echo client pings
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        await manager.disconnect(websocket, project_id)
    except Exception as exc:
        logger.exception("Unexpected WebSocket error for project %s: %s", project_id, exc)
        await manager.disconnect(websocket, project_id)


@ws_router.websocket("/ws/status")
async def server_status(websocket: WebSocket) -> None:
    """Lightweight status endpoint – useful for monitoring & load-balancers."""
    await websocket.accept()
    try:
        await websocket.send_json(
            {
                "type": "status",
                "total_connections": manager.total_connections(),
                "active_projects": manager.active_projects(),
            }
        )
        await websocket.close()
    except Exception:
        pass
