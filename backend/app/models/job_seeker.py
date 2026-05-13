from datetime import datetime

from app.database import Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Boolean, Text, ForeignKey, DateTime, ARRAY, text


class JobSeeker(Base):
    __tablename__ = "job_seekers"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    auth_user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    skills = Column(ARRAY(String), nullable=False)
    language = Column(String, nullable=False)
    location = Column(String, nullable=False)
    bio = Column(Text)

    is_matched = Column(Boolean, default=False)
    matched_cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id", ondelete="SET NULL"), index=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
