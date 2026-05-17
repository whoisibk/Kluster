import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import cluster_route, member_route, webhook_route, matching_route, financial_route, sim_transfer_route, job_seekers_route
from app.routers.auth import router as auth_router
import app.models  # noqa: F401 — ensures all models are registered before create_all

app = FastAPI(
    title="Kluster",
    description="Intelligent economic platform for informal trade clusters",
    version="0.1.0",
)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # allow_credentials=allowed_origins != ["*"],
    # allow_methods=["*"],
    # allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(cluster_route, prefix="/clusters", tags=["Clusters"])
app.include_router(member_route, prefix="/members", tags=["Members"])
app.include_router(webhook_route, prefix="/webhooks", tags=["Webhooks"])
app.include_router(matching_route, prefix="/matching", tags=["Matching"])
app.include_router(financial_route, prefix="/financial", tags=["Financial"])
app.include_router(sim_transfer_route, prefix="/sim-transfer", tags=["Sim Transfer"])
app.include_router(job_seekers_route, prefix="/job-seekers", tags=["Job Seekers"])

@app.get("/")
async def root():
    return {"message": "Welcome to Kluster API", "status": "healthy"}
