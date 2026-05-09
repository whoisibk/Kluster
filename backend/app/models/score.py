from backend.app.database import Base

from datetime import datetime

    
from sqlalchemy import Column, DateTime, Float, Integer, String, ForeignKey, text
from sqlalchemy.dialects.postgresql import JSONB, UUID


class Score(Base):
    __tablename__ = "scores"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    entity_type = Column(String, nullable=False) # cluster or member
    entity_id = Column(UUID(as_uuid=True), nullable=False) # cluster_id or member_id
    

    score_decimal = Column(Float, nullable=False)
    breakdown_json = Column(JSONB)
    
    calcuated_at =  Column(DateTime, default=datetime.utcnow)
