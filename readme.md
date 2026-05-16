# Kluster

A financial intelligence platform for Nigeria's informal economy. Kluster transforms invisible economic activity into structured, scoreable data — giving informal traders access to credit, savings guidance, insurance eligibility, and connecting unemployed youth to real opportunities.

Built for the **Squad Hackathon 3.0 — Challenge 2**.

---

## The Problem

Nigeria has over 40 million people working in the informal economy (National Bureau of Statistics). Market traders, artisan guilds, cooperatives — they handle real money, build real communities, and are completely invisible to the financial system. Not because they're risky, but because no system has ever measured them.

At the same time, 38% of Nigerian youth are unemployed (NBS Q4 2023 Labour Force Report). The work exists in the informal sector, but there's no job board for it.

Kluster connects both problems.

---

## How It Works

### For Informal Traders

1. A **cluster leader** signs up and creates a cluster (e.g., a market association, trade guild, cooperative)
2. The leader invites members by name and phone number
3. Each member receives a **Squad virtual account** instantly — no bank visit, no paperwork
4. Customers pay into that virtual account as normal
5. Every payment generates transaction data captured via **Squad webhooks**
6. Kluster computes a **cluster health score** and **individual activity score** from that data
7. Members build a portable economic identity they can use to access financial services

### For Job Seekers

1. A job seeker registers with their skills, location, and language
2. Kluster's **demand detection engine** monitors transaction signals across clusters
3. When a cluster shows rapid growth, the system infers labour demand automatically
4. Job seekers are matched to opportunities based on skill and location overlap
5. Each match is explained in plain language by the platform's AI layer

---

## Core Features

### Dual Scoring Engine

Two independent scoring models computed entirely from transaction behaviour:

**Cluster Health Score** (5 metrics):

- Active member rate
- Transaction volume trend
- Transaction consistency (coefficient of variation)
- Customer diversity (unique payers)
- Member retention

**Individual Activity Score** (4 metrics):

- Transaction frequency
- Revenue trend
- Customer diversity
- Income consistency

No BVN, salary slip, or credit bureau report required. These scores are built from the new data stream created when members receive their Squad virtual accounts.

### Demand Signal Detection

The `demand.py` service analyses 14-day and 30-day transaction windows to detect:

- **Rapid growth** — revenue spike indicating increased business activity
- **New customer influx** — surge in unique payers
- **High activity** — sustained above-average transaction frequency

These signals trigger job seeker matching without any cluster needing to post a job listing.

### AI-Powered Intelligence (Gemini 2.5 Flash)

Three distinct AI tasks:

- **Skill inference** — What labour does a growing cluster likely need?
- **Economic profile generation** — A human-readable, bank-ready narrative for each member
- **Match explanation** — Why does this specific job seeker fit this specific demand signal?

All three include graceful fallbacks when the API is unavailable.

### Financial Services Pathways

- **Payments** — Every member has a Squad virtual account for inbound payments
- **Credit** — Dual-score pre-qualification with micro-loan disbursement via Squad Transfer API
- **Savings** — Score-driven monthly savings recommendations based on average transaction volume
- **Insurance** — Group microinsurance eligibility gated by cluster health and member activity scores

---

## Squad API Integration

Squad is not a bolt-on integration. It is the foundational data layer.

| Squad API                | Purpose in Kluster                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `POST /virtual-account/` | Creates a GTBank virtual account for every member at onboarding — this is their financial identity              |
| `POST /webhooks/squad`   | Captures every inbound payment in real time — amount, sender, timestamp, reference — feeding the scoring engine |
| `POST /payout/transfer`  | Disburses micro-loans directly to pre-qualified members' bank accounts                                          |

Remove Squad and the entire system breaks. There is no scoring without the transaction stream, no onboarding without virtual accounts, and no credit product without the disbursement rail.

---

## Tech Stack

