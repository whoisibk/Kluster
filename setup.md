# Kluster — Team Setup Guide

Squadco Hackathon 2026 | Challenge 02: The Intelligent Economy  
**Team:** 1 Backend (Python/FastAPI) + 2 Frontend (React/Next.js) | **Timeline:** 5 days

---

## Repo Structure

```
kluster/
├── backend/          # Python / FastAPI  (Backend dev owns this)
│   ├── app/
│   │   ├── core/     # config, database session
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic request/response schemas
│   │   ├── routers/  # API route handlers
│   │   └── services/ # business logic (scoring, Squad API, LLM, demand)
│   ├── alembic/      # DB migrations
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React / Next.js  (Frontend devs own this)
    ├── app/          # Next.js App Router pages
    ├── components/   # Reusable UI components
    ├── lib/          # API client, utils
    ├── types/        # TypeScript types
    └── .env.local.example
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | https://python.org |
| Node.js | 20+ | https://nodejs.org |
| PostgreSQL | 15+ | https://postgresql.org |
| Git | any | https://git-scm.com |

---

## Backend Setup

```bash
cd backend

# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Mac/Linux
.venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in all values (see Environment Variables section below)

# 4. Create the database
createdb kluster                 # or create it in pgAdmin

# 5. Run migrations
alembic upgrade head

# 6. Start the dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start the dev server
npm run dev
```

App available at: http://localhost:3000

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Local DB you created |
| `SQUAD_SECRET_KEY` | Squad API secret key | https://sandbox.squadco.com → Settings |
| `SQUAD_BASE_URL` | Squad sandbox base URL | `https://sandbox-api-d.squadco.com` |
| `ANTHROPIC_API_KEY` | Claude API key | https://console.anthropic.com |
| `SECRET_KEY` | JWT signing secret | Run: `python -c "import secrets; print(secrets.token_hex(32))"` |

### Frontend — `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:8000` |

---

## Database Tables

```
clusters           — cluster groups (market associations, ajo groups, guilds)
members            — individual members within a cluster
transactions       — Squad webhook transaction logs
scores             — computed health/activity scores for clusters and members
financial_products — loans and savings products
demand_signals     — AI-detected labor demand signals from transaction data
```

---

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/clusters` | Create a new cluster |
| POST | `/clusters/{id}/members` | Add members to a cluster |
| POST | `/webhooks/squad` | Receive Squad webhook events |
| GET | `/clusters/{id}/health` | Cluster health score + breakdown |
| GET | `/members/{id}/score` | Member activity score |
| GET | `/members/{id}/profile` | AI-generated economic profile |
| GET | `/clusters/{id}/demand` | Detected demand signals |
| GET | `/matching/opportunities` | Job seeker recommendations |
| POST | `/financial/prequalify/{member_id}` | Check loan eligibility |
| POST | `/financial/disburse/{member_id}` | Trigger Squad Transfer disbursement |

---

## Squad API (Sandbox)

1. Sign up at https://sandbox.squadco.com
2. Get your **Secret Key** from Settings → API Keys
3. Use the sandbox base URL: `https://sandbox-api-d.squadco.com`
4. Set up a webhook URL pointing to your backend: `/webhooks/squad`
   - For local dev, use [ngrok](https://ngrok.com): `ngrok http 8000`
   - Copy the ngrok HTTPS URL → paste into Squad dashboard webhook settings

---

## 5-Day Sprint Plan

| Day | Backend | Frontend |
|-----|---------|----------|
| 1 | DB schema + migrations, cluster & member CRUD | Project scaffolding, auth flow, cluster creation UI |
| 2 | Squad virtual accounts, webhook handler, transaction logging, basic scoring | Cluster dashboard, transaction feed, member profile cards |
| 3 | Health scoring, member scoring, LLM profile generation, demand detection | Activity visualization, health score display, demand signals UI |
| 4 | Opportunity matching, loan eligibility, Squad Transfer disbursement, seed data | Matching/recommendations UI, loan eligibility display, job seeker onboarding |
| 5 | Bug fixes, end-to-end testing, demo flow | Final polish, pitch deck, demo walkthrough |

---

## Git Workflow

```bash
# Always branch off main
git checkout -b feature/your-feature-name

# Push and open PR when done
git push origin feature/your-feature-name
```

- Backend PRs: tag the backend dev for review  
- Frontend PRs: tag both frontend devs for review  
- Never push directly to `main`

---

## Useful Commands

```bash
# Backend: generate a new migration after changing models
alembic revision --autogenerate -m "describe your change"
alembic upgrade head

# Backend: seed demo data (create this script on Day 4)
python scripts/seed.py

# Frontend: type-check
npm run type-check

# Frontend: build for production
npm run build
```
