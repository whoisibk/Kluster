from fastapi import FastAPI

from backend.app.routers import clusters

app = FastAPI(
    title="Kluster",
    description="Intelligent economic platform for informal trade clusters",
    version="0.1.0",
)

from backend.app.routers import members, webhooks, scoring, matching, financial

app.include_router(clusters.router, prefix="/clusters", tags=["Clusters"])
# app.include_router(members.router, prefix="/members", tags=["Members"])
# app.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
# app.include_router(scoring.router, prefix="/scoring", tags=["Scoring"])
# app.include_router(matching.router, prefix="/matching", tags=["Matching"])
# app.include_router(financial.router, prefix="/financial", tags=["Financial"])
