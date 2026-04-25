"""
WebSocket connection manager.

Supports:
 - Per-project broadcast channels
 - Global broadcast
 - Graceful disconnection on send failure
"""
from __future__ import annotations

import asyncio
import logging
from typing import Dict, Set

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        # project_id → set of active WebSocket connections
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._lock = asyncio.Lock()

    # ── Lifecycle ─────────────────────────────────────────────────────────
    async def connect(self, websocket: WebSocket, project_id: str) -> None:
        await websocket.accept()
        async with self._lock:
            self._connections.setdefault(project_id, set()).add(websocket)
        logger.info("WS connected  project=%s total=%d", project_id, self.count(project_id))

    async def disconnect(self, websocket: WebSocket, project_id: str) -> None:
        async with self._lock:
            channel = self._connections.get(project_id)
            if channel:
                channel.discard(websocket)
                if not channel:
                    del self._connections[project_id]
        logger.info("WS disconnected project=%s remaining=%d", project_id, self.count(project_id))

    # ── Messaging ─────────────────────────────────────────────────────────
    async def broadcast_to_project(self, project_id: str, message: dict) -> None:
        """Send a JSON message to all connections subscribed to a project."""
        snapshot: Set[WebSocket] = set()
        async with self._lock:
            snapshot = set(self._connections.get(project_id, set()))

        stale: Set[WebSocket] = set()
        for ws in snapshot:
            try:
                await ws.send_json(message)
            except Exception:
                stale.add(ws)

        if stale:
            async with self._lock:
                channel = self._connections.get(project_id)
                if channel:
                    channel -= stale
                    if not channel:
                        del self._connections[project_id]

    async def broadcast_all(self, message: dict) -> None:
        """Send a JSON message to every connected client."""
        for project_id in list(self._connections):
            await self.broadcast_to_project(project_id, message)

    async def send_personal(self, websocket: WebSocket, message: dict) -> None:
        """Send a JSON message to a single connection."""
        try:
            await websocket.send_json(message)
        except Exception:
            logger.warning("Failed to send personal message – client may have disconnected")

    # ── Introspection ─────────────────────────────────────────────────────
    def count(self, project_id: str) -> int:
        return len(self._connections.get(project_id, set()))

    def total_connections(self) -> int:
        return sum(len(v) for v in self._connections.values())

    def active_projects(self) -> list[str]:
        return list(self._connections.keys())


# ── Singleton ─────────────────────────────────────────────────────────────────
manager = ConnectionManager()
