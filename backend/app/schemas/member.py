from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class MemberBase(BaseModel):
    first_name: str = Field(..., title="First Name", description="Member's first name")
    last_name: str = Field(..., title="Last Name", description="Member's last name")
    phone: Optional[str] = Field(None, title="Phone Number", description="Nigerian format, e.g. 08011223344", pattern=r"^0\d{10}$")
    role_in_cluster: Optional[str] = Field("member", title="Role in Cluster", description="Role of the member within the cluster (e.g., leader, member)")
    bank_account_number: Optional[str] = Field(None, title="Bank Account Number", description="GTBank account number for loan disbursement")
    # job_seeker_id: Optional[UUID] = Field(None, title="Job Seeker ID", description="Reference to associated job seeker profile")


class MemberCreate(MemberBase):
    """Schema used when creating a member (leader-initiated)."""
    pass


class MemberLookupView(BaseModel):
    first_name: str
    last_name: str
    phone: Optional[str]
    cluster_name: Optional[str]
    virtual_account_number: str
    bank_name: str


class TransactionSummary(BaseModel):
    total_volume: float
    transaction_count: int
    unique_customers: int
    growth_rate: float


class EconomicProfileView(BaseModel):
    member_id: str
    name: str
    score: Optional[float]
    profile: str
    transaction_summary: TransactionSummary


class MemberView(BaseModel):
    """Schema for returning member data to clients"""
    id: UUID = Field(..., title="Member ID")
    first_name: str = Field(..., title="First Name")
    last_name: str = Field(..., title="Last Name")
    phone: Optional[str] = Field(None, title="Phone Number", description="Nigerian format, e.g. 08011223344", pattern=r"^0\d{10}$")
    cluster_id: UUID = Field(..., title="Cluster ID")
    role_in_cluster: Optional[str] = Field(None, title="Role in Cluster")
    squad_virtual_account_id: Optional[str] = Field(None, title="Squad Virtual Account ID")
    bank_account_number: Optional[str] = Field(None, title="Bank Account Number")
    created_at: datetime = Field(..., title="Created At")

    class Config:
        from_attributes = True
