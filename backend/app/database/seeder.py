import bcrypt
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.database.connection import engine, SessionLocal, Base
# Import models to ensure they are registered with Base metadata
from app.models import (
    Role, PowerStatus, InternetStatus, Severity, AlertCategory,
    Site, ISP, User, DashboardPreference, Threshold, Setting
)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_database(db: Session):
    print("Starting database seeding...")

    # 1. Seed Roles
    roles = ["Admin", "User"]
    role_map = {}
    for r_name in roles:
        role = db.query(Role).filter(Role.name == r_name).first()
        if not role:
            role = Role(name=r_name)
            db.add(role)
            db.flush()
        role_map[r_name] = role
    print("Roles seeded.")

    # 2. Seed Power Statuses
    power_statuses = ["ON", "OFF", "Backup", "Unknown"]
    for ps_name in power_statuses:
        if not db.query(PowerStatus).filter(PowerStatus.name == ps_name).first():
            db.add(PowerStatus(name=ps_name))
    print("Power statuses seeded.")

    # 3. Seed Internet Statuses
    internet_statuses = ["Connected", "Disconnected", "Unstable", "Degraded"]
    for is_name in internet_statuses:
        if not db.query(InternetStatus).filter(InternetStatus.name == is_name).first():
            db.add(InternetStatus(name=is_name))
    print("Internet statuses seeded.")

    # 4. Seed Severities
    severities = ["Critical", "High", "Medium", "Low", "Information"]
    for sev_name in severities:
        if not db.query(Severity).filter(Severity.name == sev_name).first():
            db.add(Severity(name=sev_name))
    print("Severities seeded.")

    # 5. Seed Alert Categories
    categories = ["Network", "Power", "SLA", "Hardware"]
    for cat_name in categories:
        if not db.query(AlertCategory).filter(AlertCategory.name == cat_name).first():
            db.add(AlertCategory(name=cat_name))
    print("Alert categories seeded.")

    # 6. Seed Sites
    sites = ["NexGen 7C", "NexGen Unit 6", "Nexgen Unit 2", "Hyundai 1B"]
    for s_name in sites:
        if not db.query(Site).filter(Site.name == s_name).first():
            db.add(Site(name=s_name))
    print("Sites seeded.")

    # 7. Seed ISPs
    isps = ["StromFiber", "PTCL Flash Fiber", "Wateen Telecom", "Jazz", "LinkdotNet"]
    for isp_name in isps:
        if not db.query(ISP).filter(ISP.name == isp_name).first():
            db.add(ISP(name=isp_name))
    print("ISPs seeded.")

    # 8. Seed Thresholds
    default_thresholds = [
        {"metric": "download_speed", "good": 100.0, "warning": 50.0, "critical": 20.0},
        {"metric": "upload_speed", "good": 50.0, "warning": 20.0, "critical": 10.0},
        {"metric": "ping", "good": 30.0, "warning": 80.0, "critical": 150.0},
        {"metric": "jitter", "good": 10.0, "warning": 20.0, "critical": 30.0},
        {"metric": "dns_response", "good": 20.0, "warning": 40.0, "critical": 80.0},
        {"metric": "packet_loss", "good": 0.0, "warning": 2.0, "critical": 5.0},
        {"metric": "bandwidth_utilization", "good": 70.0, "warning": 90.0, "critical": 100.0}
    ]
    for dt in default_thresholds:
        threshold = db.query(Threshold).filter(Threshold.metric == dt["metric"]).first()
        if not threshold:
            db.add(Threshold(
                metric=dt["metric"],
                good=dt["good"],
                warning=dt["warning"],
                critical=dt["critical"]
            ))
    print("Thresholds seeded.")

    # 9. Seed Settings
    default_settings = [
        {"key": "company_name", "value": "Hyundai Network Monitoring", "description": "Enterprise Organization Name"},
        {"key": "company_logo", "value": "/assets/hyundai_logo.png", "description": "Path to logo file"},
        {"key": "timezone", "value": "Asia/Karachi", "description": "System timezone"},
        {"key": "sla_target", "value": 99.9, "description": "SLA compliance target percentage"},
        {"key": "retention_days", "value": 90, "description": "Log and metric retention count"},
        {"key": "business_hours", "value": {"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}, "description": "Business hour settings for reporting"},
        {"key": "alert_rules", "value": {"ping_warning_spikes": 3, "packet_loss_warning": 2}, "description": "Alert triggering rules"},
        {"key": "backup_schedule", "value": "00:00", "description": "Time to take daily backup"},
    ]
    for ds in default_settings:
        setting = db.query(Setting).filter(Setting.key == ds["key"]).first()
        if not setting:
            db.add(Setting(
                key=ds["key"],
                value=ds["value"],
                description=ds["description"]
            ))
        else:
            # Overwrite if key is company name/logo
            if ds["key"] in ["company_name", "company_logo"]:
                setting.value = ds["value"]
    print("System Settings seeded.")

    # 10. Seed Users
    default_users = [
        {"email": "admin1@hyundai.com", "password": "admin123", "role": "Admin", "fav_dash": "CTO"},
        {"email": "admin2@hyundai.com", "password": "admin123", "role": "Admin", "fav_dash": "CTO"},
        {"email": "user1@hyundai.com", "password": "user123", "role": "User", "fav_dash": "CTO"},
        {"email": "user2@hyundai.com", "password": "user123", "role": "User", "fav_dash": "CTO"},
    ]
    for du in default_users:
        user = db.query(User).filter(User.email == du["email"]).first()
        if not user:
            role = role_map[du["role"]]
            new_user = User(
                email=du["email"],
                hashed_password=hash_password(du["password"]),
                role_id=role.id
            )
            db.add(new_user)
            db.flush()
            
            # Create default preferences
            pref = DashboardPreference(
                user_id=new_user.id,
                theme="dark",
                sidebar_collapsed=False,
                default_date_filter="today",
                widget_positions={},
                favorite_dashboard=du["fav_dash"],
                language="en",
                rows_per_page=10
            )
            db.add(pref)
    print("Users and preferences seeded.")

    db.commit()
    print("Seeding completed successfully.")

def run_seeder():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

if __name__ == "__main__":
    run_seeder()
