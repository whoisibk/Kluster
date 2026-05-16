from datetime import datetime, timedelta
from typing import List, Dict, Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Cluster, DemandSignal, Transaction
from app.services import ai as ai_service


# Base skills per cluster type â€” reflects how each type actually operates.
# Ajo is pure finance so gets coordination roles.
# Guilds are craft-based so get apprentice/assistant roles.
# Market associations are high-volume trade so get logistics and sales.
# Cooperatives are structured operations so get admin and coordination.
_CLUSTER_TYPE_SKILL_MAP: Dict[str, List[str]] = {
    "market_association": ["sales assistant", "inventory clerk", "dispatch rider", "cashier"],
    "cooperative": ["logistics coordinator", "sales representative", "data entry clerk", "accountant"],
    "ajo": ["financial coordinator", "record keeper", "community organizer", "admin clerk"],
    "guild": ["apprentice", "trade assistant", "quality inspector", "delivery worker"],
}

# Industry keyword overrides â€” if any of these words appear in the cluster name,
# use the more specific skill list instead of the type-based one.
_INDUSTRY_KEYWORD_MAP: Dict[str, List[str]] = {
    "repair":       ["repair assistant", "parts sourcer", "dispatch rider", "sales assistant"],
    "phone":        ["repair assistant", "parts sourcer", "dispatch rider", "sales assistant"],
    "electronics":  ["repair assistant", "parts sourcer", "inventory clerk", "sales assistant"],
    "tailor":       ["tailor", "apprentice", "delivery worker", "fabric sourcer"],
    "fashion":      ["tailor", "apprentice", "seamstress", "fabric sourcer"],
    "fabric":       ["tailor", "fabric sourcer", "sales assistant", "delivery worker"],
    "food":         ["food vendor", "delivery rider", "prep assistant", "cashier"],
    "catering":     ["caterer", "food vendor", "delivery rider", "prep assistant"],
    "restaurant":   ["waiter", "delivery rider", "cashier", "prep assistant"],
    "farm":         ["farm hand", "harvest assistant", "logistics coordinator", "sales representative"],
    "agric":        ["farm hand", "harvest assistant", "logistics coordinator", "sales representative"],
    "beauty":       ["hair stylist", "beauty assistant", "receptionist", "delivery worker"],
    "salon":        ["hair stylist", "beauty assistant", "receptionist", "cashier"],
    "build":        ["labourer", "bricklayer assistant", "site clerk", "delivery driver"],
    "construct":    ["labourer", "bricklayer assistant", "site clerk", "delivery driver"],
    "transport":    ["driver", "dispatch rider", "logistics coordinator", "loader"],
    "logistics":    ["dispatch rider", "loader", "logistics coordinator", "driver"],
}

# Skills for clusters with high sustained activity â€” operations and logistics roles
# that any busy cluster needs regardless of trade type.
_HIGH_ACTIVITY_SKILLS = ["dispatch rider", "logistics assistant", "inventory clerk", "cashier", "errand runner"]

_DEFAULT_SKILLS = ["general assistant", "delivery worker", "sales support", "admin clerk"]

# Clusters with more than this many credit transactions in 30 days are considered
# sustainably busy and get a high_activity signal.
_HIGH_ACTIVITY_THRESHOLD = 5


def _skills_for_cluster(cluster_type: str, cluster_name: str) -> List[str]:
    """
    Returns the most relevant skill list for a cluster.

    Checks the cluster name first for industry keywords (e.g. 'repair', 'tailor',
    'food'). If a keyword is found, returns that industry's specific skill list.
    Falls back to the type-based map (market_association, cooperative, etc.)
    if no keyword matches. Returns a generic default if the type is unrecognised.
    """
    name_lower = cluster_name.lower()
    for keyword, skills in _INDUSTRY_KEYWORD_MAP.items():
        if keyword in name_lower:
            return skills

    normalized_type = cluster_type.lower().replace(" ", "_")
    for key, skills in _CLUSTER_TYPE_SKILL_MAP.items():
        if key in normalized_type:
            return skills

    return _DEFAULT_SKILLS


