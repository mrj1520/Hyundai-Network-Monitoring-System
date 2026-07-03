import socketio
from loguru import logger
from typing import Any

# Configure Socket.IO ASGI server
# cors_allowed_origins="*" allows React dev server connectivity
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

class SocketBroadcaster:
    @staticmethod
    async def emit_event(event_name: str, payload: Any):
        """Helper to safely broadcast real-time events to all connected clients."""
        try:
            logger.info(f"Broadcasting Socket.IO event: {event_name}")
            await sio.emit(event_name, payload)
        except Exception as e:
            logger.error(f"Failed to emit socket event {event_name}: {e}")

    @classmethod
    async def broadcast_kpi_update(cls, payload: Any):
        await cls.emit_event("kpi_updated", payload)

    @classmethod
    async def broadcast_alert_created(cls, payload: Any):
        await cls.emit_event("alert_created", payload)

    @classmethod
    async def broadcast_alert_resolved(cls, payload: Any):
        await cls.emit_event("alert_resolved", payload)

    @classmethod
    async def broadcast_health_update(cls, payload: Any):
        await cls.emit_event("health_updated", payload)

# Bind standard Socket.IO server events for monitoring connection health
@sio.event
async def connect(sid, environ, auth=None):
    logger.info(f"Socket Client Connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Socket Client Disconnected: {sid}")
