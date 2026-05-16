# Kluster — Session Summary (May 2026)
## Paste this into a new session to resume without starting from scratch.

---

## What Kluster Is

Kluster is a FastAPI backend for a hackathon project that makes Nigeria's informal economy visible to financial institutions. It tracks three types of users:

- **Cluster Leader** — signs up, creates a cluster (market association, cooperative, ajo group, or guild), adds members
- **Cluster Member** — pre-registered by a leader, activates their account later, receives payments into a Squad virtual account
- **Job Seeker** — self-registers with skills and location, gets AI-matched to clusters that are growing and need help, can apply for roles

---

## Tech Stack

- **FastAPI** + **SQLAlchemy ORM** + **PostgreSQL** (hosted on Supabase)
- **Supabase Auth** — JWT-based. `get_current_user` extracts `sub` (UUID). `get_current_user_profile` also extracts `first_name`, `last_name`, `phone` from `user_metadata`.
- **Squad API** (sandbox: `https://sandbox-api-d.squadco.com`) — virtual accounts, webhook events, Transfer API for loan disbursement
- **Google Gemini** (`gemini-2.5-flash`) — skill inference, job seeker matching explanations, economic profile generation
- **httpx** for async HTTP calls to external APIs
- All endpoints return plain Pydantic model instances. No `success()` wrapper. `response_model=XxxSchema` on every endpoint.

---

## Project Structure

```
backend/
  app/
    main.py              — FastAPI app + CORS + router registration
    database.py          — SQLAlchemy engine, SessionLocal, Base, get_db
    models/
      __init__.py        — exports all models
      cluster.py
      member.py
      job_seeker.py
      transaction.py
      demand_signal.py
      score.py
      financial_product.py
      application.py     ← PENDING (not yet created)
    schemas/
      cluster.py
      member.py
      job_seeker.py
      matching.py
      demand_signal.py
      financial_product.py
      score.py (ScoreView)
      transaction.py (TransactionView)
      response.py        — ApiResponse (kept but unused)
      application.py     ← PENDING (not yet created)
    routers/
      __init__.py
      auth.py
      clusters.py
      members.py
      job_seekers.py
      matching.py
      financial.py
      webhooks.py
      sim_transfer.py
      applications.py    ← PENDING (not yet created)
    services/
      auth.py            — JWT decoding, get_current_user, get_current_user_profile
      scoring.py         — cluster health score, member activity score
      demand.py          — demand signal detection
      ai.py              — Gemini functions
      squad.py           — Squad API calls
```

---

## Database Models (current state, in Supabase)

### `clusters`
| column | type | notes |
|---|---|---|
| id | UUID PK | gen_random_uuid() |
| name | String | indexed |
| type | String | cooperative, market_association, ajo, guild |
| leader_member_id | UUID FK → members | SET NULL on delete |
| location | String | |
| description | String | nullable |
| languages | ARRAY(String) | nullable |
| created_at | DateTime | |

### `members`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| auth_user_id | UUID | nullable, indexed — links to Supabase auth |
| first_name | String | |
| last_name | String | |
| phone | String | |
| cluster_id | UUID FK → clusters | CASCADE delete |
| role_in_cluster | String | "leader" or "member" |
| bank_account_number | String | nullable — ⚠️ PENDING: SQL migration not yet run |
| squad_virtual_account_id | String | nullable — GTBank virtual account number |
| job_seeker_id | UUID FK → job_seekers | nullable, SET NULL |
| created_at | DateTime | |
| updated_at | DateTime | |

> ⚠️ `bank_account_number` column added to SQLAlchemy model but SQL `ALTER TABLE` not yet run. Run:
> `ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR;`

### `job_seekers`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| auth_user_id | UUID | nullable, indexed |
| first_name | String | |
| last_name | String | |
| phone | String | |
| bank_account_number | String | nullable — ⚠️ PENDING: model + SQL not yet done |
| skills | ARRAY(String) | e.g. ["phone repair", "sales"] |
| language | String | |
| location | String | |
| bio | Text | nullable |
| is_matched | Boolean | default false |
| matched_cluster_id | UUID FK → clusters | nullable, SET NULL |
| created_at | DateTime | |
| updated_at | DateTime | |

> ⚠️ `bank_account_number` NOT yet added to model or DB. Need to add to: model, JobSeekerSignupRequest schema, JobSeekerView schema, job_seeker_signup endpoint.
> SQL: `ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR;`

