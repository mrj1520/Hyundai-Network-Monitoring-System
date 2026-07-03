from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import get_current_user, RoleChecker
from app.models.user import User
from app.models.alerts import Incident, AlertHistory
from app.schemas.incidents import IncidentAssignRequest, IncidentResolveRequest
from datetime import datetime, timezone
from uuid import UUID

router = APIRouter(prefix="/incidents", tags=["Incident Management"])

# Only Admins and regular Users can inspect incidents; but only Admin role can update / assign.
admin_checker = RoleChecker(allowed_roles=["Admin"])

@router.get("")
def list_incidents(
    site_id: str = None, 
    status: str = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Returns lists of all operational incidents, optionally filtered by site_id or status.
    """
    query = db.query(Incident).filter(Incident.is_deleted == False)
    
    if site_id:
        query = query.join(Incident.alert).filter(Incident.alert.has(site_id=site_id))
    if status:
        query = query.filter(Incident.status == status)
        
    incidents = query.order_by(Incident.created_at.desc()).all()
    
    # Fetch list of possible assignees (all admins or users) for assignment selector
    operators = db.query(User).filter(User.is_deleted == False).all()
    
    return {
        "success": True,
        "message": "Incident tickets retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            {
                "id": str(i.id),
                "alert_id": str(i.alert_id),
                "site_name": i.alert.site.name if i.alert else "N/A",
                "category": i.alert.category.name if i.alert else "N/A",
                "severity": i.alert.severity.name if i.alert else "N/A",
                "description": i.alert.description if i.alert else "N/A",
                "recommendation": i.alert.recommendation if i.alert else "N/A",
                "assigned_to_user_id": str(i.assigned_to_user_id) if i.assigned_to_user_id else None,
                "assigned_to_email": i.assigned_to.email if i.assigned_to else "Unassigned",
                "status": i.status,
                "resolution": i.resolution,
                "created_at": i.created_at.isoformat(),
                "closed_at": i.closed_at.isoformat() if i.closed_at else None
            } for i in incidents
        ],
        "meta": {
            "operators": [{"id": str(op.id), "email": op.email} for op in operators]
        }
    }

@router.post("/{incident_id}/assign")
def assign_incident(
    incident_id: UUID,
    payload: IncidentAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_checker)
):
    """
    Assigns the ticket to a user. Restricted to Admin operators.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.is_deleted == False).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ticket not found.")
        
    assignee = db.query(User).filter(User.id == payload.assigned_to_user_id, User.is_deleted == False).first()
    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned operator not found.")
        
    incident.assigned_to_user_id = assignee.id
    incident.status = "Acknowledged" # Transition to Acknowledged on assignment
    
    # Write to alert history
    if incident.alert:
        incident.alert.status = "Acknowledged"
        history = AlertHistory(
            alert_id=incident.alert_id,
            status="Acknowledged",
            remarks=f"Ticket assigned to {assignee.email} by {current_user.email}.",
            updated_by_user_id=current_user.id,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(history)
        
    db.commit()
    return {
        "success": True,
        "message": f"Incident ticket successfully assigned to {assignee.email}.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/{incident_id}/resolve")
def resolve_incident(
    incident_id: UUID,
    payload: IncidentResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_checker)
):
    """
    Resolves/closes the ticket. Restricted to Admin operators.
    """
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.is_deleted == False).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident ticket not found.")
        
    incident.status = payload.status
    incident.resolution = payload.resolution
    incident.closed_at = datetime.now(timezone.utc)
    
    # Write to alert history
    if incident.alert:
        incident.alert.status = payload.status
        incident.alert.resolved_at = datetime.now(timezone.utc)
        
        history = AlertHistory(
            alert_id=incident.alert_id,
            status=payload.status,
            remarks=f"Incident resolved by {current_user.email}. Action: {payload.resolution}",
            updated_by_user_id=current_user.id,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(history)
        
    db.commit()
    return {
        "success": True,
        "message": "Incident status updated successfully.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
