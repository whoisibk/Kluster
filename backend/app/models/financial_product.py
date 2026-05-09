from datetime import datetime

from backend.app.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Numeric, String, text
from sqlalchemy.dialects.postgresql import UUID


class FinancialProduct(Base):
    __tablename__ = "financial_products"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    type = Column(String, nullable=False)
    amount = Column(Numeric, nullable=False)
    status = Column(String, nullable=False, server_default=text("'pending'"))
    squad_transfer_ref = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))