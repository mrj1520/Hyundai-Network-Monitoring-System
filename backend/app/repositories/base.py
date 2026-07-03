from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from app.models.base import Base
from uuid import UUID
from datetime import datetime, timezone

T = TypeVar("T", bound=Base)

class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get(self, id: UUID) -> Optional[T]:
        """Fetch a single record by primary key UUID."""
        query = self.db.query(self.model).filter(self.model.id == id)
        # Apply soft-delete filter if the model has is_deleted column
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        return query.first()

    def list(self) -> List[T]:
        """Fetch all records that are not soft-deleted."""
        query = self.db.query(self.model)
        if hasattr(self.model, "is_deleted"):
            query = query.filter(self.model.is_deleted == False)
        return query.all()

    def create(self, obj: T) -> T:
        """Persist a new record to the database."""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self) -> None:
        """Commit structural changes made on tracked entities."""
        self.db.commit()

    def delete(self, id: UUID) -> bool:
        """Soft-deletes a record if supported, else hard-deletes it."""
        record = self.db.query(self.model).filter(self.model.id == id).first()
        if not record:
            return False
            
        if hasattr(record, "soft_delete"):
            record.soft_delete()
            self.db.commit()
            return True
        else:
            self.db.delete(record)
            self.db.commit()
            return True
