import uuid
from datetime import datetime

from backend.app.database import Base

from sqlalchemy import ARRAY, Column, Integer, String, Float, ForeignKey, Uuid, DateTime, text
from sqlalchemy.dialects.postgresql import UUID


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False) # cooperatives, market associations, etc.
    leader_id = Column(UUID(as_uuid=True), nullable=False)
    location = Column(String, nullable=False)

    description = Column(String, nullable=True)
    languages = Column(ARRAY(String), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
