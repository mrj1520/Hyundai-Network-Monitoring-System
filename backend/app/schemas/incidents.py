from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class IncidentAssignRequest(BaseModel):
    assigned_to_user_id: UUID

class IncidentResolveRequest(BaseModel):
    resolution: str
    status: Optional[str] = "Resolved" # Resolved or Closed
