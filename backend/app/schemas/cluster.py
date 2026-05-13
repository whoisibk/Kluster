from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List


class ClusterBase(BaseModel):
    name: str = Field(..., title="Cluster Name", description="Name of the cluster")
    type: str = Field(..., title="Cluster Type", description="Type of the cluster (e.g., cooperative, market association)")
    location: str = Field(..., title="Location", description="Geographical location of the cluster")
    description: Optional[str] = Field(None, title="Description", description="Detailed description of the cluster")
    languages: List[str] = Field(default_factory=list, title="Languages", description="Languages spoken within the cluster")


class ClusterCreate(ClusterBase):
    """
    Schema used when creating a cluster.

    Leader personal details (name, phone) are not required here — they are
    read from the authenticated user's JWT metadata set at signup.
    """
    pass


class ClusterView(ClusterBase):
    """Schema for returning cluster data to clients without internal IDs.

    Includes `leader_account_name` when available instead of exposing the leader's UUID.
    """
    id: UUID = Field(..., title="Cluster ID")
    leader_name: Optional[str] = Field(
        None,
        title="Leader Name",
        description="Name of the leader, if available",
    )


class ClusterResponse(ClusterBase):
    id: UUID = Field(...)

    class Config:
        from_attributes = True

class ClusterHealthView(BaseModel):
    cluster_id: UUID = Field(..., title="Cluster ID")
    total_members: int = Field(..., title="Total Members", description="Total number of members in the cluster")
    active_members: int = Field(..., title="Active Members", description="Number of active members in the cluster")
    # job_seekers: int = Field(..., title="Job Seekers", description="Number of members who are job seekers")
