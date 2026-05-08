# Kluster

**Kluster** is an intelligent economic platform that digitizes clusters of informal workers — market associations, trade cooperatives, ajo groups, and artisan guilds — and turns their transaction activity into economic intelligence.

Built for **Squadco Hackathon 2026 · Challenge 02: The Intelligent Economy.**

---

## The Problem

47 million Nigerians work in the informal economy. Ajo groups move billions. Market associations enforce contracts. Trade guilds train apprentices. These systems work — but to every bank and every institution, they're invisible.

Not because they aren't productive. Because no system captures what they do.

---

## The Solution

Kluster doesn't replace informal economic structures. It makes them **legible to the formal financial system** — without asking anyone to change how they do business.

- Cluster leaders register their group. Members join by phone number — no smartphone required.
- Every payment into a member's Squad virtual account is captured and logged automatically.
- Transaction data is turned into **Cluster Health Scores**, **Member Activity Scores**, and **AI-generated Economic Profiles**.
- Growth signals in transaction data trigger **labor demand detection** — surfacing job seekers with matching skills automatically.
- Members who cross score thresholds unlock **micro-loans and savings products**, disbursed via Squad Transfer API.

One market woman with no bank history is "uncreditworthy." An ajo group of 30 women with a 96% contribution rate over two years? Incredibly creditworthy — Kluster is the visibility layer that makes that legible.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python / FastAPI |
| Frontend | React / Next.js |
| Database | PostgreSQL |
| AI / LLM | Claude API (Anthropic) |
| Payments | Squad API (sandbox) |

---

## Project Structure

```
kluster/
├── backend/        # Python / FastAPI — API, scoring, Squad integration, LLM
│   ├── app/
│   │   ├── core/       # Config, database session
│   │   ├── models/     # SQLAlchemy ORM models
│   │   ├── schemas/    # Pydantic request/response schemas
│   │   ├── routers/    # API route handlers
│   │   └── services/   # Business logic (scoring, Squad, LLM, demand)
│   ├── alembic/        # DB migrations
│   └── requirements.txt
└── frontend/       # React / Next.js — dashboards, profiles, matching UI
    ├── app/            # Next.js App Router pages
    ├── components/     # Reusable UI components
    ├── lib/            # API client, utilities
    └── types/          # TypeScript type definitions
```

---

## Key Features

**Cluster Onboarding**  
Leaders register their group. Members added by phone number receive Squad virtual accounts automatically.

**Transaction Intelligence**  
Squad webhooks feed every payment into Kluster's pipeline. No behavior change required from users — the economic activity is already the data.

**Scoring Engine**  
— Cluster Health Score: transaction volume trends, active member rate, customer diversity, consistency  
— Member Activity Score: individual inflow patterns, regularity, growth

**AI Economic Profiles**  
Claude API generates human-readable narrative profiles from raw transaction data — portable summaries of a person's economic life that can be shared with financial institutions.

**Demand Detection**  
Rising transaction volume → labor demand inferred → job seekers with matching skills surfaced automatically. No job postings needed.

**Financial Product Unlock**  
Members whose individual + cluster scores pass thresholds are pre-qualified for micro-loans disbursed via Squad Transfer API and automated savings via recurring debits.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/clusters` | Register a new cluster |
| POST | `/clusters/{id}/members` | Add members to a cluster |
| POST | `/webhooks/squad` | Receive Squad webhook events |
| GET | `/clusters/{id}/health` | Cluster health score + breakdown |
| GET | `/members/{id}/score` | Member activity score |
| GET | `/members/{id}/profile` | AI-generated economic profile |
| GET | `/clusters/{id}/demand` | Detected demand signals |
| GET | `/matching/opportunities` | Demand-matched job seeker recommendations |
| POST | `/financial/prequalify/{member_id}` | Check loan eligibility |
| POST | `/financial/disburse/{member_id}` | Trigger Squad Transfer disbursement |

---

## Getting Started

See **[setup.md](./setup.md)** for the full local development guide — prerequisites, environment variables, database setup, Squad sandbox configuration, and the 5-day sprint plan.

---

## Team

| Role | Responsibility |
|------|---------------|
| Backend (×1) | FastAPI, PostgreSQL, Squad API integration, scoring engine, LLM |
| Frontend (×2) | Next.js dashboards, data visualization, matching UI, polish |

---

## Hackathon Scoring

| Criterion | Weight |
|-----------|--------|
| Squad API Integration | 25% |
| Technical Architecture | 20% |
| Problem Insight | 20% |
| Economic Viability | 20% |
| Presentation | 15% |
| Impact Potential (bonus) | +10% |

---

*Squadco Hackathon 2026 · Challenge 02: The Intelligent Economy*
