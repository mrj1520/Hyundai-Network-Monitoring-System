from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict

class MetricInput(BaseModel):
    site_id: UUID
    isp_id: UUID
    download_speed: float = Field(..., ge=0.0, description="Download speed in Mbps")
    upload_speed: float = Field(..., ge=0.0, description="Upload speed in Mbps")
    ping: float = Field(..., ge=0.0, description="Latency in ms")
    jitter: float = Field(..., ge=0.0, description="Jitter in ms")
    packet_loss: float = Field(..., ge=0.0, le=100.0, description="Packet loss percentage")
    bandwidth_utilization: float = Field(..., ge=0.0, le=100.0, description="Bandwidth utilization percentage")
    internet_status: str = Field(..., description="Connected, Disconnected, Unstable, Degraded")
    power_status: str = Field(..., description="ON, OFF, Backup, Unknown")

class MetricResponse(BaseModel):
    id: UUID
    site_id: UUID
    site_name: str
    isp_id: UUID
    isp_name: str
    download_speed: float
    upload_speed: float
    ping: float
    jitter: float
    packet_loss: float
    bandwidth_utilization: float
    internet_status: str
    power_status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    health_score: float
    internet_status: str
    power_status: str
    availability_internet: float
    availability_power: float
    today_sla: float
    today_downtime_minutes: float
    active_alerts_count: int
    last_updated: datetime

class ChartDataPoint(BaseModel):
    timestamp: str
    download_speed: float
    upload_speed: float
    ping: float
    jitter: float
    packet_loss: float
    bandwidth_utilization: float

class DashboardChartsResponse(BaseModel):
    site_id: UUID
    site_name: str
    timeline: List[ChartDataPoint]
