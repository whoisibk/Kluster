from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import Member, Transaction
from app.routers.sim_transfer import sender_overrides

router = APIRouter()


@router.post("/squad", description="Receive Squad webhook events and log transactions")
async def squad_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Entry point for all Squad payment events.

    Squad calls this endpoint whenever money is paid into a member's virtual
    account. The payload is a flat object containing virtual_account_number,
    principal_amount, sender_name, and transaction_reference.

    We identify the member via virtual_account_number (matched against
    squad_virtual_account_id) or customer_identifier (the member UUID we
    passed to Squad at account creation time).

    Only credit transactions (transaction_indicator == "C") are logged.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or empty request body.")

    # Only process credit transactions
    if payload.get("transaction_indicator") != "C":
        return {"status": "ignored", "reason": "not a credit transaction"}

    virtual_account_number = payload.get("virtual_account_number")
    amount = payload.get("principal_amount", 0)
    sender_ref = sender_overrides.pop(virtual_account_number, None) or payload.get("sender_name")
    squad_ref = payload.get("transaction_reference")
    customer_identifier = payload.get("customer_identifier")

    if not virtual_account_number or not amount:
        raise HTTPException(status_code=400, detail="Missing virtual_account_number or amount.")

    # Look up member by virtual account number first, fall back to customer_identifier
    member = db.query(Member).filter(
        Member.squad_virtual_account_id == virtual_account_number
    ).first()

    if not member and customer_identifier:
        try:
            member = db.query(Member).filter(
                Member.id == UUID(customer_identifier)
            ).first()
        except (ValueError, AttributeError):
            pass

    if not member:
        return {"status": "unmatched", "detail": "No member found for this virtual account"}

    transaction = Transaction(
        member_id=member.id,
        cluster_id=member.cluster_id,
        amount=float(amount),
        transaction_type="credit",
        sender_ref=sender_ref,
        squad_transaction_ref=squad_ref,
        description=f"Payment via Squad virtual account {virtual_account_number}",
    )
    db.add(transaction)
    db.commit()

    return {"status": "ok", "member_id": str(member.id), "amount": float(amount)}
