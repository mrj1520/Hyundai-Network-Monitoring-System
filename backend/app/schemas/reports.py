from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ReportResponse(BaseModel):
    id: UUID
    title: str
    report_type: str
    file_path: str
    generated_by_email: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ExportRequest(BaseModel):
    site_id: Optional[UUID] = None
    start_date: datetime
    end_date: datetime
    report_type: str # Executive, SLA, Network
