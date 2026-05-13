from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models import JobSeeker
from app.schemas.job_seeker import JobSeekerView
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/me", response_model=JobSeekerView, description="Get your job seeker profile")
def get_my_profile(
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated job seeker's profile.

    Looks up the JobSeeker record linked to the current user's Supabase ID.
    Use the token returned from POST /auth/login as a Bearer token.

    Returns the full profile including skills, location, match status,
    and the cluster they have been matched to (if any).
    """
    job_seeker = db.query(JobSeeker).filter(JobSeeker.auth_user_id == current_user_id).first()
    if not job_seeker:
        raise HTTPException(status_code=404, detail="Job seeker profile not found.")
    return JobSeekerView.model_validate(job_seeker)