### `transactions`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| member_id | UUID FK → members | SET NULL, indexed |
| cluster_id | UUID FK → clusters | CASCADE, indexed |
| amount | Float | |
| transaction_type | String | "credit" or "debit" |
| sender_ref | String | nullable — who sent the money |
| squad_transaction_ref | String | nullable |
| description | String | nullable |
| timestamp | DateTime | |

### `demand_signals`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| cluster_id | UUID FK → clusters | SET NULL |
| signal_type | String | rapid_growth / new_customer_influx / high_activity |
| strength | Numeric | 0.0 – 1.0 |
| recommended_skills | ARRAY(Text) | nullable |
| detected_at | DateTime(timezone=True) | server default now() |

### `scores`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| entity_type | String | "cluster" or "member" |
| entity_id | UUID | cluster_id or member_id |
| score_decimal | Float | 0–100 |
| breakdown_json | JSONB | per-metric breakdown |
| calcuated_at | DateTime | (typo in column name — do not fix) |

### `financial_products`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| member_id | UUID FK → members | CASCADE |
| type | String | "loan" |
| amount | Numeric | |
| status | String | default "pending" |
| squad_transfer_ref | String | nullable |
| created_at | DateTime(timezone=True) | server default now() |

### `applications` ← ENTIRE TABLE PENDING
> Not yet created. SQL to run in Supabase:
> ```sql
> CREATE TABLE IF NOT EXISTS applications (
>     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
>     job_seeker_id UUID NOT NULL REFERENCES job_seekers(id) ON DELETE CASCADE,
>     cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
>     status VARCHAR NOT NULL DEFAULT 'pending',
>     created_at TIMESTAMP DEFAULT NOW()
> );
> CREATE INDEX IF NOT EXISTS ix_applications_job_seeker_id ON applications(job_seeker_id);
> CREATE INDEX IF NOT EXISTS ix_applications_cluster_id ON applications(cluster_id);
> ```

---

## All Endpoints

### Auth (`/auth`)
| method | path | who calls it | what it does |
|---|---|---|---|
| POST | `/auth/signup` | cluster leader | Creates Supabase auth account. Stores first_name, last_name, phone in user_metadata. Returns `{message, email}`. |
| POST | `/auth/login` | anyone | Email+password → Supabase → returns JWT access_token. |
| POST | `/auth/member-activate` | pre-registered member | Finds Member by phone, creates Supabase account, links auth_user_id to existing Member. |
| POST | `/auth/job-seeker-signup` | job seeker | Creates Supabase account + JobSeeker DB record in one step. |

### Clusters (`/clusters`)
| method | path | auth | what it does |
|---|---|---|---|
| POST | `/clusters/create` | leader JWT | Creates cluster + leader Member. Reads name/phone from JWT metadata. Creates Squad virtual account for leader. |
| GET | `/clusters/me` | leader JWT | Returns leader's cluster. |
| GET | `/clusters/all` | none | Returns all clusters. |
| POST | `/clusters/members` | leader JWT | Adds a member to leader's cluster. Creates Squad virtual account for them. |
| GET | `/clusters/members` | leader JWT | Returns all members of leader's cluster. |
| GET | `/clusters/health` | leader JWT | Runs cluster health score. Returns ScoreView. |
| GET | `/clusters/demand` | leader JWT | Runs demand signal detection. Returns DemandResponse. |
| GET | `/clusters/transactions` | leader JWT | Returns cluster transaction feed. |

### Members (`/members`)
| method | path | auth | what it does |
|---|---|---|---|
| GET | `/members/lookup?phone=` | none | Public lookup by phone. Returns name, cluster, virtual account. |
| GET | `/members/me` | member JWT | Returns own MemberView. |
| GET | `/members/me/transactions` | member JWT | Returns own transaction history. |
| GET | `/members/me/score` | member JWT | Returns own activity score + breakdown. |
| GET | `/members/me/profile` | member JWT | Returns Gemini-generated economic profile narrative. |

### Job Seekers (`/job-seekers`)
| method | path | auth | what it does |
|---|---|---|---|
| GET | `/job-seekers/me` | job seeker JWT | Returns own JobSeekerView. |

### Matching (`/matching`)
| method | path | auth | what it does |
|---|---|---|---|
| GET | `/matching/opportunities` | job seeker JWT | Core AI matching. Runs demand detection across all clusters, matches against job seeker skills + location, generates Gemini explanation per match. Returns ranked list. |

