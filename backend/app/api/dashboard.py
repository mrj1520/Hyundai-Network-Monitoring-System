from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.masters import Site, ISP
from app.models.metrics import RawMetric, HealthScore
from app.models.lookups import InternetStatus, PowerStatus
from app.repositories import MetricRepository, AlertRepository, MasterRepository
from app.services.health import HealthService
from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import Optional, List

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    site_id: Optional[UUID] = Query(None, description="Filter metrics by Site UUID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns executive summary data including health scores, power/internet statuses,
    availability stats, SLA compliance, and open incidents.
    """
    # 1. Determine site
    m_repo = MasterRepository(db)
    sites = m_repo.list_sites()
    if not sites:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No sites found in master records.")
        
    selected_site_id = site_id if site_id else sites[0].id
    
    # 2. Get latest raw metrics & health scores
    metric_repo = MetricRepository(db)
    latest_metric = db.query(RawMetric).filter(
        RawMetric.site_id == selected_site_id,
        RawMetric.is_deleted == False
    ).order_by(RawMetric.timestamp.desc()).first()

    latest_health = db.query(HealthScore).filter(
        HealthScore.site_id == selected_site_id,
        HealthScore.is_deleted == False
    ).order_by(HealthScore.timestamp.desc()).first()

    # 3. Calculate availabilities (last 30 days)
    avail_stats = HealthService.calculate_availability(db, selected_site_id)

    # 4. Active alerts count
    alert_repo = AlertRepository(db)
    active_alerts = alert_repo.get_active_alerts(site_id=selected_site_id)

    # 5. SLA & downtime calculations (mocked or aggregated from logs/metrics)
    # Simple SLA formula: Internet availability
    today_sla = avail_stats["internet"]
    
    # Downtime duration today: sum duration of raw metrics that were offline today (assuming 1 hour sample interval or count of disconnected statuses)
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    disconnected_count = db.query(RawMetric).join(InternetStatus).filter(
        RawMetric.site_id == selected_site_id,
        RawMetric.timestamp >= today_start,
        InternetStatus.name != "Connected",
        RawMetric.is_deleted == False
    ).count()
    today_downtime = disconnected_count * 15 # assuming 15 min updates

    # Get status values
    int_status_name = "Unknown"
    if latest_metric and latest_metric.internet_status:
        int_status_name = latest_metric.internet_status.name
        
    pwr_status_name = "Unknown"
    if latest_metric and latest_metric.power_status:
        pwr_status_name = latest_metric.power_status.name

    return {
        "success": True,
        "message": "Dashboard executive summary retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "site_id": str(selected_site_id),
            "site_name": next((s.name for s in sites if s.id == selected_site_id), "Unknown"),
            "health_score": round(latest_health.score, 1) if latest_health else 100.0,
            "internet_status": int_status_name,
            "power_status": pwr_status_name,
            "availability_internet": avail_stats["internet"],
            "availability_power": avail_stats["power"],
            "today_sla": today_sla,
            "today_downtime_minutes": float(today_downtime),
            "active_alerts_count": len(active_alerts),
            "last_updated": latest_metric.timestamp if latest_metric else datetime.now(timezone.utc)
        }
    }

@router.get("/charts")
def get_dashboard_charts(
    site_id: Optional[UUID] = Query(None),
    days: int = Query(7),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns time-series metrics formatted for dashboard Recharts area/line charts.
    """
    m_repo = MasterRepository(db)
    sites = m_repo.list_sites()
    if not sites:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No sites registered.")
        
    selected_site_id = site_id if site_id else sites[0].id
    site_name = next((s.name for s in sites if s.id == selected_site_id), "Unknown")

    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    end_date = datetime.now(timezone.utc)

    metric_repo = MetricRepository(db)
    metrics = metric_repo.get_metrics_range(start_date, end_date, selected_site_id)

    timeline = []
    for m in metrics:
        timeline.append({
            "timestamp": m.timestamp.isoformat(),
            "download_speed": round(m.download_speed, 1),
            "upload_speed": round(m.upload_speed, 1),
            "ping": round(m.ping, 1),
            "jitter": round(m.jitter, 1),
            "packet_loss": round(m.packet_loss, 1),
            "bandwidth_utilization": round(m.bandwidth_utilization, 1)
        })

    return {
        "success": True,
        "message": f"Time-series metrics retrieved for last {days} days.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "site_id": str(selected_site_id),
            "site_name": site_name,
            "timeline": timeline
        }
    }

@router.get("/sites")
def get_sites_list(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns all monitored branch sites with their latest health score status.
    """
    m_repo = MasterRepository(db)
    sites = m_repo.list_sites()
    
    result = []
    for s in sites:
        latest_health = db.query(HealthScore).filter(
            HealthScore.site_id == s.id,
            HealthScore.is_deleted == False
        ).order_by(HealthScore.timestamp.desc()).first()
        
        latest_metric = db.query(RawMetric).filter(
            RawMetric.site_id == s.id,
            RawMetric.is_deleted == False
        ).order_by(RawMetric.timestamp.desc()).first()

        result.append({
            "id": str(s.id),
            "name": s.name,
            "health_score": round(latest_health.score, 1) if latest_health else 100.0,
            "internet_status": latest_metric.internet_status.name if latest_metric and latest_metric.internet_status else "Unknown",
            "power_status": latest_metric.power_status.name if latest_metric and latest_metric.power_status else "Unknown"
        })

    return {
        "success": True,
        "message": "Sites health status list retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": result
    }

@router.get("/isps")
def get_isps_list(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns list of all available ISPs in lookup records.
    """
    m_repo = MasterRepository(db)
    isps = m_repo.list_isps()
    return {
        "success": True,
        "message": "ISPs list retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [{"id": str(i.id), "name": i.name} for i in isps]
    }
