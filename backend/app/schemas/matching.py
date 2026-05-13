from pydantic import BaseModel
from typing import List


class OpportunityMatch(BaseModel):
    cluster_id: str
    cluster_name: str
    cluster_type: str
    cluster_location: str
    signal_type: str
    signal_strength: float
    recommended_skills: List[str]
    match_explanation: str


class OpportunitiesResponse(BaseModel):
    job_seeker_id: str
    job_seeker_name: str
    total_matches: int
    opportunities: List[OpportunityMatch]
