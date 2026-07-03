from sqlalchemy.orm import Session
from app.models.metrics import RawMetric
from app.models.lookups import InternetStatus, PowerStatus
from app.services.health import HealthService
from app.services.alerts import AlertService
from app.services.audit_log import AuditLogService
from app.repositories import MasterRepository, MetricRepository
from uuid import UUID
from datetime import datetime, timezone
from typing import Dict, Any

class DataInputService:
    @staticmethod
    def submit_metrics(
        db: Session,
        site_id: UUID,
        isp_id: UUID,
        download_speed: float,
        upload_speed: float,
        ping: float,
        jitter: float,
        packet_loss: float,
        bandwidth_utilization: float,
        internet_status_name: str, # Connected, Disconnected, Unstable, Degraded
        power_status_name: str,    # ON, OFF, Backup, Unknown
        user_id: UUID,
        ip: str,
        browser: str
    ) -> RawMetric:
        """
        Receives daily metrics via the restricted GUI, persists the record,
        triggers downstream Health/Alert evaluations, generates audit trails,
        and triggers a Socket.IO real-time event broadcast.
        """
        m_repo = MasterRepository(db)
        
        # 1. Resolve lookup status entries
        internet_status = m_repo.get_internet_status(internet_status_name)
        power_status = m_repo.get_power_status(power_status_name)
        
        if not internet_status or not power_status:
            raise ValueError("Invalid internet or power status provided.")

        # 2. Persist raw metric
        raw_metric = RawMetric(
            site_id=site_id,
            isp_id=isp_id,
            download_speed=download_speed,
            upload_speed=upload_speed,
            ping=ping,
            jitter=jitter,
            packet_loss=packet_loss,
            bandwidth_utilization=bandwidth_utilization,
            internet_status_id=internet_status.id,
            power_status_id=power_status.id,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(raw_metric)
        db.flush() # Secure model attributes before transaction commit

        # 3. Downstream Health Score Calculation
        health = HealthService.calculate_site_health(db, site_id, raw_metric)

        # 4. Status Outage Alerts Evaluation
        # Internet Outage triggered if status is not Connected
        trigger_int_outage = internet_status_name != "Connected"
        AlertService.process_status_alert(
            db, site_id, "internet_status", internet_status_name, trigger_int_outage, "Network"
        )
        
        # Power Outage triggered if power is OFF
        trigger_pwr_outage = power_status_name == "OFF"
        AlertService.process_status_alert(
            db, site_id, "power_status", power_status_name, trigger_pwr_outage, "Power"
        )

        # 5. Metric Threshold Alerts Evaluation
        thresholds = HealthService.get_thresholds(db)
        AlertService.evaluate_metric_alerts(db, site_id, raw_metric, thresholds)

        # 6. Audit Logging
        AuditLogService.log_action(
            db=db,
            action="INPUT_METRIC",
            user_id=user_id,
            old_value=None,
            new_value={
                "site_id": str(site_id),
                "isp_id": str(isp_id),
                "download_speed": download_speed,
                "upload_speed": upload_speed,
                "ping": ping,
                "jitter": jitter,
                "packet_loss": packet_loss,
                "bandwidth_utilization": bandwidth_utilization,
                "internet_status": internet_status_name,
                "power_status": power_status_name
            },
            ip=ip,
            browser=browser,
            result="Success"
        )

        db.commit()

        # 7. Socket.IO Real-time broadcast
        # Since Socket.IO is instantiated in main.py, we broadcast inside our API routes or
        # import a broadcaster. We will hook this trigger inside the API endpoints so that 
        # API handles the websocket emissions.
        
        return raw_metric
