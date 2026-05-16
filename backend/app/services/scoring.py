from datetime import datetime, timedelta
from statistics import mean, stdev
from typing import Any, Dict, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.models import Cluster, Member, Score, Transaction


def _weekly_buckets(transactions, weeks: int = 8) -> list[float]:
    """Group credit transaction amounts into weekly buckets over the last N weeks."""
    now = datetime.utcnow()
    buckets = [0.0] * weeks
    cutoff = now - timedelta(weeks=weeks)
    for t in transactions:
        if t.transaction_type == "credit" and t.timestamp >= cutoff:
            age_days = (now - t.timestamp).days
            bucket_idx = min(age_days // 7, weeks - 1)
            buckets[weeks - 1 - bucket_idx] += t.amount
    return buckets


def _consistency_score(weekly_totals: list[float], max_pts: float) -> Tuple[float, float]:
    """Returns (pts_earned, cv). Lower coefficient of variation = more consistent = more points."""
    avg = mean(weekly_totals) if weekly_totals else 0
    if avg == 0:
        return 0.0, 0.0
    sd = stdev(weekly_totals) if len(weekly_totals) > 1 else 0.0
    cv = sd / avg
    if cv < 0.2:
        pts = max_pts
    elif cv < 0.5:
        pts = max_pts * 0.75
    elif cv < 0.8:
        pts = max_pts * 0.5
    else:
        pts = max_pts * 0.2
    return round(pts, 2), round(cv, 3)


def _volume_trend_score(current: float, previous: float, max_pts: float) -> Tuple[float, float]:
    """Returns (pts_earned, growth_rate)."""
    if current == 0 and previous == 0:
        return 0.0, 0.0
    if previous == 0:
        growth = 1.0 if current > 0 else 0.0
    else:
        growth = (current - previous) / previous

    if growth > 0.3:
        pts = max_pts
    elif growth > 0.1:
        pts = max_pts * 0.8
    elif growth > -0.1:
        pts = max_pts * 0.6
    elif growth > -0.3:
        pts = max_pts * 0.32
    else:
        pts = max_pts * 0.12
    return round(pts, 2), round(growth, 3)


def compute_cluster_health_score(cluster_id: UUID, db: Session) -> Dict[str, Any]:
    now = datetime.utcnow()
    period_start = now - timedelta(days=30)
    prev_start = now - timedelta(days=60)

    members = db.query(Member).filter(Member.cluster_id == cluster_id).all()
    total_members = len(members)
    if total_members == 0:
        return _save_score("cluster", cluster_id, 0.0, {}, db)

    member_ids = [m.id for m in members]

    current_txns = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= period_start,
    ).all()

    prev_txns = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= prev_start,
        Transaction.timestamp < period_start,
    ).all()

    # 1. Active Member Rate (25 pts)
    active_member_ids = {t.member_id for t in current_txns if t.member_id}
    active_count = len(active_member_ids)
    active_rate_pts = round((active_count / total_members) * 25, 2)

    # 2. Volume Trend (25 pts)
    current_volume = sum(t.amount for t in current_txns)
    prev_volume = sum(t.amount for t in prev_txns)
    volume_trend_pts, growth_rate = _volume_trend_score(current_volume, prev_volume, 25)

    # 3. Transaction Consistency (20 pts)
    all_recent = db.query(Transaction).filter(
        Transaction.cluster_id == cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= now - timedelta(weeks=8),
    ).all()
    weekly = _weekly_buckets(all_recent, weeks=8)
    consistency_pts, cv = _consistency_score(weekly, 20)

    # 4. Customer Diversity (15 pts)
    unique_senders = len({t.sender_ref for t in current_txns if t.sender_ref})
    diversity_pts = round(min(unique_senders / 10, 1.0) * 15, 2)

    # 5. Member Retention (15 pts)
    prev_active_ids = {t.member_id for t in prev_txns if t.member_id}
    if not prev_active_ids and not active_member_ids:
        retention_pts = 0.0
    elif not prev_active_ids:
        retention_pts = 10.0
    else:
        retained = len(active_member_ids & prev_active_ids)
        retention_pts = round((retained / len(prev_active_ids)) * 15, 2)

    total = active_rate_pts + volume_trend_pts + consistency_pts + diversity_pts + retention_pts

    breakdown = {
        "active_member_rate": {
            "points_earned": active_rate_pts,
            "max_points": 25,
            "active_members": active_count,
            "total_members": total_members,
        },
        "volume_trend": {
            "points_earned": volume_trend_pts,
            "max_points": 25,
            "current_volume": round(current_volume, 2),
            "previous_volume": round(prev_volume, 2),
            "growth_rate": growth_rate,
        },
        "transaction_consistency": {
            "points_earned": consistency_pts,
            "max_points": 20,
            "coefficient_of_variation": cv,
        },
        "customer_diversity": {
            "points_earned": diversity_pts,
            "max_points": 15,
            "unique_senders": unique_senders,
        },
        "member_retention": {
            "points_earned": retention_pts,
            "max_points": 15,
        },
    }

    return _save_score("cluster", cluster_id, round(total, 2), breakdown, db)


