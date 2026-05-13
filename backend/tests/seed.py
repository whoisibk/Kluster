"""
Demo seed script â€” populates the database with realistic data for 2 clusters.

Run from the backend directory with the venv active:
    python tests/seed.py

Seeds:
- Cluster 1: Oba Akran Phone Repair Association (strong â€” high scores, active signals)
- Cluster 2: Surulere Food Traders Cooperative (weak â€” low scores, limited signals)
- 3 job seekers with skills matching the demand signals
"""

import random
import sys
import os
from datetime import datetime, timedelta
from uuid import uuid4

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import SessionLocal
from models import Cluster, Member, Transaction, JobSeeker

db = SessionLocal()

random.seed(42)


def random_sender():
    names = [
        "Chukwuemeka Obi", "Fatima Aliyu", "Tunde Bakare", "Ngozi Eze",
        "Segun Adeyemi", "Amaka Nwosu", "Biodun Olatunji", "Hauwa Musa",
        "Ifeanyi Okeke", "Chisom Nnaji", "Yusuf Garba", "Blessing Okonkwo",
        "Emeka Okafor", "Sade Williams", "Kunle Adebayo", "Zainab Ibrahim",
        "Obinna Ugwu", "Taiwo Olawale", "Aisha Mohammed", "Gbenga Lawal",
    ]
    return random.choice(names)


def seed_transactions(member_id, cluster_id, days_back, count, base_amount, variance=0.4):
    """Seed `count` credit transactions spread over `days_back` days."""
    now = datetime.utcnow()
    for _ in range(count):
        day_offset = random.randint(0, days_back)
        hour_offset = random.randint(0, 23)
        amount = base_amount * (1 + random.uniform(-variance, variance))
        db.add(Transaction(
            id=uuid4(),
            member_id=member_id,
            cluster_id=cluster_id,
            amount=round(amount, 2),
            transaction_type="credit",
            sender_ref=random_sender(),
            squad_transaction_ref=f"SQWA{uuid4().hex[:14].upper()}",
            description="Payment received",
            timestamp=now - timedelta(days=day_offset, hours=hour_offset),
        ))


# â”€â”€â”€ Cluster 1: Strong â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

cluster1 = Cluster(
    id=uuid4(),
    name="Oba Akran Phone Repair Association",
    type="market_association",
    location="Ikeja, Lagos",
    description="A thriving association of phone and electronics repair technicians at Computer Village, Ikeja.",
    languages=["Yoruba", "English"],
    leader_member_id=None,
)
db.add(cluster1)
db.flush()

c1_members_data = [
    ("Adewale", "Fashola",   "08011223344"),
    ("Emeka",   "Okoye",     "08022334455"),
    ("Bola",    "Tinubu",    "08033445566"),
    ("Kemi",    "Adeyemi",   "08044556677"),
    ("Tunde",   "Bakare",    "08055667788"),
    ("Ngozi",   "Eze",       "08066778899"),
    ("Seun",    "Ojo",       "08077889900"),
    ("Chidi",   "Nwachukwu", "08088990011"),
    ("Funke",   "Olatunji",  "08099001122"),
    ("Yemi",    "Adebayo",   "08010011223"),
]

c1_members = []
for i, (fn, ln, phone) in enumerate(c1_members_data):
    m = Member(
        id=uuid4(),
        first_name=fn,
        last_name=ln,
        phone=phone,
        cluster_id=cluster1.id,
        role_in_cluster="leader" if i == 0 else "member",
        squad_virtual_account_id=f"902{random.randint(1000000, 9999999)}",
    )
    db.add(m)
    c1_members.append(m)

db.flush()
cluster1.leader_member_id = c1_members[0].id

# Strong members: high volume with extra recent transactions to push the growth signal
for m in c1_members[:7]:
    seed_transactions(m.id, cluster1.id, days_back=60, count=12, base_amount=18_000)
    seed_transactions(m.id, cluster1.id, days_back=14, count=8, base_amount=22_000)

# A few weaker members to keep scores realistic
for m in c1_members[7:]:
    seed_transactions(m.id, cluster1.id, days_back=60, count=5, base_amount=9_000)


# â”€â”€â”€ Cluster 2: Weak â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

cluster2 = Cluster(
    id=uuid4(),
    name="Surulere Food Traders Cooperative",
    type="cooperative",
    location="Surulere, Lagos",
    description="A cooperative of food vendors and small-scale caterers operating in the Surulere area.",
    languages=["Yoruba", "English", "Igbo"],
    leader_member_id=None,
)
db.add(cluster2)
db.flush()

c2_members_data = [
    ("Mama",    "Tunde",  "08021112233"),
    ("Chioma",  "Okafor", "08032223344"),
    ("Rashida", "Bello",  "08043334455"),
    ("Amaka",   "Nwosu",  "08054445566"),
    ("Grace",   "Eze",    "08065556677"),
    ("Halima",  "Usman",  "08076667788"),
]

c2_members = []
for i, (fn, ln, phone) in enumerate(c2_members_data):
    m = Member(
        id=uuid4(),
        first_name=fn,
        last_name=ln,
        phone=phone,
        cluster_id=cluster2.id,
        role_in_cluster="leader" if i == 0 else "member",
        squad_virtual_account_id=f"902{random.randint(1000000, 9999999)}",
    )
    db.add(m)
    c2_members.append(m)

db.flush()
cluster2.leader_member_id = c2_members[0].id

# Weak cluster: sparse and declining â€” more past transactions than recent ones
for m in c2_members[:3]:
    seed_transactions(m.id, cluster2.id, days_back=60, count=6, base_amount=8_000)
    seed_transactions(m.id, cluster2.id, days_back=14, count=2, base_amount=6_000)

for m in c2_members[3:]:
    seed_transactions(m.id, cluster2.id, days_back=60, count=3, base_amount=5_000)


# â”€â”€â”€ Job Seekers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

job_seekers = [
    JobSeeker(
        id=uuid4(),
        first_name="Uche",
        last_name="Nwosu",
        phone="08091234567",
        skills=["phone repair", "electronics", "sales assistant"],
        language="Igbo",
        location="Ikeja, Lagos",
        bio="Trained phone and electronics repair technician with 3 years experience at Computer Village.",
    ),
    JobSeeker(
        id=uuid4(),
        first_name="Sadiq",
        last_name="Musa",
        phone="08081234568",
        skills=["dispatch rider", "delivery", "logistics"],
        language="Hausa",
        location="Lagos",
        bio="Experienced dispatch rider available for same-day delivery and logistics runs across Lagos.",
    ),
    JobSeeker(
        id=uuid4(),
        first_name="Blessing",
        last_name="Okonkwo",
        phone="08071234569",
        skills=["cashier", "sales", "inventory clerk"],
        language="Igbo",
        location="Surulere, Lagos",
        bio="Detail-oriented cashier and sales assistant with experience in food retail and market trading.",
    ),
]

for js in job_seekers:
    db.add(js)


# â”€â”€â”€ Commit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

db.commit()
db.close()

print("Seed complete.")
print(f"  Cluster 1: {cluster1.name} ({cluster1.id})")
print(f"    Members:  {len(c1_members)}")
print(f"  Cluster 2: {cluster2.name} ({cluster2.id})")
print(f"    Members:  {len(c2_members)}")
print(f"  Job seekers: {len(job_seekers)}")
print()
print("Run the server and hit GET /clusters/{id}/health to see scores.")
