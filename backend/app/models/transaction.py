from app.database import Base

from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, text
from sqlalchemy.dialects.postgresql import UUID



class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="SET NULL"), nullable=True, index=True)
    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # "credit" or "debit"

    sender_ref = Column(String, nullable=True)
    squad_transaction_ref = Column(String, nullable=True)
    description = Column(String, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)
