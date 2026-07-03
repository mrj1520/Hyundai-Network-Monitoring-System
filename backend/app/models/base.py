import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base

class EnterpriseBaseModel(Base):
    __abstract__ = True
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    is_deleted = Column(
        Boolean,
        default=False,
        nullable=False
    )
    deleted_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    def soft_delete(self):
        """Perform logical deletion on the record."""
        self.is_deleted = True
        self.deleted_at = datetime.now(timezone.utc)
