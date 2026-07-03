from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import RoleChecker, get_current_user
from app.models.user import User
from app.schemas.metrics import MetricInput
from app.services.data_input import DataInputService
from app.services.health import HealthService
from app.repositories import MetricRepository, AlertRepository
from app.realtime.broadcaster import SocketBroadcaster
from datetime import datetime, timezone
import asyncio

router = APIRouter(prefix="/metrics", tags=["Metrics"])

# Enforce authorization: Admin and NOC_Engineer can input daily metrics
auth_checker = RoleChecker(allowed_roles=["Admin", "NOC_Engineer"])

@router.post("/input")
async def input_metrics(
    payload: MetricInput,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_checker)
):
    """
    Submits daily raw network and power metrics. Runs downstream calculations
    (health, availability, SLA, active alerts) and broadcasts updates to dashboards.
    """
    ip_addr = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    try:
        # 1. Submit metrics (which runs health calculations and alerts evaluations)
        raw_metric = DataInputService.submit_metrics(
            db=db,
            site_id=payload.site_id,
            isp_id=payload.isp_id,
            download_speed=payload.download_speed,
            upload_speed=payload.upload_speed,
            ping=payload.ping,
            jitter=payload.jitter,
            packet_loss=payload.packet_loss,
            bandwidth_utilization=payload.bandwidth_utilization,
            internet_status_name=payload.internet_status,
            power_status_name=payload.power_status,
            user_id=current_user.id,
            ip=ip_addr,
            browser=user_agent
        )

        # 2. Extract latest database records for Socket broadcast
        alert_repo = AlertRepository(db)
        active_alerts = alert_repo.get_active_alerts(site_id=payload.site_id)
        
        # Calculate recent health score trend for frontend charts
        health_history = db.query(raw_metric.site.HealthScore.__class__).filter(
            raw_metric.site.HealthScore.__class__.site_id == payload.site_id
        ).order_by(raw_metric.site.HealthScore.__class__.created_at.desc()).limit(10).all()
        
        # Compute dynamic availability stats
        avail_stats = HealthService.calculate_availability(db, payload.site_id)

        # Prepare Socket payload
        socket_payload = {
            "site_id": str(payload.site_id),
            "site_name": raw_metric.site.name,
            "metric": {
                "id": str(raw_metric.id),
                "download_speed": raw_metric.download_speed,
                "upload_speed": raw_metric.upload_speed,
                "ping": raw_metric.ping,
                "jitter": raw_metric.jitter,
                "packet_loss": raw_metric.packet_loss,
                "bandwidth_utilization": raw_metric.bandwidth_utilization,
                "internet_status": payload.internet_status,
                "power_status": payload.power_status,
                "timestamp": raw_metric.timestamp.isoformat()
            },
            "health": {
                "score": health_history[0].score if health_history else 100.0,
                "internet_score": health_history[0].internet_score if health_history else 100.0,
                "power_score": health_history[0].power_score if health_history else 100.0,
                "performance_score": health_history[0].performance_score if health_history else 100.0,
            },
            "availability": avail_stats,
            "alerts": [
                {
                    "id": str(a.id),
                    "category": a.category.name,
                    "severity": a.severity.name,
                    "status": a.status,
                    "description": a.description,
                    "created_at": a.created_at.isoformat()
                } for a in active_alerts
            ]
        }

        # 3. Fire Socket.IO broadcasts concurrently
        asyncio.create_task(SocketBroadcaster.broadcast_kpi_update(socket_payload))

        return {
            "success": True,
            "message": "Metrics recorded and dashboard updated in real-time.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {
                "metric_id": str(raw_metric.id)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to record metrics: {e}"
        )
