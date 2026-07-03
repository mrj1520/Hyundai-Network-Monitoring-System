from sqlalchemy.orm import Session
from app.models.system import AuditLog
from uuid import UUID
from typing import Optional, Any
from datetime import datetime, timezone

class AuditLogService:
    @staticmethod
    def log_action(
        db: Session,
        action: str,
        user_id: Optional[UUID] = None,
        old_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        ip: Optional[str] = None,
        browser: Optional[str] = None,
        result: str = "Success"
    ) -> AuditLog:
        """
        Creates and persists an audit log record for tracking administrative
        and operational updates.
        """
        log = AuditLog(
            user_id=user_id,
            action=action,
            old_value=old_value,
            new_value=new_value,
            ip=ip,
            browser=browser,
            result=result,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
