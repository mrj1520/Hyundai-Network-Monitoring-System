from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User, DashboardPreference
from app.models.metrics import RawMetric, HealthScore, Threshold
from app.models.alerts import Alert, AlertHistory
from app.models.masters import Site, ISP
from app.models.lookups import Role, PowerStatus, InternetStatus, Severity, AlertCategory
from app.models.system import AuditLog, Setting, Report, EventLog, SystemLog
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)
        
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email, User.is_deleted == False).first()

class PreferenceRepository(BaseRepository[DashboardPreference]):
    def __init__(self, db: Session):
        super().__init__(DashboardPreference, db)

    def get_by_user_id(self, user_id: UUID) -> Optional[DashboardPreference]:
        return self.db.query(DashboardPreference).filter(
            DashboardPreference.user_id == user_id, 
            DashboardPreference.is_deleted == False
        ).first()

class MetricRepository(BaseRepository[RawMetric]):
    def __init__(self, db: Session):
        super().__init__(RawMetric, db)

    def get_latest_metrics(self, site_id: Optional[UUID] = None, limit: int = 100) -> List[RawMetric]:
        query = self.db.query(RawMetric).filter(RawMetric.is_deleted == False)
        if site_id:
            query = query.filter(RawMetric.site_id == site_id)
        return query.order_by(RawMetric.timestamp.desc()).limit(limit).all()

    def get_metrics_range(self, start: datetime, end: datetime, site_id: Optional[UUID] = None, isp_id: Optional[UUID] = None) -> List[RawMetric]:
        query = self.db.query(RawMetric).filter(
            RawMetric.timestamp >= start,
            RawMetric.timestamp <= end,
            RawMetric.is_deleted == False
        )
        if site_id:
            query = query.filter(RawMetric.site_id == site_id)
        if isp_id:
            query = query.filter(RawMetric.isp_id == isp_id)
        return query.order_by(RawMetric.timestamp.asc()).all()

class AlertRepository(BaseRepository[Alert]):
    def __init__(self, db: Session):
        super().__init__(Alert, db)

    def get_active_alerts(self, site_id: Optional[UUID] = None) -> List[Alert]:
        # Active alerts are Open or In Progress
        query = self.db.query(Alert).filter(Alert.status.in_(["Open", "In Progress"]), Alert.is_deleted == False)
        if site_id:
            query = query.filter(Alert.site_id == site_id)
        return query.order_by(Alert.created_at.desc()).all()

    def find_active_alert(self, site_id: UUID, category_id: UUID, affected_metric: Optional[str] = None) -> Optional[Alert]:
        query = self.db.query(Alert).filter(
            Alert.site_id == site_id,
            Alert.category_id == category_id,
            Alert.status.in_(["Open", "In Progress"]),
            Alert.is_deleted == False
        )
        if affected_metric:
            query = query.filter(Alert.affected_metric == affected_metric)
        return query.first()

class SettingRepository(BaseRepository[Setting]):
    def __init__(self, db: Session):
        super().__init__(Setting, db)

    def get_value(self, key: str) -> Optional[Setting]:
        return self.db.query(Setting).filter(Setting.key == key, Setting.is_deleted == False).first()

class MasterRepository:
    def __init__(self, db: Session):
        self.db = db

    # Roles
    def get_role(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == name, Role.is_deleted == False).first()

    def list_roles(self) -> List[Role]:
        return self.db.query(Role).filter(Role.is_deleted == False).all()

    # Sites
    def get_site(self, name: str) -> Optional[Site]:
        return self.db.query(Site).filter(Site.name == name, Site.is_deleted == False).first()

    def list_sites(self) -> List[Site]:
        return self.db.query(Site).filter(Site.is_deleted == False).all()

    # ISPs
    def get_isp(self, name: str) -> Optional[ISP]:
        return self.db.query(ISP).filter(ISP.name == name, ISP.is_deleted == False).first()

    def list_isps(self) -> List[ISP]:
        return self.db.query(ISP).filter(ISP.is_deleted == False).all()

    # Power Status
    def get_power_status(self, name: str) -> Optional[PowerStatus]:
        return self.db.query(PowerStatus).filter(PowerStatus.name == name, PowerStatus.is_deleted == False).first()

    # Internet Status
    def get_internet_status(self, name: str) -> Optional[InternetStatus]:
        return self.db.query(InternetStatus).filter(InternetStatus.name == name, InternetStatus.is_deleted == False).first()

    # Severity
    def get_severity(self, name: str) -> Optional[Severity]:
        return self.db.query(Severity).filter(Severity.name == name, Severity.is_deleted == False).first()

    # Alert Category
    def get_alert_category(self, name: str) -> Optional[AlertCategory]:
        return self.db.query(AlertCategory).filter(AlertCategory.name == name, AlertCategory.is_deleted == False).first()
