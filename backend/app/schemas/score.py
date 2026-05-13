from pydantic import BaseModel, Field
from uuid import UUID
from typing import Any, Dict, Optional
from datetime import datetime


class ScoreBreakdownItem(BaseModel):
    points_earned: float
    max_points: float
    description: str


class ScoreView(BaseModel):
    entity_type: str
    entity_id: UUID
    score: float = Field(..., description="0–100 score")
    breakdown: Dict[str, Any] = Field(default_factory=dict)
    calculated_at: datetime

    class Config:
        from_attributes = True
