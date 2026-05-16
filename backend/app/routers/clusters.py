from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Tuple
from uuid import UUID

from app.schemas.cluster import ClusterCreate, ClusterView
from app.schemas.demand_signal import DemandResponse
from app.schemas.member import MemberCreate, MemberView
from app.schemas.score import ScoreView
from app.schemas.transaction import TransactionView
from app.database import get_db
from app.models import Cluster, Member, Transaction
from app.models.interest_expression import InterestExpression
from app.models.job_seeker import JobSeeker
from app.services.auth import get_current_user, get_current_user_profile
from app.services.scoring import compute_cluster_health_score
from app.services.demand import detect_demand_signals
from app.services import squad as squad_service


router = APIRouter()


def _require_leader(current_user_id: UUID, db: Session) -> Tuple[Member, Cluster]:
    """
    Resolves the authenticated user to their leader Member record and cluster.
    Raises 403 if the user is not a cluster leader.
    """
    leader = db.query(Member).filter(
        Member.auth_user_id == current_user_id,
        Member.role_in_cluster == "leader",
    ).first()
    if not leader:
        raise HTTPException(status_code=403, detail="Only cluster leaders can access this.")
    cluster = db.query(Cluster).filter(Cluster.id == leader.cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found.")
    return leader, cluster


def _cluster_to_view(cluster: Cluster, db: Session) -> ClusterView:
    leader = db.query(Member).filter(Member.id == cluster.leader_member_id).first()
    leader_name = f"{leader.first_name} {leader.last_name}" if leader else None
    return ClusterView(
        id=cluster.id,
        name=cluster.name,
        type=cluster.type,
        location=cluster.location,
        description=cluster.description,
        languages=cluster.languages,
        leader_name=leader_name,
    )


@router.post("/create", status_code=201, response_model=ClusterView, description="Create a new cluster")
async def create_cluster(
    cluster: ClusterCreate,
    current_user: dict = Depends(get_current_user_profile),
    db: Session = Depends(get_db),
):
    """
    Creates a new cluster and registers the authenticated user as its leader.

    Leader details (name, phone) are read from the JWT â€” no need to re-enter
    them. A Squad virtual account is created for the leader immediately so they
    can start receiving payments right away.
    """
    new_cluster = Cluster(
        name=cluster.name,
        type=cluster.type,
        location=cluster.location,
        description=cluster.description,
        languages=cluster.languages,
        leader_member_id=None,
    )
    db.add(new_cluster)
    db.flush()

    leader_member = Member(
        auth_user_id=current_user["user_id"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        phone=current_user["phone"],
        cluster_id=new_cluster.id,
        role_in_cluster="leader",
    )
    db.add(leader_member)
    db.flush()

    new_cluster.leader_member_id = leader_member.id
    db.commit()
    db.refresh(leader_member)

    squad_result = await squad_service.create_virtual_account(
        member_id=str(leader_member.id),
        first_name=leader_member.first_name,
        last_name=leader_member.last_name,
        phone=leader_member.phone,
        cluster_location=cluster.location,
    )
    leader_member.squad_virtual_account_id = squad_result.get("virtual_account_number")
    db.commit()
    db.refresh(new_cluster)

    return _cluster_to_view(new_cluster, db)


@router.get("/me", response_model=ClusterView, description="Get the authenticated leader's cluster")
def get_my_cluster(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the cluster belonging to the authenticated leader.
    The cluster is resolved from the JWT â€” no cluster ID needed.
    """
    _, cluster = _require_leader(current_user_id, db)
    return _cluster_to_view(cluster, db)


@router.get("/all", response_model=List[ClusterView], description="Get all clusters")
def get_all_clusters(db: Session = Depends(get_db)):
    clusters_ = db.query(Cluster).all()
    return [_cluster_to_view(c, db) for c in clusters_]


@router.post("/members", status_code=201, response_model=MemberView, description="Add a member to the leader's cluster")
async def add_member_to_cluster(
    member_data: MemberCreate,
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Only the cluster leader can add members.

    The leader's cluster is inferred from their JWT â€” no need to specify a
    cluster_id. After saving the member record, Squad is called immediately
    to create a virtual account for them.
    """
    leader, cluster = _require_leader(current_user_id, db)

    new_member = Member(
        first_name=member_data.first_name,
        last_name=member_data.last_name,
        phone=member_data.phone,
        cluster_id=cluster.id,
        role_in_cluster=member_data.role_in_cluster or "member",
        squad_virtual_account_id=None,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    squad_result = await squad_service.create_virtual_account(
        member_id=str(new_member.id),
        first_name=new_member.first_name,
        last_name=new_member.last_name,
        phone=new_member.phone,
        cluster_location=cluster.location,
    )
    new_member.squad_virtual_account_id = squad_result.get("virtual_account_number")
    db.commit()
    db.refresh(new_member)

    return MemberView.model_validate(new_member)


@router.get("/members", response_model=List[MemberView], description="Get all members of the leader's cluster")
def get_cluster_members(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all members in the authenticated leader's cluster.
    Cluster is resolved from the JWT.
    """
    _, cluster = _require_leader(current_user_id, db)
    members_ = db.query(Member).filter(Member.cluster_id == cluster.id).all()
    return [MemberView.model_validate(m) for m in members_]


@router.get("/health", response_model=ScoreView, description="Get the cluster health score and breakdown")
def get_cluster_health(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes and returns the cluster's health score (0â€“100) with a full
    breakdown of each metric: active member rate, volume trend, transaction
    consistency, customer diversity, and member retention.

    Score is recalculated fresh on each call and saved to the scores table.
    Only the cluster leader can call this endpoint.
    """
    _, cluster = _require_leader(current_user_id, db)
    return compute_cluster_health_score(cluster.id, db)


@router.get("/demand", response_model=DemandResponse, description="Get detected demand signals for the cluster")
def get_cluster_demand(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.query(Member).filter(Member.auth_user_id == current_user_id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Member profile not found.")
    cluster = db.query(Cluster).filter(Cluster.id == member.cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found.")
    signals = detect_demand_signals(cluster.id, db)
    return {
        "cluster_id": cluster.id,
        "cluster_name": cluster.name,
        "signals_detected": len(signals),
        "signals": signals,
    }


@router.get("/interested-workers", description="Get job seekers who expressed interest in this cluster")
def get_interested_workers(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.query(Member).filter(Member.auth_user_id == current_user_id).first()
    if not member:
        raise HTTPException(status_code=403, detail="Member profile not found.")
    cluster = db.query(Cluster).filter(Cluster.id == member.cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found.")

    interests = db.query(InterestExpression).filter(
        InterestExpression.cluster_id == cluster.id
    ).order_by(InterestExpression.created_at.desc()).all()

    workers = []
    for interest in interests:
        js = db.query(JobSeeker).filter(JobSeeker.id == interest.job_seeker_id).first()
        if js:
            workers.append({
                "interest_id": str(interest.id),
                "job_seeker_id": str(js.id),
                "name": f"{js.first_name} {js.last_name}",
                "phone": js.phone,
                "skills": js.skills or [],
                "location": js.location,
                "bio": js.bio,
                "signal_type": interest.signal_type,
                "expressed_at": interest.created_at,
            })

    return {"cluster_id": str(cluster.id), "total": len(workers), "workers": workers}


@router.get("/transactions", response_model=List[TransactionView], description="Get recent transactions for the cluster")
def get_cluster_transactions(
    limit: int = Query(50, le=200),
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the cluster's transaction feed, most recent first.
    Used by the frontend dashboard to display the live activity stream.
    Only the cluster leader can view this.
    """
    _, cluster = _require_leader(current_user_id, db)
    transactions = (
        db.query(Transaction)
        .filter(Transaction.cluster_id == cluster.id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [TransactionView.model_validate(t) for t in transactions]
