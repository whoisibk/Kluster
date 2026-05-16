import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import httpx

from app.database import get_db
from app.models import Member, Transaction

router = APIRouter()

SQUAD_BASE_URL = "https://sandbox-api-d.squadco.com"

sender_overrides: dict[str, str] = {}


class SimulatePaymentRequest(BaseModel):
    virtual_account_number: str
    amount: str
    sender_name: Optional[str] = None


@router.post("/", description="Simulate an incoming payment into a Squad virtual account (sandbox only)")
async def simulate_payment(data: SimulatePaymentRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("SQUAD_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="SQUAD_API_KEY not configured.")

    sender_name = data.sender_name or "Test Customer"
    if data.sender_name:
        sender_overrides[data.virtual_account_number] = data.sender_name

    # Call Squad sandbox
    squad_ref = None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SQUAD_BASE_URL}/virtual-account/simulate/payment",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "virtual_account_number": data.virtual_account_number,
                    "amount": data.amount,
                },
                timeout=15.0,
            )
        try:
            body = response.json()
        except Exception:
            body = {"message": response.text or "No response body"}

        if response.status_code not in (200, 201):
            sender_overrides.pop(data.virtual_account_number, None)
            raise HTTPException(status_code=response.status_code, detail=body)

        if isinstance(body, dict):
            squad_ref = body.get("transaction_reference")
    except httpx.HTTPError as exc:
        sender_overrides.pop(data.virtual_account_number, None)
        raise HTTPException(status_code=502, detail=f"Squad request failed: {exc}")

    # Save transaction directly — webhook may never arrive in sandbox
    member = db.query(Member).filter(
        Member.squad_virtual_account_id == data.virtual_account_number
    ).first()

    if member:
        transaction = Transaction(
            member_id=member.id,
            cluster_id=member.cluster_id,
            amount=float(data.amount),
            transaction_type="credit",
            sender_ref=sender_name,
            squad_transaction_ref=squad_ref,
            description=f"Payment via Squad virtual account {data.virtual_account_number}",
        )
        db.add(transaction)
        db.commit()

    return {**body, "saved_locally": member is not None}
