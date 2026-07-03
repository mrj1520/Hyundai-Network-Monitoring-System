from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.models.base import EnterpriseBaseModel

class RawMetric(EnterpriseBaseModel):
    __tablename__ = "raw_metrics"
    
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    isp_id = Column(UUID(as_uuid=True), ForeignKey("isps.id"), nullable=False)
    download_speed = Column(Float, default=0.0, nullable=False)
    upload_speed = Column(Float, default=0.0, nullable=False)
    ping = Column(Float, default=0.0, nullable=False)
    jitter = Column(Float, default=0.0, nullable=False)
    packet_loss = Column(Float, default=0.0, nullable=False)
    bandwidth_utilization = Column(Float, default=0.0, nullable=False)
    internet_status_id = Column(UUID(as_uuid=True), ForeignKey("internet_statuses.id"), nullable=False)
    power_status_id = Column(UUID(as_uuid=True), ForeignKey("power_statuses.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    site = relationship("Site")
    isp = relationship("ISP")
    internet_status = relationship("InternetStatus")
    power_status = relationship("PowerStatus")

class HealthScore(EnterpriseBaseModel):
    __tablename__ = "health_scores"
    
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    score = Column(Float, default=100.0, nullable=False)
    internet_score = Column(Float, default=100.0, nullable=False)
    power_score = Column(Float, default=100.0, nullable=False)
    performance_score = Column(Float, default=100.0, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    site = relationship("Site")

class Threshold(EnterpriseBaseModel):
    __tablename__ = "thresholds"
    
    metric = Column(String(100), unique=True, nullable=False, index=True)
    good = Column(Float, nullable=False)
    warning = Column(Float, nullable=False)
    critical = Column(Float, nullable=False)
