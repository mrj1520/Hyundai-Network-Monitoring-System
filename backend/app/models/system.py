from sqlalchemy import Column, String, ForeignKey, DateTime, Float, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from app.models.base import EnterpriseBaseModel

class AuditLog(EnterpriseBaseModel):
    __tablename__ = "audit_logs"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False, index=True) # LOGIN, INPUT_METRIC, UPDATE_THRESHOLD
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    ip = Column(String(50), nullable=True)
    browser = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    result = Column(String(50), default="Success", nullable=False) # Success, Failure

    user = relationship("User")

class Setting(EnterpriseBaseModel):
    __tablename__ = "settings"
    
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=False)
    description = Column(String(255), nullable=True)

class Report(EnterpriseBaseModel):
    __tablename__ = "reports"
    
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False) # Executive, SLA, Network
    file_path = Column(String(500), nullable=False)
    generated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    generated_by = relationship("User")

class EventLog(EnterpriseBaseModel):
    __tablename__ = "event_logs"
    
    log_level = Column(String(50), nullable=False, index=True) # INFO, WARNING, ERROR
    message = Column(String(500), nullable=False)
    details = Column(String(1000), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class SystemLog(EnterpriseBaseModel):
    __tablename__ = "system_logs"
    
    cpu_usage = Column(Float, nullable=False)
    memory_usage = Column(Float, nullable=False)
    active_connections = Column(Integer, nullable=False)
    uptime_seconds = Column(Integer, nullable=False)
    db_status = Column(String(50), nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
