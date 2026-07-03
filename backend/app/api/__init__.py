from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.metrics import router as metrics_router
from app.api.alerts import router as alerts_router
from app.api.config import router as config_router
from app.api.reports import router as reports_router
from app.api.incidents import router as incidents_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "metrics_router",
    "alerts_router",
    "config_router",
    "reports_router",
    "incidents_router"
]