def detect_demand_signals(cluster_id: UUID, db: Session) -> List[Dict[str, Any]]:
    now = datetime.utcnow()
    recent_start = now - timedelta(days=14)
    prev_start = now - timedelta(days=28)
    month_start = now - timedelta(days=30)

    cluster = db.query(Cluster).filter(Cluster.id == cluster_id).first()
    if not cluster:
        return []

    recent_txns = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= recent_start,
    ).all()

    prev_txns = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= prev_start,
        Transaction.timestamp < recent_start,
    ).all()

    monthly_txns = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= month_start,
    ).all()

    recent_volume = sum(t.amount for t in recent_txns)
    prev_volume = sum(t.amount for t in prev_txns)
    monthly_volume = sum(t.amount for t in monthly_txns)

    recent_senders = len({t.sender_ref for t in recent_txns if t.sender_ref})
    prev_senders = len({t.sender_ref for t in prev_txns if t.sender_ref})

    fallback_skills = _skills_for_cluster(cluster.type, cluster.name)
    detected = []

    # Signal 1 â€” rapid volume growth in last 14 days
    if prev_volume > 0:
        volume_growth = (recent_volume - prev_volume) / prev_volume
        if volume_growth >= 0.05:
            strength = min(volume_growth / 2, 1.0)
            skills = _resolve_skills(cluster, "rapid_growth", recent_volume, volume_growth, len(recent_txns), fallback_skills)
            signal = _save_signal(cluster_id, "rapid_growth", strength, skills, db)
            detected.append(signal)

    # Signal 2 â€” surge in new customers
    if prev_senders > 0:
        sender_growth = (recent_senders - prev_senders) / prev_senders
        if sender_growth >= 0.1:
            strength = min(sender_growth / 1.5, 1.0)
            skills = _resolve_skills(cluster, "new_customer_influx", recent_volume, sender_growth, len(recent_txns), fallback_skills)
            signal = _save_signal(cluster_id, "new_customer_influx", strength, skills[:3], db)
            detected.append(signal)
    elif prev_senders == 0 and len(recent_txns) >= 3:
        skills = _resolve_skills(cluster, "new_customer_influx", recent_volume, 0.6, len(recent_txns), fallback_skills)
        signal = _save_signal(cluster_id, "new_customer_influx", 0.6, skills[:3], db)
        detected.append(signal)

    # Signal 3 â€” sustained high activity regardless of growth
    # A cluster with 50+ transactions/month is busy enough to need operational support
    if len(monthly_txns) >= _HIGH_ACTIVITY_THRESHOLD:
        strength = min(len(monthly_txns) / 200, 1.0)
        skills = _resolve_skills(cluster, "high_activity", monthly_volume, 0.0, len(monthly_txns), _HIGH_ACTIVITY_SKILLS)
        signal = _save_signal(cluster_id, "high_activity", strength, skills, db)
        detected.append(signal)

    return detected


def _resolve_skills(
    cluster: Cluster,
    signal_type: str,
    recent_volume: float,
    growth_rate: float,
    transaction_count: int,
    fallback: List[str],
) -> List[str]:
    """
    Ask Claude to infer required skills for this signal. Falls back to the
    keyword/type-based map if Claude is unavailable or returns nothing.
    """
    ai_skills = ai_service.infer_required_skills(
        cluster_name=cluster.name,
        cluster_type=cluster.type,
        signal_type=signal_type,
        recent_volume=recent_volume,
        growth_rate=growth_rate,
        transaction_count=transaction_count,
    )
    return ai_skills if ai_skills else fallback


def _save_signal(
    cluster_id: UUID,
    signal_type: str,
    strength: float,
    skills: List[str],
    db: Session,
) -> Dict[str, Any]:
    signal = DemandSignal(
        cluster_id=cluster_id,
        signal_type=signal_type,
        strength=round(strength, 3),
        recommended_skills=skills,
    )
    db.add(signal)
    db.commit()
    db.refresh(signal)
    return {
        "id": signal.id,
        "cluster_id": signal.cluster_id,
        "signal_type": signal.signal_type,
        "strength": float(signal.strength),
        "recommended_skills": signal.recommended_skills or [],
        "detected_at": signal.detected_at,
    }
