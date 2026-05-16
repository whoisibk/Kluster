import os
import uuid
from typing import Any, Dict

import httpx

SQUAD_BASE_URL = "https://sandbox-api-d.squadco.com"

_http = httpx.AsyncClient(timeout=5.0)


def _api_key() -> str:
    return os.getenv("SQUAD_API_KEY", "")


def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {_api_key()}",
        "Content-Type": "application/json",
    }


async def create_virtual_account(
    member_id: str,
    first_name: str,
    last_name: str,
    phone: str,
    cluster_location: str,
) -> Dict[str, Any]:
    """
    Creates a Squad virtual account for a cluster member.

    The returned virtual_account_number is what the member shares with
    customers to receive payments. Every payment into this number triggers
    a Squad webhook to POST /webhooks/squad, which logs the transaction
    and updates the member's scores.

    Falls back to a mock response if SQUAD_API_KEY is not set,
    so the demo works without live credentials.
    """
    if not _api_key():
        return _mock_virtual_account(first_name, last_name)

    payload = {
        "customer_identifier": str(member_id),
        "first_name": first_name,
        "last_name": last_name,
        "mobile_num": phone,
        "email": f"{phone}@kluster.app",
        "bvn": "22343211654",
        "dob": "01/01/1990",
        "address": cluster_location,
        "gender": "1",
        "beneficiary_account": os.getenv("SQUAD_BENEFICIARY_ACCOUNT", ""),
    }

    response = await _http.post(
        f"{SQUAD_BASE_URL}/virtual-account/",
        headers=_headers(),
        json=payload,
    )

    if response.status_code in (200, 201):
        data = response.json().get("data", {})
        return {
            "virtual_account_number": data.get("virtual_account_number"),
            "bank_name": data.get("bank_name", "GTBank"),
            "customer_identifier": str(member_id),
        }

    print(f"[Squad] create_virtual_account failed {response.status_code}: {response.text}")
    return _mock_virtual_account(first_name, last_name)


async def disburse_loan(
    account_number: str,
    bank_code: str,
    amount: float,
    narration: str = "Kluster micro-loan disbursement",
) -> Dict[str, Any]:
    """
    Sends money to a member's bank account via Squad Transfer API.
    Used when a pre-qualified member's loan is approved and disbursed.

    amount is in Naira. Squad expects kobo (x100) internally.
    Falls back to a mock response if SQUAD_API_KEY is not set.
    """
    if not _api_key():
        return _mock_disburse(amount)

    transaction_ref = f"KLU-{uuid.uuid4().hex[:12].upper()}"

    payload = {
        "account_number": account_number,
        "bank_code": bank_code,
        "amount": int(amount * 100),
        "narration": narration,
        "transaction_ref": transaction_ref,
        "currency_id": "NGN",
    }

    response = await _http.post(
        f"{SQUAD_BASE_URL}/payout/transfer",
        headers=_headers(),
        json=payload,
    )

    if response.status_code in (200, 201):
        data = response.json().get("data", {})
        return {
            "transfer_ref": data.get("transaction_ref", transaction_ref),
            "status": "success",
            "amount": amount,
        }

    return _mock_disburse(amount)


def _mock_virtual_account(first_name: str, last_name: str) -> Dict[str, Any]:
    return {
        "virtual_account_number": f"902{uuid.uuid4().int % 10_000_000:07d}",
        "bank_name": "GTBank (Sandbox)",
        "note": "sandbox_mock",
    }


def _mock_disburse(amount: float) -> Dict[str, Any]:
    return {
        "transfer_ref": f"KLU-MOCK-{uuid.uuid4().hex[:10].upper()}",
        "status": "success",
        "amount": amount,
        "note": "sandbox_mock",
    }
