from datetime import datetime

from backend.app.database import Base

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import (
    
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    ARRAY,
    Boolean,
    Text,
    text,
)


class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    
    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id"), index=True, nullable=False, ondelete="CASCADE")
    role_in_cluster = Column(String, nullable=True, default="member")

    squad_virtual_account_id = Column(String, nullable=False)
    job_seeker_id = Column(UUID(as_uuid=True), default=None)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class JobSeeker(Base):
    __tablename__ = "job_seekers"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)

    skills = Column(ARRAY(String), nullable=False)
    language = Column(String, nullable=False)
    location = Column(String, nullable=False)
    bio = Column(Text)

    is_matched = Column(Boolean, default=False)
    matched_cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id"), index=True, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)