| Layer                | Technology                  | Why                                                                          |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| Backend framework    | **FastAPI**                 | Async performance, automatic OpenAPI docs, horizontal scalability            |
| Database             | **PostgreSQL** (Supabase)   | Relational integrity for 7 interconnected tables, strong foreign key support |
| Payment & data layer | **Squad API**               | Virtual accounts + webhooks + transfers in a single integration              |
| AI                   | **Google Gemini 2.5 Flash** | Fast inference for skill matching, profile generation, and match explanation |
| Backend language     | **Python**                  | Rich ecosystem for data processing and async HTTP clients                    |
| Frontend framework   | **React** (Vite)            | Fast build tooling, component-based architecture                             |
| Frontend styling     | **Tailwind CSS**            | Utility-first CSS for rapid, consistent UI development                       |
| Routing              | **React Router**            | Client-side routing across 9 pages with role-based access                    |

---

## Database Schema

Seven tables with clear relationships:

- `users` — Cluster leaders and authentication
- `clusters` — Trade clusters with type, location, and metadata
- `members` — Individual traders linked to clusters, with Squad virtual account references
- `job_seekers` — Registered job seekers with skills, location, and language
- `transactions` — Webhook-captured payment records (amount, sender, member ID, Squad reference)
- `demand_signals` — Algorithmically detected growth/activity signals per cluster
- `loan_records` — Pre-qualification results and disbursement tracking

---

## API Endpoints

### Authentication

| Method | Endpoint                  | Description                                          |
| ------ | ------------------------- | ---------------------------------------------------- |
| POST   | `/auth/signup`            | Cluster leader registration                          |
| POST   | `/auth/member-activate`   | Member self-activation via phone number              |
| POST   | `/auth/job-seeker-signup` | Job seeker registration (skills, location, language) |

### Clusters & Members

