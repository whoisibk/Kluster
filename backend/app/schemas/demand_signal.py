from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class DemandSignalView(BaseModel):
    id: UUID
    cluster_id: Optional[UUID]
    signal_type: str
    strength: float = Field(..., description="0.0 – 1.0")
    recommended_skills: List[str] = Field(default_factory=list)
    detected_at: datetime

    class Config:
        from_attributes = True


class DemandResponse(BaseModel):
    cluster_id: UUID
    cluster_name: str
    signals_detected: int
    signals: List[DemandSignalView]
