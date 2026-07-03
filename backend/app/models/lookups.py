from sqlalchemy import Column, String
from app.models.base import EnterpriseBaseModel

class Role(EnterpriseBaseModel):
    __tablename__ = "roles"
    name = Column(String(50), unique=True, nullable=False, index=True) # Admin, NOC_Engineer, CEO, CTO, COO, Viewer

class PowerStatus(EnterpriseBaseModel):
    __tablename__ = "power_statuses"
    name = Column(String(50), unique=True, nullable=False, index=True) # ON, OFF, Backup, Unknown

class InternetStatus(EnterpriseBaseModel):
    __tablename__ = "internet_statuses"
    name = Column(String(50), unique=True, nullable=False, index=True) # Connected, Disconnected, Unstable, Degraded

class Severity(EnterpriseBaseModel):
    __tablename__ = "severities"
    name = Column(String(50), unique=True, nullable=False, index=True) # Critical, High, Medium, Low, Information

class AlertCategory(EnterpriseBaseModel):
    __tablename__ = "alert_categories"
    name = Column(String(50), unique=True, nullable=False, index=True) # Network, Power, SLA, Hardware
