from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
import httpx
import os
from uuid import UUID

from app.database import get_db
from app.models import Member, JobSeeker
from app.schemas.job_seeker import JobSeekerSignupRequest, JobSeekerSignupResponse

router = APIRouter()

_http = httpx.AsyncClient(timeout=10.0)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str = Field(..., description="Nigerian format, e.g. 08011223344", pattern=r"^0\d{10}$")


class SignupResponse(BaseModel):
    message: str
    email: str


class MemberActivateRequest(BaseModel):
    email: EmailStr
    password: str
    phone: str = Field(..., description="Nigerian format, e.g. 08011223344", pattern=r"^0\d{10}$")


class MemberActivateResponse(BaseModel):
    message: str
    email: str
    member_id: UUID
    cluster_id: UUID


@router.post("/signup", status_code=201, response_model=SignupResponse, description="Sign up as a cluster leader")
async def signup(credentials: SignupRequest):
    """
    Creates a Supabase auth account for a new cluster leader.

    Stores first_name, last_name, and phone in JWT user_metadata so that
    POST /clusters/create can read them without asking again.

    After signing up, log in via POST /auth/login to get a Bearer token.
    """
    try:
        response = await _http.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={
                "email": credentials.email,
                "password": credentials.password,
                "data": {
                    "first_name": credentials.first_name,
                    "last_name": credentials.last_name,
                    "phone": credentials.phone,
                },
            },
        )

        if response.status_code not in [200, 201]:
            error_detail = (response.json() if response.text else {}).get("error_description", response.text or "Unknown error")
            raise HTTPException(status_code=response.status_code, detail=error_detail)

        return SignupResponse(message="Signup successful. You can now log in.", email=credentials.email)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Signup failed: {str(e)}")


@router.post("/login", response_model=LoginResponse, description="Log in and get a Bearer token")
async def login(credentials: LoginRequest):
    """
    Authenticates with Supabase and returns a JWT Bearer token.

    Use the returned access_token as a Bearer token on all protected endpoints.
    Both cluster leaders and members use this same endpoint to log in.
    """
    try:
        response = await _http.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "email": credentials.email,
                    "password": credentials.password
                }
            )

        if response.status_code != 200:
            supabase_error = response.json() if response.text else {}
            print(f"[login] Supabase {response.status_code}: {supabase_error}")
            detail = supabase_error.get("error_description") or supabase_error.get("msg") or "Invalid email or password"
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

        data = response.json()
        return LoginResponse(access_token=data["access_token"], token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed")


@router.post("/member-activate", response_model=MemberActivateResponse, description="Activate account for a pre-registered member")
async def member_activate(credentials: MemberActivateRequest, db: Session = Depends(get_db)):
    """
    For cluster members who were added by a leader and now want digital access.

    Flow:
    1. Leader adds a member by phone number via POST /clusters/members.
       That creates a Member record in the DB with auth_user_id = None.
    2. The member comes here, signs up with their email + password + the same
       phone number the leader registered them with.
    3. This endpoint creates their Supabase auth account, then finds their
       existing Member record by phone and links the new auth_user_id to it.
    4. From that point on, they can log in via POST /auth/login and access
       their own profile, transactions, and score.

    If no Member record is found for the provided phone, the request is rejected â€”
    this endpoint is only for pre-registered members, not new signups.
    """
    member = db.query(Member).filter(Member.phone == credentials.phone).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No member record found for this phone number. Ask your cluster leader to add you first."
        )

    if member.auth_user_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This member account has already been activated."
        )

    try:
        response = await _http.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "email": credentials.email,
                    "password": credentials.password,
                    "data": {
                        "first_name": member.first_name,
                        "last_name": member.last_name,
                        "phone": credentials.phone,
                    }
                }
            )

        if response.status_code not in (200, 201):
            error_detail = (response.json() if response.text else {}).get("error_description", response.text or "Unknown error")
            raise HTTPException(status_code=response.status_code, detail=error_detail)

        supabase_data = response.json()
        supabase_user_id = supabase_data.get("id") or supabase_data.get("user", {}).get("id")
        if not supabase_user_id:
            raise HTTPException(status_code=500, detail="Could not retrieve user ID from Supabase.")

        member.auth_user_id = UUID(supabase_user_id)
        db.commit()

        return MemberActivateResponse(
            message="Account activated. You can now log in.",
            email=credentials.email,
            member_id=member.id,
            cluster_id=member.cluster_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Activation failed: {str(e)}")


@router.post("/job-seeker-signup", status_code=201, response_model=JobSeekerSignupResponse, description="Sign up as a job seeker")
async def job_seeker_signup(data: JobSeekerSignupRequest, db: Session = Depends(get_db)):
    """
    Registers a new job seeker and creates their Supabase auth account in one step.

    Unlike cluster members â€” who are pre-registered by a leader and activate later â€”
    job seekers self-register directly. This endpoint:
    1. Creates a Supabase auth account with their email and password.
    2. Creates a JobSeeker profile in the database, linked to that Supabase user ID.
    3. Returns the job_seeker_id they will use to access their profile and matches.

    After signing up, job seekers log in via POST /auth/login and use the returned
    token to call GET /job-seekers/me and GET /matching/opportunities.
    """
    existing = db.query(JobSeeker).filter(JobSeeker.phone == data.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A job seeker with this phone number already exists."
        )

    try:
        response = await _http.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": data.email,
                    "password": data.password,
                    "data": {
                        "first_name": data.first_name,
                        "last_name": data.last_name,
                        "phone": data.phone,
                    },
                },
            )

        if response.status_code not in (200, 201):
            error_detail = (response.json() if response.text else {}).get("error_description", response.text or "Unknown error")
            raise HTTPException(status_code=response.status_code, detail=error_detail)

        supabase_data = response.json()
        supabase_user_id = supabase_data.get("id") or supabase_data.get("user", {}).get("id")
        if not supabase_user_id:
            raise HTTPException(status_code=500, detail="Could not retrieve user ID from Supabase.")

        job_seeker = JobSeeker(
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            skills=data.skills,
            language=data.language,
            location=data.location,
            bio=data.bio,
            auth_user_id=UUID(supabase_user_id),
        )
        db.add(job_seeker)
        db.commit()
        db.refresh(job_seeker)

        return JobSeekerSignupResponse(
            message="Signup successful. You can now log in.",
            email=data.email,
            job_seeker_id=job_seeker.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Job seeker signup failed: {str(e)}")
