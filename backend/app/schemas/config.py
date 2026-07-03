from pydantic import BaseModel
from typing import Any, Optional, Dict

class ThresholdResponse(BaseModel):
    metric: str
    good: float
    warning: float
    critical: float

    class Config:
        from_attributes = True

class ThresholdUpdateRequest(BaseModel):
    good: float
    warning: float
    critical: float

class SettingResponse(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SettingUpdateRequest(BaseModel):
    value: Any

class PreferenceUpdateRequest(BaseModel):
    theme: Optional[str] = None
    sidebar_collapsed: Optional[bool] = None
    default_date_filter: Optional[str] = None
    widget_positions: Optional[Dict[str, Any]] = None
    favorite_dashboard: Optional[str] = None
    language: Optional[str] = None
    rows_per_page: Optional[int] = None
