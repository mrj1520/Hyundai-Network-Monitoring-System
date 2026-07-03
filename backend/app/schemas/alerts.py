from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class AlertHistoryResponse(BaseModel):
    id: UUID
    status: str
    timestamp: datetime
    remarks: Optional[str]
    updated_by_email: Optional[str]

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: UUID
    site_id: UUID
    site_name: str
    category: str
    severity: str
    status: str
    affected_metric: Optional[str] = None
    current_value: Optional[float] = None
    threshold_value: Optional[float] = None
    description: str
    recommendation: str
    occurrence_count: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    history: List[AlertHistoryResponse] = []

    class Config:
        from_attributes = True

class AcknowledgeAlertRequest(BaseModel):
    remarks: Optional[str] = None
