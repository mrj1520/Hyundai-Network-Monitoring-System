from sqlalchemy.orm import Session
from app.models.alerts import Alert, AlertHistory, Incident
from app.models.metrics import RawMetric, Threshold
from app.models.lookups import Severity, AlertCategory, InternetStatus, PowerStatus
from app.models.masters import Site
from app.repositories import AlertRepository, MasterRepository
from datetime import datetime, timezone
from typing import Optional, Dict

class AlertService:
    @staticmethod
    def get_alert_recommendation(metric_name: str, severity_name: str) -> str:
        """Provide standard action plans for alerts based on severity."""
        recommendations = {
            "internet_status": "Verify ISP gateway connectivity. Check primary WAN port. Inspect local firewall policies.",
            "power_status": "Inspect main UPS power backup load. Verify electrical circuit breakers. Contact site facilities lead.",
            "ping": "Investigate ISP latency spikes. Trace route to DNS host. Inspect WAN bandwidth hogging.",
            "jitter": "Investigate ISP routing stability. Verify QoS rules on boundary routers. Inspect local network switch ports.",
            "packet_loss": "Inspect physical network cabling. Check boundary router interface errors. Verify ISP WAN link quality.",
            "dns_response": "Check local DNS resolver status. Flush system DNS cache. Test response times of secondary resolver.",
            "bandwidth_utilization": "Analyze active bandwidth consumption. Identify top downloading hosts. Upgrade WAN package if required."
        }
        return recommendations.get(metric_name, "Perform diagnostic network sweeps. Inspect device health logs.")

    @classmethod
    def process_status_alert(
        cls,
        db: Session,
        site_id: str,
        status_name: str,
        status_value: str,
        trigger_outage: bool,
        category_name: str
    ):
        """
        Creates or updates status alerts (Internet or Power outages).
        Resolves open alerts if status goes back to normal.
        """
        m_repo = MasterRepository(db)
        a_repo = AlertRepository(db)
        
        category = m_repo.get_alert_category(category_name)
        severity_crit = m_repo.get_severity("Critical")
        severity_info = m_repo.get_severity("Information")

        if not category or not severity_crit:
            return

        # Look for existing active status alert
        active_alert = a_repo.find_active_alert(site_id, category.id, status_name)

        if trigger_outage:
            # Outage detected, generate or increment Critical Alert
            if active_alert:
                active_alert.occurrence_count += 1
                active_alert.updated_at = datetime.now(timezone.utc)
                db.commit()
            else:
                new_alert = Alert(
                    site_id=site_id,
                    category_id=category.id,
                    severity_id=severity_crit.id,
                    status="Open",
                    affected_metric=status_name,
                    current_value=0.0,
                    threshold_value=0.0,
                    description=f"{category_name} failure detected. Status value: {status_value}",
                    recommendation=cls.get_alert_recommendation(status_name, "Critical"),
                    occurrence_count=1
                )
                a_repo.create(new_alert)
                
                # Write to alert history
                history = AlertHistory(
                    alert_id=new_alert.id,
                    status="Open",
                    remarks=f"System generated: {category_name} outage started.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(history)

                # Create associated incident ticket
                incident = Incident(
                    alert_id=new_alert.id,
                    status="Open"
                )
                db.add(incident)
                db.commit()
        else:
            # Status normal. If there's an active alert, mark as Resolved
            if active_alert:
                active_alert.status = "Resolved"
                active_alert.resolved_at = datetime.now(timezone.utc)
                
                history = AlertHistory(
                    alert_id=active_alert.id,
                    status="Resolved",
                    remarks=f"System generated: {category_name} restored.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(history)

                # Auto-resolve incident ticket
                inc_record = db.query(Incident).filter(Incident.alert_id == active_alert.id).first()
                if inc_record and inc_record.status not in ["Resolved", "Closed"]:
                    inc_record.status = "Resolved"
                    inc_record.closed_at = datetime.now(timezone.utc)
                db.commit()

    @classmethod
    def evaluate_metric_alerts(
        cls,
        db: Session,
        site_id: str,
        metric: RawMetric,
        thresholds: Dict[str, Threshold]
    ):
        """
        Evaluates metric thresholds (ping, packet loss, bandwidth) and raises or resolves alerts.
        """
        m_repo = MasterRepository(db)
        a_repo = AlertRepository(db)
        
        category_net = m_repo.get_alert_category("Network")
        sev_crit = m_repo.get_severity("Critical")
        sev_high = m_repo.get_severity("High")
        sev_warn = m_repo.get_severity("Medium")

        if not category_net or not sev_crit or not sev_high or not sev_warn:
            return

        # Metrics to check
        metric_values = {
            "ping": metric.ping,
            "jitter": metric.jitter,
            "dns_response": metric.dns_response,
            "packet_loss": metric.packet_loss,
            "bandwidth_utilization": metric.bandwidth_utilization,
            "download_speed": metric.download_speed,
            "upload_speed": metric.upload_speed
        }

        for m_name, m_val in metric_values.items():
            threshold = thresholds.get(m_name)
            if not threshold:
                continue

            lower_is_better = m_name in ["ping", "jitter", "dns_response", "packet_loss", "bandwidth_utilization"]
            trigger_severity = None
            threshold_val = 0.0

            if lower_is_better:
                if m_val > threshold.critical:
                    trigger_severity = sev_crit
                    threshold_val = threshold.critical
                elif m_val > threshold.warning:
                    trigger_severity = sev_warn
                    threshold_val = threshold.warning
            else: # Higher is better (download/upload speed)
                if m_val < threshold.critical:
                    trigger_severity = sev_crit
                    threshold_val = threshold.critical
                elif m_val < threshold.warning:
                    trigger_severity = sev_warn
                    threshold_val = threshold.warning

            active_alert = a_repo.find_active_alert(site_id, category_net.id, m_name)

            if trigger_severity:
                # Trigger warning/critical alert
                if active_alert:
                    # Update existing alert severity if escalated
                    if active_alert.severity_id != trigger_severity.id:
                        active_alert.severity_id = trigger_severity.id
                        active_alert.description = f"Network threshold violation: {m_name} is {m_val} (Threshold: {threshold_val})"
                        
                        history = AlertHistory(
                            alert_id=active_alert.id,
                            status="Escalated",
                            remarks=f"Alert severity escalated to {trigger_severity.name}.",
                            timestamp=datetime.now(timezone.utc)
                        )
                        db.add(history)
                    active_alert.occurrence_count += 1
                    active_alert.current_value = m_val
                    active_alert.updated_at = datetime.now(timezone.utc)
                    db.commit()
                else:
                    new_alert = Alert(
                        site_id=site_id,
                        category_id=category_net.id,
                        severity_id=trigger_severity.id,
                        status="Open",
                        affected_metric=m_name,
                        current_value=m_val,
                        threshold_value=threshold_val,
                        description=f"Network threshold violation: {m_name} is {m_val} (Threshold: {threshold_val})",
                        recommendation=cls.get_alert_recommendation(m_name, trigger_severity.name),
                        occurrence_count=1
                    )
                    a_repo.create(new_alert)
                    
                    history = AlertHistory(
                        alert_id=new_alert.id,
                        status="Open",
                        remarks=f"System generated: threshold violation alert raised.",
                        timestamp=datetime.now(timezone.utc)
                    )
                    db.add(history)

                    # Create associated incident ticket
                    incident = Incident(
                        alert_id=new_alert.id,
                        status="Open"
                    )
                    db.add(incident)
                    db.commit()
            else:
                # Resolve alert if normal
                if active_alert:
                    active_alert.status = "Resolved"
                    active_alert.resolved_at = datetime.now(timezone.utc)
                    
                    history = AlertHistory(
                        alert_id=active_alert.id,
                        status="Resolved",
                        remarks=f"System generated: metric returned back to normal range.",
                        timestamp=datetime.now(timezone.utc)
                    )
                    db.add(history)

                    # Auto-resolve incident ticket
                    inc_record = db.query(Incident).filter(Incident.alert_id == active_alert.id).first()
                    if inc_record and inc_record.status not in ["Resolved", "Closed"]:
                        inc_record.status = "Resolved"
                        inc_record.closed_at = datetime.now(timezone.utc)
                    db.commit()
