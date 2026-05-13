from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Cluster, Member, Transaction
from app.schemas.member import EconomicProfileView, MemberLookupView, MemberView
from app.schemas.transaction import TransactionView
from app.schemas.score import ScoreView
from app.services.scoring import compute_member_activity_score
from app.services.auth import get_current_user
from app.services import ai as ai_service

router = APIRouter()


def _get_member(current_user_id: UUID, db: Session) -> Member:
    """Resolves the authenticated user to their Member record."""
    member = db.query(Member).filter(Member.auth_user_id == current_user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member profile not found.")
    return member


@router.get("/lookup", response_model=MemberLookupView, description="Look up a member by phone â€” no login required")
def lookup_member_by_phone(
    phone: str = Query(..., description="Member's registered phone number"),
    db: Session = Depends(get_db),
):
    """
    Public endpoint â€” no authentication required.

    Used in the member activation flow: the member enters their phone number,
    this returns their name and cluster so they can confirm it's them before
    completing signup via POST /auth/member-activate.
    """
    member = db.query(Member).filter(Member.phone == phone).first()
    if not member:
        raise HTTPException(status_code=404, detail="No member found with this phone number.")

    cluster = db.query(Cluster).filter(Cluster.id == member.cluster_id).first()

    return {
        "first_name": member.first_name,
        "last_name": member.last_name,
        "phone": member.phone,
        "cluster_name": cluster.name if cluster else None,
        "virtual_account_number": member.squad_virtual_account_id or "Account not yet assigned",
        "bank_name": "GTBank",
    }


@router.get("/me", response_model=MemberView, description="Get your member profile")
def get_my_profile(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated member's full profile including their Squad
    virtual account number and cluster membership details.
    """
    member = _get_member(current_user_id, db)
    return MemberView.model_validate(member)


@router.get("/me/transactions", response_model=List[TransactionView], description="Get your transaction history")
def get_my_transactions(
    limit: int = Query(50, le=200),
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated member's transaction history, most recent first.
    """
    member = _get_member(current_user_id, db)
    transactions = (
        db.query(Transaction)
        .filter(Transaction.member_id == member.id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [TransactionView.model_validate(t) for t in transactions]


@router.get("/me/score", response_model=ScoreView, description="Get your activity score and breakdown")
def get_my_score(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes and returns the member's activity score (0â€“100) with a full
    breakdown of each metric: transaction volume, consistency, customer count,
    and growth trend.

    Score is recalculated fresh on each call and saved to the scores table
    for historical tracking.
    """
    member = _get_member(current_user_id, db)
    return compute_member_activity_score(member.id, db)


@router.get("/me/profile", response_model=EconomicProfileView, description="Get your AI-generated economic profile")
def get_my_economic_profile(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates a human-readable economic profile narrative using Gemini AI.
    Summarises transaction history, revenue trends, customer base, and activity
    score into 2-3 sentences â€” the kind of summary a bank or investor could
    read to understand this person's economic life.

    Falls back to a template-based profile if GEMINI_API_KEY is not configured.
    """
    member = _get_member(current_user_id, db)
    cluster = db.query(Cluster).filter(Cluster.id == member.cluster_id).first()
    score_data = compute_member_activity_score(member.id, db)

    cutoff = datetime.utcnow() - timedelta(days=30)
    transactions = db.query(Transaction).filter(
        Transaction.member_id == member.id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= cutoff,
    ).all()

    total_volume = sum(t.amount for t in transactions)
    unique_customers = len({t.sender_ref for t in transactions if t.sender_ref})
    growth_rate = score_data.get("breakdown", {}).get("growth_trend", {}).get("growth_rate", 0)

    transaction_summary = {
        "total_volume": total_volume,
        "transaction_count": len(transactions),
        "unique_customers": unique_customers,
        "growth_rate": growth_rate,
    }

    profile_text = ai_service.generate_economic_profile(
        first_name=member.first_name,
        last_name=member.last_name,
        cluster_name=cluster.name if cluster else "their cluster",
        cluster_type=cluster.type if cluster else "cooperative",
        score_data=score_data,
        transaction_summary=transaction_summary,
    )

    return {
        "member_id": str(member.id),
        "name": f"{member.first_name} {member.last_name}",
        "score": score_data.get("score"),
        "profile": profile_text,
        "transaction_summary": transaction_summary,
    }
