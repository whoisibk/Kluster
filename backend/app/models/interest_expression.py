from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID


class InterestExpression(Base):
    __tablename__ = "interest_expressions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    job_seeker_id = Column(UUID(as_uuid=True), ForeignKey("job_seekers.id", ondelete="CASCADE"), nullable=False, index=True)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    signal_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    __table_args__ = (
        UniqueConstraint("job_seeker_id", "cluster_id", name="uq_interest_job_cluster"),
    )
