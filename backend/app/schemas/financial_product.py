from pydantic import BaseModel, Field
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class PrequalifyResult(BaseModel):
    member_id: UUID
    eligible: bool
    individual_score: float
    cluster_score: float
    max_loan_amount: float = Field(..., description="In Naira")
    min_individual_score: float = 40.0
    min_cluster_score: float = 40.0
    improvement_tips: List[str] = Field(default_factory=list)


class DisburseRequest(BaseModel):
    amount: float = Field(..., description="Amount in Naira to disburse")
    bank_code: str = Field(..., description="Recipient bank code")
    account_number: str = Field(..., description="Recipient account number")
    narration: Optional[str] = "Kluster micro-loan disbursement"


class DisburseResponse(BaseModel):
    member_id: UUID
    amount: float
    squad_transfer_ref: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
