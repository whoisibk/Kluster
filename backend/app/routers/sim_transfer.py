import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

SQUAD_BASE_URL = "https://sandbox-api-d.squadco.com"

# Temporary store for sender name overrides keyed by virtual account number.
# Populated by POST /sim-transfer/ and consumed once by the webhook handler.
sender_overrides: dict[str, str] = {}


class SimulatePaymentRequest(BaseModel):
    virtual_account_number: str
    amount: str
    sender_name: Optional[str] = None


@router.post("/", description="Simulate an incoming payment into a Squad virtual account (sandbox only)")
async def simulate_payment(data: SimulatePaymentRequest):
    """
    Triggers Squad's sandbox simulate endpoint, which credits the given virtual
    account and fires a webhook to your registered webhook URL.

    Optionally provide sender_name to control which customer name is recorded
    on the transaction — useful for testing customer diversity in demand signals.
    Squad doesn't accept sender_name directly, so it's stored here and picked
    up by the webhook handler when the event arrives.
    """
    api_key = os.getenv("SQUAD_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="SQUAD_API_KEY not configured.")

    if data.sender_name:
        sender_overrides[data.virtual_account_number] = data.sender_name

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

    return body
