from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class TransactionCreate(BaseModel):
    member_id: Optional[UUID] = Field(None)
    cluster_id: UUID
    amount: float
    transaction_type: str = Field(..., description="credit or debit")
    sender_ref: Optional[str] = None
    squad_transaction_ref: Optional[str] = None
    description: Optional[str] = None


class TransactionView(BaseModel):
    id: UUID
    member_id: Optional[UUID]
    cluster_id: UUID
    amount: float
    transaction_type: str
    sender_ref: Optional[str]
    squad_transaction_ref: Optional[str]
    description: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True
