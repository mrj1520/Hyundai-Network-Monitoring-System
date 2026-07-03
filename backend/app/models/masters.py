from sqlalchemy import Column, String
from app.models.base import EnterpriseBaseModel

class Site(EnterpriseBaseModel):
    __tablename__ = "sites"
    name = Column(String(100), unique=True, nullable=False, index=True) # Lahore, Karachi, Islamabad, Multan, Faisalabad

class ISP(EnterpriseBaseModel):
    __tablename__ = "isps"
    name = Column(String(100), unique=True, nullable=False, index=True) # StormFiber, PTCL, Nayatel, Transworld, Jazz