| Method | Endpoint                 | Description                                                  |
| ------ | ------------------------ | ------------------------------------------------------------ |
| POST   | `/clusters/`             | Create a new cluster (auto-creates leader's virtual account) |
| POST   | `/clusters/{id}/members` | Add members to a cluster (auto-creates virtual accounts)     |
| GET    | `/clusters/{id}/health`  | Get cluster health score                                     |

### Scoring

| Method | Endpoint                | Description                             |
| ------ | ----------------------- | --------------------------------------- |
| GET    | `/scoring/member/{id}`  | Get individual activity score           |
| GET    | `/scoring/cluster/{id}` | Get cluster health score with breakdown |

### Matching

| Method | Endpoint                  | Description                                   |
| ------ | ------------------------- | --------------------------------------------- |
| GET    | `/matching/opportunities` | Get AI-matched job opportunities for a seeker |

### Financial Services

| Method | Endpoint                                 | Description                                        |
| ------ | ---------------------------------------- | -------------------------------------------------- |
| GET    | `/financial/pre-qualify/{id}`            | Check member loan eligibility based on dual scores |
| POST   | `/financial/disburse/{id}`               | Disburse micro-loan via Squad Transfer API         |
| GET    | `/financial/savings-recommendation/{id}` | Score-driven savings target recommendation         |
| GET    | `/financial/insurance-eligibility/{id}`  | Group microinsurance eligibility check             |

### Webhooks

| Method | Endpoint          | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/webhooks/squad` | Receives Squad payment notifications |

---

## Project Structure

### Backend

```
kluster/
├── main.py                  # FastAPI application entry point
├── models/                  # SQLAlchemy database models
├── schemas/                 # Pydantic request/response schemas
├── routers/                 # API route handlers
│   ├── auth.py
│   ├── clusters.py
│   ├── scoring.py
│   ├── matching.py
│   ├── financial.py
│   └── webhooks.py
├── services/                # Business logic
│   ├── scoring.py           # Dual scoring engine
│   ├── demand.py            # Demand signal detection
│   ├── matching.py          # Job seeker matching
│   └── ai.py                # Gemini integration (skill inference, profiles, explanations)
├── seed.py                  # Database seeding script
├── setup.md                 # Setup instructions
└── requirements.txt
```

### Frontend

```
kluster-frontend/
├── public/
│   └── index.html
├── src/
│   ├── assets/                        # Images, icons, fonts
│   ├── components/                    # Reusable UI components
│   │   ├── Navbar.jsx                # Navigation bar
│   │   ├── HeroSection.jsx          # Landing page hero
│   │   ├── StatsSection.jsx         # Statistics display
│   │   └── ArchitectureSection.jsx  # System architecture
│   ├── pages/                        # Full page components
│   │   ├── Home.jsx                 # Landing page
│   │   ├── Login.jsx                # Authentication
│   │   ├── LeaderSignup.jsx         # Cluster leader registration
│   │   ├── MemberSignup.jsx         # Member activation
│   │   ├── CreateJobProfile.jsx     # Job seeker profile creation
│   │   ├── JobSeekerDashboard.jsx   # Worker dashboard
│   │   ├── ClusterDashboard.jsx     # Cluster leader dashboard
│   │   ├── MemberProfile.jsx        # Individual member profile
│   │   └── DemandSignals.jsx        # Opportunity marketplace
│   ├── services/                     # API integrations
│   │   └── api.js                   # Backend API client
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

### Frontend Pages & Routing

| Route                | Page                   | Description                        | Access            |
| -------------------- | ---------------------- | ---------------------------------- | ----------------- |
| `/`                  | Home.jsx               | Landing page with product overview | Public            |
| `/login`             | Login.jsx              | User authentication                | Public            |
| `/leader-signup`     | LeaderSignup.jsx       | Cluster leader registration        | Public            |
| `/member-signup`     | MemberSignup.jsx       | Member account activation          | Public            |
| `/create-profile`    | CreateJobProfile.jsx   | Job seeker profile creation        | Public            |
| `/dashboard`         | JobSeekerDashboard.jsx | Worker dashboard                   | Job Seeker        |
| `/dashboard/cluster` | ClusterDashboard.jsx   | Cluster leader dashboard           | Cluster Leader    |
| `/member/:id`        | MemberProfile.jsx      | Individual member profile          | Member            |
| `/demand-signals`    | DemandSignals.jsx      | Opportunity marketplace            | All authenticated |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL database (or Supabase project)
- Squad API credentials (sandbox or live)
- Google Gemini API key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/your-team/kluster.git
cd kluster

# Install dependencies
pip install -r requirements.txt
```

#### Backend Environment Variables

Create a `.env` file in the backend root:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SQUAD_API_KEY=your_squad_sandbox_key
SQUAD_BASE_URL=https://sandbox-api-d.squadco.com
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret
```

#### Run the Backend

```bash
# Seed the database with realistic test data
python seed.py

# Start the server
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd kluster-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Frontend Environment Variables

```env
# Local development
VITE_API_BASE_URL=http://localhost:8000

# Production
# VITE_API_BASE_URL=https://your-backend-url.com
```

#### Run the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Demo Flow

The end-to-end product flow for a live demo:

1. **Leader signs up** → `POST /auth/signup`
2. **Leader creates cluster** → `POST /clusters/` (virtual account created)
3. **Leader adds members** → `POST /clusters/{id}/members` (virtual accounts created for each)
4. **Customer makes payment** → Squad fires webhook → `POST /webhooks/squad` logs transaction
5. **Member checks score** → `GET /scoring/member/{id}` returns activity score
6. **Job seeker registers** → `POST /auth/job-seeker-signup`
7. **Job seeker views opportunities** → `GET /matching/opportunities` returns AI-matched clusters
8. **Member checks loan eligibility** → `GET /financial/pre-qualify/{id}`
9. **Loan disbursed** → `POST /financial/disburse/{id}` via Squad Transfer

---

## Challenge 2 Mandate Coverage

| Mandate                                                    | Status                       |
| ---------------------------------------------------------- | ---------------------------- |
| Digitally onboard informal traders and job seekers         | ✅ Complete                  |
| Match job seekers to opportunities using AI                | ✅ Complete                  |
| Connect users to credit, savings, insurance, and payments  | ✅ Complete                  |
| Use alternative data instead of traditional credit history | ✅ Complete                  |
| Improve over time as more users and data enter             | ✅ Architecturally satisfied |
| Integrate Squad API as a core transactional or data layer  | ✅ Complete                  |

---

## Team

Built for Squad Hackathon 3.0 by [Your Team Name].

---

## License

This project was built for the Squad Hackathon 3.0 competition.
