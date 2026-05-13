from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import os
from uuid import UUID

security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_URL = os.getenv("SUPABASE_URL")


def _decode_token(token: str) -> dict:
    if token.startswith("Bearer "):
        token = token[7:]
    try:
        return jwt.decode(
            token,
            "",
            algorithms=["HS256", "ES256", "RS256"],
            options={"verify_signature": False, "verify_aud": False},
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    """Extract user_id from Supabase JWT token."""
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="No user in token")
    return UUID(user_id)


async def get_current_user_profile(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extract user_id plus the profile metadata stored at signup (first_name,
    last_name, phone). Used by endpoints that need personal details without
    asking the user to re-enter them.
    """
    payload = _decode_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="No user in token")

    meta = payload.get("user_metadata") or {}
    return {
        "user_id": UUID(user_id),
        "first_name": meta.get("first_name", ""),
        "last_name": meta.get("last_name", ""),
        "phone": meta.get("phone", ""),
    }
