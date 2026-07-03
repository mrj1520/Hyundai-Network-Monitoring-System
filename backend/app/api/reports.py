from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.metrics import RawMetric
from app.models.system import Report
from app.repositories import MetricRepository, MasterRepository
from app.schemas.reports import ExportRequest
from datetime import datetime, timezone
import pandas as pd
import os
import uuid

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("")
def get_reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns list of all historically compiled reports.
    """
    reports = db.query(Report).filter(Report.is_deleted == False).order_by(Report.timestamp.desc()).all()
    return {
        "success": True,
        "message": "Report repository listings retrieved.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": [
            {
                "id": str(r.id),
                "title": r.title,
                "report_type": r.report_type,
                "file_path": r.file_path,
                "generated_by": r.generated_by.email if r.generated_by else "System",
                "timestamp": r.timestamp.isoformat()
            } for r in reports
        ]
    }

@router.post("/export")
def generate_report_export(
    payload: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compiles raw database metric ranges, formats them using Pandas,
    and writes out a downloadable report sheet.
    """
    # 1. Fetch metrics in date range
    metric_repo = MetricRepository(db)
    metrics = metric_repo.get_metrics_range(payload.start_date, payload.end_date, payload.site_id)

    if not metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No performance data available within the selected filters."
        )

    # 2. Compile metrics into pandas DataFrame
    data_list = []
    for m in metrics:
        data_list.append({
            "Timestamp": m.timestamp.replace(tzinfo=None), # Excel doesn't handle tz-aware datetimes cleanly in basic configs
            "Site": m.site.name,
            "ISP": m.isp.name,
            "Download Speed (Mbps)": m.download_speed,
            "Upload Speed (Mbps)": m.upload_speed,
            "Latency (ms)": m.ping,
            "Jitter (ms)": m.jitter,
            "Packet Loss (%)": m.packet_loss,
            "Bandwidth Utilization (%)": m.bandwidth_utilization,
            "Internet Status": m.internet_status.name,
            "Power Status": m.power_status.name
        })

    df = pd.DataFrame(data_list)

    # 3. Create reports directory
    reports_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
        "reports_export"
    )
    os.makedirs(reports_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"netpulse_{payload.report_type.lower()}_report_{timestamp}.xlsx"
    file_path = os.path.join(reports_dir, file_name)

    # Save to Excel
    try:
        df.to_excel(file_path, index=False, sheet_name="NOC Metrics")
    except Exception as e:
        # Fallback to CSV if openpyxl or excel writer encounters problems
        file_name = f"netpulse_{payload.report_type.lower()}_report_{timestamp}.csv"
        file_path = os.path.join(reports_dir, file_name)
        df.to_csv(file_path, index=False)

    # 4. Record generated report in DB
    report_record = Report(
        title=f"{payload.report_type} Report - {timestamp}",
        report_type=payload.report_type,
        file_path=f"/reports_export/{file_name}", # Servable path
        generated_by_user_id=current_user.id,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(report_record)
    db.commit()

    return {
        "success": True,
        "message": "Report compilation successful.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": {
            "report_id": str(report_record.id),
            "title": report_record.title,
            "file_url": report_record.file_path,
            "total_records": len(df)
        }
    }
