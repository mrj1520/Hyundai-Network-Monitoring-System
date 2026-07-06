from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import socketio
import os

from app.core.config import settings
from app.database.connection import engine, Base
from app.database.seeder import run_seeder
from app.scheduler.manager import SchedulerManager
from app.realtime.broadcaster import sio

# Import all routers
from app.api import (
    auth_router,
    dashboard_router,
    metrics_router,
    alerts_router,
    config_router,
    reports_router,
    incidents_router
)

# 1. Initialize FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 2. Configure CORS middleware (cross-origin resource sharing for react/socket)
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://hyundaitestnoc-com.up.railway.app",
    "https://gallant-kindness-production-a88d.up.railway.app"
]
_additional_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
if _additional_origins:
    allowed_origins.extend([o.strip() for o in _additional_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mount static directory for reports exports
export_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reports_export")
os.makedirs(export_dir, exist_ok=True)
app.mount("/reports_export", StaticFiles(directory=export_dir), name="reports_export")

# 4. Include API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(metrics_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(config_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")

# 5. Mount Socket.IO server as ASGI wrapper
# This intercepts websocket handshakes on /socket.io/ and routes other requests to FastAPI
sio_asgi = socketio.ASGIApp(sio, other_asgi_app=app)

@app.on_event("startup")
async def startup_event():
    # Setup tables and seed baseline metrics
    logger_info = "Initializing Hyundai Network Database and Lookup structures..."
    print(logger_info)
    try:
        run_seeder()
    except Exception as e:
        print(f"WARNING: Seeder failed — {e}")
        print("App will continue without database seed.")
    
    # Start background scheduled backup and cleanup jobs
    SchedulerManager.start()

@app.on_event("shutdown")
async def shutdown_event():
    # Cleanly stop scheduler threads
    SchedulerManager.shutdown()
