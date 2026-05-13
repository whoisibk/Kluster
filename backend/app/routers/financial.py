from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import Cluster, FinancialProduct, Member
from app.schemas.financial_product import DisburseRequest, DisburseResponse, PrequalifyResult
from app.services.auth import get_current_user
from app.services.scoring import compute_cluster_health_score, compute_member_activity_score
from app.services import squad as squad_service

router = APIRouter()

BASE_LOAN_AMOUNT = 50_000.0  # NGN
MIN_INDIVIDUAL_SCORE = 40.0
MIN_CLUSTER_SCORE = 40.0


def _get_member(current_user_id: UUID, db: Session) -> Member:
    """Resolves the authenticated user to their Member record."""
    member = db.query(Member).filter(Member.auth_user_id == current_user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member profile not found.")
    return member


@router.post(
    "/prequalify",
    response_model=PrequalifyResult,
    description="Check your loan eligibility based on individual and cluster scores",
)
def prequalify(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Runs the dual-score loan eligibility check for the authenticated member.

    Both the member's individual activity score and their cluster's health
    score must independently pass the minimum threshold (40/100) before any
    loan is offered. This prevents a weak individual from free-riding a strong
    cluster, and vice versa.

    Loan formula:
        max_loan = BASE_AMOUNT Ã— (individual_score / 100) Ã— (cluster_score / 100)

    If either score is below the minimum, improvement_tips tell the member
    exactly which metric to improve â€” rejection becomes a roadmap, not a dead end.
    """
    member = _get_member(current_user_id, db)

    individual_data = compute_member_activity_score(member.id, db)
    cluster_data = compute_cluster_health_score(member.cluster_id, db)

    individual_score = individual_data["score"]
    cluster_score = cluster_data["score"]

    eligible = (
        individual_score >= MIN_INDIVIDUAL_SCORE
        and cluster_score >= MIN_CLUSTER_SCORE
    )

    max_loan = BASE_LOAN_AMOUNT * (individual_score / 100) * (cluster_score / 100)

    improvement_tips = []
    if not eligible:
        if individual_score < MIN_INDIVIDUAL_SCORE:
            breakdown = individual_data.get("breakdown", {})
            weakest = min(
                breakdown.items(),
                key=lambda x: x[1].get("points_earned", 0) / max(x[1].get("max_points", 1), 1),
            )
            metric_name = weakest[0].replace("_", " ")
            improvement_tips.append(
                f"Your individual score ({individual_score:.0f}/100) is below the minimum. "
                f"Focus on improving your '{metric_name}' â€” it is your lowest-scoring metric."
            )
        if cluster_score < MIN_CLUSTER_SCORE:
            breakdown = cluster_data.get("breakdown", {})
            weakest = min(
                breakdown.items(),
                key=lambda x: x[1].get("points_earned", 0) / max(x[1].get("max_points", 1), 1),
            )
            metric_name = weakest[0].replace("_", " ")
            improvement_tips.append(
                f"Your cluster's health score ({cluster_score:.0f}/100) is below the minimum. "
                f"The cluster needs to improve its '{metric_name}'."
            )

    return PrequalifyResult(
        member_id=member.id,
        eligible=eligible,
        individual_score=individual_score,
        cluster_score=cluster_score,
        max_loan_amount=round(max_loan, 2),
        min_individual_score=MIN_INDIVIDUAL_SCORE,
        min_cluster_score=MIN_CLUSTER_SCORE,
        improvement_tips=improvement_tips,
    )


@router.post(
    "/disburse",
    status_code=201,
    response_model=DisburseResponse,
    description="Disburse an approved loan to your account via Squad Transfer API",
)
async def disburse(
    request: DisburseRequest,
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Triggers a Squad Transfer to send loan funds to the member's bank account.

    Re-runs eligibility before disbursing â€” scores change as transactions come
    in, so eligibility is always verified fresh, even if prequalify was called
    moments earlier.

    On success, creates a FinancialProduct record with the Squad transfer
    reference for audit and repayment tracking.
    """
    member = _get_member(current_user_id, db)

    individual_data = compute_member_activity_score(member.id, db)
    cluster_data = compute_cluster_health_score(member.cluster_id, db)

    individual_score = individual_data["score"]
    cluster_score = cluster_data["score"]

    if individual_score < MIN_INDIVIDUAL_SCORE or cluster_score < MIN_CLUSTER_SCORE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Member does not meet eligibility thresholds. "
                f"Individual score: {individual_score:.0f}/100, "
                f"Cluster score: {cluster_score:.0f}/100. "
                f"Minimum required: {MIN_INDIVIDUAL_SCORE:.0f} each."
            ),
        )

    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Disbursement amount must be greater than zero.")

    max_loan = BASE_LOAN_AMOUNT * (individual_score / 100) * (cluster_score / 100)
    if request.amount > max_loan:
        raise HTTPException(
            status_code=400,
            detail=f"Requested amount â‚¦{request.amount:,.0f} exceeds maximum eligible loan of â‚¦{max_loan:,.0f}.",
        )

    transfer_result = await squad_service.disburse_loan(
        account_number=request.account_number,
        bank_code=request.bank_code,
        amount=request.amount,
        narration=request.narration or "Kluster micro-loan disbursement",
    )

    product = FinancialProduct(
        member_id=member.id,
        type="loan",
        amount=request.amount,
        status=transfer_result.get("status", "pending"),
        squad_transfer_ref=transfer_result.get("transfer_ref"),
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return DisburseResponse(
        member_id=member.id,
        amount=float(product.amount),
        squad_transfer_ref=product.squad_transfer_ref,
        status=product.status,
        created_at=product.created_at,
    )
