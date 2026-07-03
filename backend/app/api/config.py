from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.user import User, DashboardPreference
from app.models.metrics import Threshold
from app.models.system import Setting, AuditLog
from app.repositories import SettingRepository, PreferenceRepository
from app.schemas.config import ThresholdUpdateRequest, SettingUpdateRequest, PreferenceUpdateRequest
from app.services.audit_log import AuditLogService
from datetime import datetime, timezone
from typing import List

router = APIRouter(prefix="/config", tags=["Configuration"])

# Enforce Admin verification for system settings and thresholds modifications
admin_checker = RoleChecker(allowed_roles=["Admin"])

@router.get("/thresholds")
def get_thresholds(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns list of all configured performance boundaries.
    """
    thresholds = db.query(Threshold).filter(Threshold.is_deleted == False).all()
    return {
        "success": True,
        "message": "Thresholds retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            {
                "metric": t.metric,
                "good": t.good,
                "warning": t.warning,
                "critical": t.critical
            } for t in thresholds
        ]
    }

@router.put("/thresholds/{metric}")
def update_threshold(
    metric: str,
    payload: ThresholdUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_checker)
):
    """
    Restricted to Admins. Updates performance boundary targets. Logs Audit trails.
    """
    threshold = db.query(Threshold).filter(Threshold.metric == metric, Threshold.is_deleted == False).first()
    if not threshold:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threshold metric not found.")

    ip_addr = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    old_val = {"good": threshold.good, "warning": threshold.warning, "critical": threshold.critical}
    new_val = {"good": payload.good, "warning": payload.warning, "critical": payload.critical}

    threshold.good = payload.good
    threshold.warning = payload.warning
    threshold.critical = payload.critical
    threshold.updated_at = datetime.now(timezone.utc)

    # Log operational audit
    AuditLogService.log_action(
        db=db,
        action=f"UPDATE_THRESHOLD_{metric.upper()}",
        user_id=current_user.id,
        old_value=old_val,
        new_value=new_val,
        ip=ip_addr,
        browser=user_agent
    )
    db.commit()

    return {
        "success": True,
        "message": f"Threshold for {metric} updated.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": new_val
    }

@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns global system parameters (Company Name, Timezone, SLA Targets).
    """
    settings_list = db.query(Setting).filter(Setting.is_deleted == False).all()
    return {
        "success": True,
        "message": "System configurations retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {s.key: s.value for s in settings_list}
    }

@router.put("/settings/{key}")
def update_setting(
    key: str,
    payload: SettingUpdateRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_checker)
):
    """
    Restricted to Admins. Updates core settings parameters. Logs Audit trails.
    """
    setting = db.query(Setting).filter(Setting.key == key, Setting.is_deleted == False).first()
    if not setting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="System setting not found.")

    ip_addr = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    old_val = setting.value
    setting.value = payload.value
    setting.updated_at = datetime.now(timezone.utc)

    AuditLogService.log_action(
        db=db,
        action=f"UPDATE_SETTING_{key.upper()}",
        user_id=current_user.id,
        old_value=old_val,
        new_value=payload.value,
        ip=ip_addr,
        browser=user_agent
    )
    db.commit()

    return {
        "success": True,
        "message": f"Setting key {key} modified.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {"key": key, "value": setting.value}
    }

@router.put("/preferences")
def update_preferences(
    payload: PreferenceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enables any user to save dashboard theme, positions, and favorites directly in the DB.
    """
    pref_repo = PreferenceRepository(db)
    pref = pref_repo.get_by_user_id(current_user.id)
    
    if not pref:
        # Create one if missing
        pref = DashboardPreference(user_id=current_user.id)
        db.add(pref)
        db.flush()

    if payload.theme is not None:
        pref.theme = payload.theme
    if payload.sidebar_collapsed is not None:
        pref.sidebar_collapsed = payload.sidebar_collapsed
    if payload.default_date_filter is not None:
        pref.default_date_filter = payload.default_date_filter
    if payload.widget_positions is not None:
        pref.widget_positions = payload.widget_positions
    if payload.favorite_dashboard is not None:
        pref.favorite_dashboard = payload.favorite_dashboard
    if payload.language is not None:
        pref.language = payload.language
    if payload.rows_per_page is not None:
        pref.rows_per_page = payload.rows_per_page

    pref.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "success": True,
        "message": "User preferences stored successfully.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "theme": pref.theme,
            "sidebar_collapsed": pref.sidebar_collapsed,
            "default_date_filter": pref.default_date_filter,
            "widget_positions": pref.widget_positions,
            "favorite_dashboard": pref.favorite_dashboard,
            "language": pref.language,
            "rows_per_page": pref.rows_per_page
        }
    }

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(admin_checker)):
    """
    Restricted to Admins. Returns list of all operational audit entries.
    """
    logs = db.query(AuditLog).filter(AuditLog.is_deleted == False).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return {
        "success": True,
        "message": "Operational audit logs retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            {
                "id": str(l.id),
                "user_email": l.user.email if l.user else "System",
                "action": l.action,
                "old_value": l.old_value,
                "new_value": l.new_value,
                "ip": l.ip,
                "browser": l.browser,
                "result": l.result,
                "timestamp": l.timestamp.isoformat()
            } for l in logs
        ]
    }