### Financial (`/financial`)
| method | path | auth | what it does |
|---|---|---|---|
| POST | `/financial/prequalify` | member JWT | Dual-score eligibility check. Returns eligible bool + max loan amount + improvement tips. |
| POST | `/financial/disburse` | member JWT | Re-checks eligibility, calls Squad Transfer API, creates FinancialProduct record. |

### Webhooks (`/webhooks`)
| method | path | auth | what it does |
|---|---|---|---|
| POST | `/webhooks/squad` | none (Squad calls this) | Receives Squad payment events. Logs credit transactions. Uses sender_overrides trick for custom sender names. |

### Sim Transfer (`/sim-transfer`)
| method | path | auth | what it does |
|---|---|---|---|
| POST | `/sim-transfer/` | none | Triggers Squad sandbox simulate endpoint. Stores optional sender_name in sender_overrides before calling Squad. |

### Applications (`/applications`) ← ENTIRE ROUTER PENDING
To be built. Endpoints planned:
| method | path | auth | what it does |
|---|---|---|---|
| POST | `/applications` | job seeker JWT | Job seeker applies to a cluster (body: `{cluster_id}`) |
| GET | `/applications/me` | job seeker JWT | Job seeker sees own applications + statuses |
| GET | `/applications/cluster` | any member JWT | All cluster members see applications for their cluster (includes applicant name, skills, location) |
| POST | `/applications/{id}/accept` | any member JWT | Any cluster member accepts. Sets status="accepted", sets job_seeker.is_matched=True and matched_cluster_id. |

> No reject endpoint. No payment endpoint. Status is only "pending" or "accepted".

---

## Core Logic Explained

### Authentication Flow
1. Leader signs up at `/auth/signup` → Supabase creates account, stores profile in JWT `user_metadata`
2. Leader logs in at `/auth/login` → gets Bearer token
3. ALL protected endpoints use `Depends(get_current_user)` which decodes the JWT and returns the `sub` UUID
4. `get_current_user_profile` also extracts `first_name`, `last_name`, `phone` from `user_metadata` — used by `create_cluster` so leader doesn't need to re-enter their details
5. Members activate via `/auth/member-activate` — they provide phone, which matches their pre-created Member record, and links their new Supabase ID to it
6. JWT signature verification is disabled (`verify_signature: False`) — not production-safe but fine for hackathon

### Squad Virtual Accounts
- Every member (leader and regular) gets a GTBank virtual account number on creation
- Customers pay into this number → Squad fires a webhook to `POST /webhooks/squad`
- The webhook identifies the member by `virtual_account_number`, logs a Transaction row
- `sender_ref` on the transaction = the customer's name (used for customer diversity scoring)

### sender_overrides Trick
Squad's sandbox simulate endpoint doesn't accept `sender_name`. To control sender names for testing:
1. `POST /sim-transfer` accepts optional `sender_name`, stores it in `sender_overrides[virtual_account_number]`
2. Squad fires webhook
3. Webhook handler calls `sender_overrides.pop(virtual_account_number, None)` — consumes it once
4. Falls back to Squad's own `sender_name` if no override exists

### Demand Signal Detection (3 signal types)
Run by `services/demand.py` on `GET /clusters/demand`. Compares 14-day windows:

1. **`rapid_growth`** — fires if volume grew ≥40% in last 14 days vs prior 14 days. Strength = `min(growth_rate / 2, 1.0)`. Requires `prev_volume > 0`.
2. **`new_customer_influx`** — fires if unique senders grew ≥30% vs prior period. Fallback: if `prev_senders == 0` AND `len(recent_txns) >= 3` (this threshold was lowered from 5 to 3 specifically because Squad sandbox always generates the same sender name, making unique sender count useless for demo).
3. **`high_activity`** — fires if ≥50 credit transactions in last 30 days. Strength = `min(tx_count / 200, 1.0)`.

For each signal, Gemini (`infer_required_skills`) generates 4 relevant role labels. Falls back to a keyword map (`_INDUSTRY_KEYWORD_MAP`) if Gemini is unavailable.

### Cluster Health Score (0–100)
Computed by `compute_cluster_health_score`. Saved to `scores` table each time.

| metric | max pts | how |
|---|---|---|
| Active Member Rate | 25 | % of members with ≥1 credit tx in last 30 days |
| Volume Trend | 25 | % growth vs prior 30 days |
| Transaction Consistency | 20 | coefficient of variation across 8 weekly buckets (lower CV = better) |
| Customer Diversity | 15 | unique senders in last 30 days, capped at 10 |
| Member Retention | 15 | % of previously active members who are still active |

### Member Activity Score (0–100)
Computed by `compute_member_activity_score`. Also saved to `scores`.

