from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.models.base import EnterpriseBaseModel

class Alert(EnterpriseBaseModel):
    __tablename__ = "alerts"
    
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("alert_categories.id"), nullable=False)
    severity_id = Column(UUID(as_uuid=True), ForeignKey("severities.id"), nullable=False)
    status = Column(String(50), default="Open", nullable=False, index=True) # Open, Acknowledged, In Progress, Resolved, Closed
    affected_metric = Column(String(100), nullable=True)
    current_value = Column(Float, nullable=True)
    threshold_value = Column(Float, nullable=True)
    description = Column(String(500), nullable=False)
    recommendation = Column(String(500), nullable=False)
    occurrence_count = Column(Integer, default=1, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    site = relationship("Site")
    category = relationship("AlertCategory")
    severity = relationship("Severity")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")

class AlertHistory(EnterpriseBaseModel):
    __tablename__ = "alert_histories"
    
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), nullable=False)
    status = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    remarks = Column(String(500), nullable=True)
    updated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    alert = relationship("Alert", back_populates="history")
    updated_by = relationship("User")

class Incident(EnterpriseBaseModel):
    __tablename__ = "incidents"

    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id"), unique=True, nullable=False)
    assigned_to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="Open", nullable=False, index=True) # Open, Acknowledged, In Progress, Resolved, Closed
    resolution = Column(String(500), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    alert = relationship("Alert")
    assigned_to = relationship("User")
