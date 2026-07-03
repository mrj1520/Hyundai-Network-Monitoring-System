from sqlalchemy import Column, String, Boolean, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import EnterpriseBaseModel

class User(EnterpriseBaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    
    role = relationship("Role")
    preferences = relationship("DashboardPreference", back_populates="user", uselist=False)

class DashboardPreference(EnterpriseBaseModel):
    __tablename__ = "dashboard_preferences"
    
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    theme = Column(String(50), default="dark", nullable=False)
    sidebar_collapsed = Column(Boolean, default=False, nullable=False)
    default_date_filter = Column(String(50), default="today", nullable=False)
    widget_positions = Column(JSON, default=dict, nullable=False) # Store custom layouts
    favorite_dashboard = Column(String(50), default="CTO", nullable=False)
    language = Column(String(10), default="en", nullable=False)
    rows_per_page = Column(Integer, default=10, nullable=False)
    
    user = relationship("User", back_populates="preferences")
