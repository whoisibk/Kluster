from backend.app.database import Base

from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime, text
from sqlalchemy.dialects.postgresql import UUID



class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, nullable=False, server_default=text("gen_random_uuid()"))
    cluster_id = Column(UUID(as_uuid=True), ForeignKey("clusters.id"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # e.g., "credit" or "debit"
    
    sender_ref = Column(String, nullable=True)  # Optional reference for sender
    squad_transaction_ref = Column(String, nullable=True)  # Reference from Squad API response
    description = Column(String, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)
