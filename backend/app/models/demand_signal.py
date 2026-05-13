from app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import ARRAY, UUID


class DemandSignal(Base):
    __tablename__ = "demand_signals"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id", ondelete="SET NULL"), nullable=True)
    signal_type = Column(String, nullable=False)
    strength = Column(Numeric, nullable=True)
    recommended_skills = Column(ARRAY(Text), nullable=True)
    detected_at = Column(DateTime(timezone=True), server_default=text("now()"))