| metric | max pts | how |
|---|---|---|
| Transaction Volume | 30 | member volume vs cluster average (ratio capped at 2x) |
| Consistency | 25 | CV across 8 weekly buckets |
| Customer Count | 25 | unique payers, capped at 5 |
| Growth Trend | 20 | volume growth vs prior 30 days |

### Loan Eligibility (Dual-Score)
- Both scores must be ≥ 40 / 100
- Max loan = `₦50,000 × (individual_score / 100) × (cluster_score / 100)`
- If ineligible, improvement_tips point to weakest metric
- Disbursement calls Squad Transfer API. `bank_code` hardcoded as `"058"` (GTBank — Squad's own bank). `account_number` is the member's GTBank account.

### AI Matching (Gemini)
`GET /matching/opportunities`:
1. Gets job seeker from JWT
2. Loops all clusters, runs demand detection on each
3. For each signal: checks skill overlap (substring match) OR location overlap
4. If match: calls `generate_matching_explanation` (Gemini) for a one-sentence reason
5. Returns ranked by signal strength descending

### AI Economic Profile
`GET /members/me/profile`: Sends member's score + transaction summary to Gemini, returns a 2-3 sentence narrative a bank could use to assess creditworthiness.

---

## Pending Work (Resume Here in New Session)

### 1. Add `bank_account_number` to Member and JobSeeker

**Members — what's done:**
- `schemas/member.py` MemberBase and MemberView: `bank_account_number` field added ✅

**Members — what's NOT done:**
- `models/member.py`: Add `bank_account_number = Column(String, nullable=True)` ❌
- `routers/auth.py` SignupRequest: Add `bank_account_number: Optional[str]` ❌
- `routers/auth.py` signup endpoint: Store `bank_account_number` in Supabase `user_metadata` ❌
- `services/auth.py` `get_current_user_profile`: Extract `bank_account_number` from `user_metadata` ❌
- `routers/clusters.py` `create_cluster`: Save `bank_account_number` from `current_user` to leader Member ❌
- Run SQL: `ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR;` ❌

**JobSeekers — nothing done yet:**
- `models/job_seeker.py`: Add `bank_account_number = Column(String, nullable=True)` ❌
- `schemas/job_seeker.py` JobSeekerSignupRequest: Add `bank_account_number: Optional[str]` ❌
- `schemas/job_seeker.py` JobSeekerView: Add `bank_account_number: Optional[str]` ❌
- `routers/auth.py` job_seeker_signup: Save `bank_account_number` to JobSeeker ❌
- Run SQL: `ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR;` ❌

**Disburse — what to change:**
- `schemas/financial_product.py` DisburseRequest: Make `account_number` optional (fall back to `member.bank_account_number`) ❌
- Remove `bank_code` from DisburseRequest entirely, hardcode `"058"` in `financial.py` ❌

### 2. Build the Application Feature (entirely new)

Create these files:
- `models/application.py` — Application model
- `schemas/application.py` — ApplicationCreate, ApplicationView
- `routers/applications.py` — 4 endpoints
- Update `models/__init__.py` — export Application
- Update `routers/__init__.py` — export applications router
- Update `main.py` — include router at prefix `/applications`

Run SQL in Supabase first.

### 3. Deploy to Render
Not yet deployed. Register Squad webhook URL after deploy.

### 4. Seed transaction data before presentation
Scoring requires real sustained transaction history. The scoring thresholds are calibrated for weeks of data. Will need to seed 30-60 days of spread transactions before the demo.

---

## Key Technical Decisions / Gotchas

- **No `success()` wrapper** — all endpoints return schema instances directly with `response_model=XxxSchema` on the decorator. This is the final architecture.
- **JWT signature not verified** — `verify_signature: False` in `_decode_token`. Fine for hackathon.
- **sender_overrides is in-memory** — if the server restarts between sim-transfer and webhook, the override is lost. Acceptable for demo.
- **`calcuated_at` typo** in Score model — do NOT fix, the column name exists in DB as-is.
- **All bank accounts assumed GTBank** — `bank_code = "058"` hardcoded everywhere. No need for a `bank_code` field on any model.
- **Demand signal threshold adjustment** — `new_customer_influx` fallback uses `len(recent_txns) >= 3` not unique senders, because Squad sandbox always uses the same `sender_name`.
- **Git history** — main branch has only backend. Frontend is on dev branch. Don't force push to main without checking.
- **Commit messages** — no prefixes (no "feat:", "chore:", etc.). Just plain clauses.
