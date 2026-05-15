from datetime import datetime

from app.database import Base

from sqlalchemy import Column, String, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID


class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    auth_user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id", ondelete="CASCADE"), index=True, nullable=False)
    role_in_cluster = Column(String, nullable=True, default="member")

    bank_account_number = Column(String, nullable=True)

    # account id to be created after member creation
    squad_virtual_account_id = Column(String, nullable=True)
    job_seeker_id = Column(UUID(as_uuid=True), ForeignKey("job_seekers.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


