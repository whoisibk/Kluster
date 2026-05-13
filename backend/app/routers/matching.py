from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import Cluster, JobSeeker
from app.schemas.matching import OpportunitiesResponse
from app.services import ai as ai_service
from app.services.auth import get_current_user
from app.services.demand import detect_demand_signals

router = APIRouter()


@router.get("/opportunities", response_model=OpportunitiesResponse, description="Get demand-matched cluster opportunities for the logged-in job seeker")
def get_opportunities(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    The core matching engine. Returns cluster opportunities matched to the
    authenticated job seeker's skills and location.

    Rather than matching job seekers to posted jobs, Kluster detects labor demand
    directly from cluster transaction data. A cluster whose revenue grew 60% in
    the last two weeks probably needs more hands â€” this endpoint surfaces that
    cluster to job seekers with relevant skills.

    Matching logic:
    1. Identify the logged-in job seeker from their JWT.
    2. Run demand detection across all clusters to find active signals.
    3. For each signal, check if the job seeker's skills overlap with the
       signal's recommended_skills (loose substring match).
    4. Check if the job seeker's location roughly matches the cluster's location.
    5. For each match, call Gemini to generate a one-sentence explanation.
    6. Return results ranked by signal strength, strongest first.

    No job postings needed â€” the economic activity is the signal.
    Requires a valid Bearer token from POST /auth/login.
    """
    job_seeker = db.query(JobSeeker).filter(JobSeeker.auth_user_id == current_user_id).first()
    if not job_seeker:
        raise HTTPException(status_code=404, detail="Job seeker profile not found. Sign up via POST /auth/job-seeker-signup.")

    clusters = db.query(Cluster).all()
    results = []

    for cluster in clusters:
        signals = detect_demand_signals(cluster.id, db)
        for signal in signals:
            recommended = [s.lower() for s in (signal.get("recommended_skills") or [])]
            seeker_skills = [s.lower() for s in job_seeker.skills]

            skill_overlap = any(
                any(sk in rec or rec in sk for rec in recommended)
                for sk in seeker_skills
            )

            location_match = (
                job_seeker.location.lower() in cluster.location.lower()
                or cluster.location.lower() in job_seeker.location.lower()
            )

            if skill_overlap or location_match:
                explanation = ai_service.generate_matching_explanation(
                    job_seeker_name=f"{job_seeker.first_name} {job_seeker.last_name}",
                    job_seeker_skills=job_seeker.skills,
                    job_seeker_location=job_seeker.location,
                    cluster_name=cluster.name,
                    cluster_location=cluster.location,
                    signal_type=signal["signal_type"],
                    signal_strength=float(signal["strength"]),
                    recommended_skills=signal.get("recommended_skills") or [],
                )
                results.append({
                    "cluster_id": str(cluster.id),
                    "cluster_name": cluster.name,
                    "cluster_type": cluster.type,
                    "cluster_location": cluster.location,
                    "signal_type": signal["signal_type"],
                    "signal_strength": float(signal["strength"]),
                    "recommended_skills": signal.get("recommended_skills") or [],
                    "match_explanation": explanation,
                })

    results.sort(key=lambda x: x["signal_strength"], reverse=True)

    return {
        "job_seeker_id": str(job_seeker.id),
        "job_seeker_name": f"{job_seeker.first_name} {job_seeker.last_name}",
        "total_matches": len(results),
        "opportunities": results,
    }
