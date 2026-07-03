from sqlalchemy.orm import Session
from app.models.metrics import RawMetric, HealthScore, Threshold
from app.models.masters import Site
from app.models.lookups import InternetStatus, PowerStatus
from app.repositories import SettingRepository
from uuid import UUID
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

class HealthService:
    @staticmethod
    def get_thresholds(db: Session) -> Dict[str, Threshold]:
        """Fetch all thresholds into a lookup dict."""
        records = db.query(Threshold).all()
        return {r.metric: r for r in records}

    @staticmethod
    def normalize_metric(value: float, metric_name: str, threshold: Threshold) -> float:
        """
        Normalizes metric values to a 0-100 score based on seeded thresholds.
        Handles lower-is-better (e.g., ping) and higher-is-better (e.g., download speed).
        """
        lower_is_better = metric_name in ["ping", "jitter", "dns_response", "packet_loss", "bandwidth_utilization"]
        
        if lower_is_better:
            if value <= threshold.good:
                return 100.0
            elif value <= threshold.warning:
                return 75.0
            elif value <= threshold.critical:
                return 50.0
            else:
                return 0.0
        else: # Higher is better (speeds)
            if value >= threshold.good:
                return 100.0
            elif value >= threshold.warning:
                return 75.0
            elif value >= threshold.critical:
                return 50.0
            else:
                return 0.0

    @classmethod
    def calculate_site_health(
        cls,
        db: Session,
        site_id: UUID,
        metric: RawMetric
    ) -> HealthScore:
        """
        Calculates and persists a HealthScore for a site based on weighted metric contributions.
        """
        thresholds = cls.get_thresholds(db)
        
        # 1. Normalize network performance metrics
        speeds_score = (
            cls.normalize_metric(metric.download_speed, "download_speed", thresholds["download_speed"]) * 0.67 +
            cls.normalize_metric(metric.upload_speed, "upload_speed", thresholds["upload_speed"]) * 0.33
        )
        
        latency_score = (
            cls.normalize_metric(metric.ping, "ping", thresholds["ping"]) * 0.4 +
            cls.normalize_metric(metric.jitter, "jitter", thresholds["jitter"]) * 0.3 +
            cls.normalize_metric(metric.dns_response, "dns_response", thresholds["dns_response"]) * 0.3
        )
        
        loss_util_score = (
            cls.normalize_metric(metric.packet_loss, "packet_loss", thresholds["packet_loss"]) * 0.6 +
            cls.normalize_metric(metric.bandwidth_utilization, "bandwidth_utilization", thresholds["bandwidth_utilization"]) * 0.4
        )
        
        performance_score = (speeds_score * 0.35 + latency_score * 0.35 + loss_util_score * 0.3)

        # 2. Normalize status metrics
        internet_status = db.query(InternetStatus).filter(InternetStatus.id == metric.internet_status_id).first()
        internet_score = 100.0 if internet_status and internet_status.name == "Connected" else 0.0
        
        power_status = db.query(PowerStatus).filter(PowerStatus.id == metric.power_status_id).first()
        power_score = 100.0 if power_status and power_status.name in ["ON", "Backup"] else 0.0

        # 3. Dynamic weights loaded from Config settings
        set_repo = SettingRepository(db)
        w_int = float(set_repo.get_value("weight_internet_status").value) if set_repo.get_value("weight_internet_status") else 0.05
        w_pwr = float(set_repo.get_value("weight_power_status").value) if set_repo.get_value("weight_power_status") else 0.05
        w_dl = float(set_repo.get_value("weight_download_speed").value) if set_repo.get_value("weight_download_speed") else 0.20
        w_ul = float(set_repo.get_value("weight_upload_speed").value) if set_repo.get_value("weight_upload_speed") else 0.10
        w_png = float(set_repo.get_value("weight_ping").value) if set_repo.get_value("weight_ping") else 0.15
        w_jit = float(set_repo.get_value("weight_jitter").value) if set_repo.get_value("weight_jitter") else 0.10
        w_dns = float(set_repo.get_value("weight_dns_response").value) if set_repo.get_value("weight_dns_response") else 0.10
        w_pkt = float(set_repo.get_value("weight_packet_loss").value) if set_repo.get_value("weight_packet_loss") else 0.15
        w_bnd = float(set_repo.get_value("weight_bandwidth_utilization").value) if set_repo.get_value("weight_bandwidth_utilization") else 0.10

        # Overall weighted score calculation
        score = (
            internet_score * w_int +
            power_score * w_pwr +
            cls.normalize_metric(metric.download_speed, "download_speed", thresholds["download_speed"]) * w_dl +
            cls.normalize_metric(metric.upload_speed, "upload_speed", thresholds["upload_speed"]) * w_ul +
            cls.normalize_metric(metric.ping, "ping", thresholds["ping"]) * w_png +
            cls.normalize_metric(metric.jitter, "jitter", thresholds["jitter"]) * w_jit +
            cls.normalize_metric(metric.dns_response, "dns_response", thresholds["dns_response"]) * w_dns +
            cls.normalize_metric(metric.packet_loss, "packet_loss", thresholds["packet_loss"]) * w_pkt +
            cls.normalize_metric(metric.bandwidth_utilization, "bandwidth_utilization", thresholds["bandwidth_utilization"]) * w_bnd
        )

        health = HealthScore(
            site_id=site_id,
            score=max(0.0, min(100.0, score)),
            internet_score=internet_score,
            power_score=power_score,
            performance_score=performance_score,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(health)
        db.commit()
        db.refresh(health)
        return health

    @staticmethod
    def calculate_availability(db: Session, site_id: UUID, days: int = 30) -> Dict[str, float]:
        """
        Calculates Internet and Power availability percentages over the specified historical window.
        """
        since = datetime.now(timezone.utc) - timedelta(days=days)
        metrics = db.query(RawMetric).filter(
            RawMetric.site_id == site_id,
            RawMetric.timestamp >= since,
            RawMetric.is_deleted == False
        ).all()
        
        if not metrics:
            return {"internet": 100.0, "power": 100.0}

        total_samples = len(metrics)
        internet_up = 0
        power_up = 0
        
        # Load lookups to check names
        statuses_int = {s.id: s.name for s in db.query(InternetStatus).all()}
        statuses_pwr = {s.id: s.name for s in db.query(PowerStatus).all()}
        
        for m in metrics:
            int_name = statuses_int.get(m.internet_status_id, "Disconnected")
            pwr_name = statuses_pwr.get(m.power_status_id, "Unknown")
            
            if int_name == "Connected":
                internet_up += 1
            if pwr_name in ["ON", "Backup"]:
                power_up += 1
                
        return {
            "internet": round((internet_up / total_samples) * 100, 2),
            "power": round((power_up / total_samples) * 100, 2)
        }