def compute_member_activity_score(member_id: UUID, db: Session) -> Dict[str, Any]:
    now = datetime.utcnow()
    period_start = now - timedelta(days=30)
    prev_start = now - timedelta(days=60)

    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        return _save_score("member", member_id, 0.0, {}, db)

    current_txns = db.query(Transaction).filter(
        Transaction.member_id == member_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= period_start,
    ).all()

    prev_txns = db.query(Transaction).filter(
        Transaction.member_id == member_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= prev_start,
        Transaction.timestamp < period_start,
    ).all()

    # Cluster average for context
    cluster_members_count = db.query(Member).filter(Member.cluster_id == member.cluster_id).count()
    cluster_total = db.query(Transaction).filter(
        Transaction.cluster_id == member.cluster_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= period_start,
    ).all()
    cluster_volume = sum(t.amount for t in cluster_total)
    cluster_avg = cluster_volume / max(cluster_members_count, 1)

    # 1. Transaction Volume (30 pts)
    member_volume = sum(t.amount for t in current_txns)
    ratio = member_volume / max(cluster_avg, 1)
    volume_pts = round(min(ratio / 2, 1.0) * 30, 2)

    # 2. Consistency (25 pts)
    all_recent = db.query(Transaction).filter(
        Transaction.member_id == member_id,
        Transaction.transaction_type == "credit",
        Transaction.timestamp >= now - timedelta(weeks=8),
    ).all()
    weekly = _weekly_buckets(all_recent, weeks=8)
    consistency_pts, cv = _consistency_score(weekly, 25)

    # 3. Customer Count (25 pts)
    unique_payers = len({t.sender_ref for t in current_txns if t.sender_ref})
    customer_pts = round(min(unique_payers / 5, 1.0) * 25, 2)

    # 4. Growth Trend (20 pts)
    prev_volume = sum(t.amount for t in prev_txns)
    growth_pts, growth_rate = _volume_trend_score(member_volume, prev_volume, 20)

    total = volume_pts + consistency_pts + customer_pts + growth_pts

    breakdown = {
        "transaction_volume": {
            "points_earned": volume_pts,
            "max_points": 30,
            "member_volume": round(member_volume, 2),
            "cluster_avg": round(cluster_avg, 2),
        },
        "consistency": {
            "points_earned": consistency_pts,
            "max_points": 25,
            "coefficient_of_variation": cv,
        },
        "customer_count": {
            "points_earned": customer_pts,
            "max_points": 25,
            "unique_payers": unique_payers,
        },
        "growth_trend": {
            "points_earned": growth_pts,
            "max_points": 20,
            "growth_rate": growth_rate,
        },
    }

    return _save_score("member", member_id, round(total, 2), breakdown, db)


def _save_score(entity_type: str, entity_id: UUID, score: float, breakdown: dict, db: Session) -> Dict[str, Any]:
    record = Score(
        entity_type=entity_type,
        entity_id=entity_id,
        score_decimal=score,
        breakdown_json=breakdown,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "score": score,
        "breakdown": breakdown,
        "calculated_at": record.calcuated_at,
    }
