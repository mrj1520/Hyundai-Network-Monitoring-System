from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.user import User
from app.models.alerts import Alert, AlertHistory
from app.repositories import AlertRepository
from app.schemas.alerts import AcknowledgeAlertRequest
from datetime import datetime, timezone
from uuid import UUID
from typing import Optional

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# Enforce role restrictions for acknowledging alerts: NOC Engineer and Admin
ops_checker = RoleChecker(allowed_roles=["Admin", "NOC_Engineer"])

@router.get("")
def get_alerts(
    site_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"), # Open, Acknowledged, In Progress, Resolved, Closed
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all active alerts, with optional site and status filters.
    """
    alert_repo = AlertRepository(db)
    
    query = db.query(Alert).filter(Alert.is_deleted == False)
    if site_id:
        query = query.filter(Alert.site_id == site_id)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    else:
        # Default: only return unresolved alerts
        query = query.filter(Alert.status.in_(["Open", "Acknowledged", "In Progress"]))

    alerts = query.order_by(Alert.created_at.desc()).all()
    
    result = []
    for a in alerts:
        result.append({
            "id": str(a.id),
            "site_id": str(a.site_id),
            "site_name": a.site.name,
            "category": a.category.name,
            "severity": a.severity.name,
            "status": a.status,
            "affected_metric": a.affected_metric,
            "current_value": a.current_value,
            "threshold_value": a.threshold_value,
            "description": a.description,
            "recommendation": a.recommendation,
            "occurrence_count": a.occurrence_count,
            "created_at": a.created_at,
            "resolved_at": a.resolved_at,
            "history": [
                {
                    "id": str(h.id),
                    "status": h.status,
                    "timestamp": h.timestamp,
                    "remarks": h.remarks,
                    "updated_by_email": h.updated_by.email if h.updated_by else "System"
                } for h in a.history
            ]
        })

    return {
        "success": True,
        "message": "Alert listings retrieved successfully.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": result
    }

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: UUID,
    payload: AcknowledgeAlertRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(ops_checker)
):
    """
    Restricted to NOC Operators and Admins. Updates the alert status to Acknowledged.
    """
    alert_repo = AlertRepository(db)
    alert = alert_repo.get(alert_id)
    
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert record not found.")

    if alert.status in ["Resolved", "Closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Cannot acknowledge alert in state: {alert.status}."
        )

    # 1. Update Alert status
    old_status = alert.status
    alert.status = "Acknowledged"
    alert.updated_at = datetime.now(timezone.utc)
    
    # 2. Add history log
    history = AlertHistory(
        alert_id=alert.id,
        status="Acknowledged",
        remarks=payload.remarks if payload.remarks else "Alert acknowledged by operations personnel.",
        updated_by_user_id=current_user.id,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(history)
    db.commit()

    return {
        "success": True,
        "message": "Alert status updated to Acknowledged.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "alert_id": str(alert.id),
            "old_status": old_status,
            "new_status": "Acknowledged"
        }
    }
