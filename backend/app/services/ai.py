import json
import os
from typing import Any, Dict, List, Optional

from google import genai

_client: Optional[genai.Client] = None
_MODEL = "gemini-2.5-flash"


def _get_client() -> Optional[genai.Client]:
    global _client
    if _client is None:
        key = os.getenv("GEMINI_API_KEY")
        if key:
            _client = genai.Client(api_key=key)
    return _client


def generate_economic_profile(
    first_name: str,
    last_name: str,
    cluster_name: str,
    cluster_type: str,
    score_data: Dict[str, Any],
    transaction_summary: Dict[str, Any],
) -> str:
    """
    Generates a 2-3 sentence human-readable economic profile for a cluster member.

    Sends the member's transaction summary and activity score to Gemini, which
    returns a narrative a bank or investor could use to understand this person's
    economic life. Falls back to a template if GEMINI_API_KEY is not set.
    """
    client = _get_client()
    if client is None:
        return _fallback_profile(first_name, last_name, cluster_name, score_data, transaction_summary)

    score = score_data.get("score", 0)
    breakdown = score_data.get("breakdown", {})
    volume = transaction_summary.get("total_volume", 0)
    unique_customers = transaction_summary.get("unique_customers", 0)
    growth_rate = transaction_summary.get("growth_rate", 0)
    tx_count = transaction_summary.get("transaction_count", 0)

    prompt = f"""You are an economic intelligence analyst for Kluster, a platform that makes the informal Nigerian economy visible to financial institutions.

Write a 2-3 sentence economic profile for this cluster member. It should read as a professional summary that a bank or investor could use to understand this person's economic activity. Be specific with the numbers. Do not use bullet points.

Member: {first_name} {last_name}
Cluster: {cluster_name} ({cluster_type})
Activity Score: {score}/100
Last 30 days: ₦{volume:,.0f} in transactions across {tx_count} payments from {unique_customers} unique customers
Revenue growth: {growth_rate*100:+.1f}% vs previous period
Score breakdown: {breakdown}"""

    response = client.models.generate_content(model=_MODEL, contents=prompt)
    return response.text.strip()


def generate_matching_explanation(
    job_seeker_name: str,
    job_seeker_skills: List[str],
    job_seeker_location: str,
    cluster_name: str,
    cluster_location: str,
    signal_type: str,
    signal_strength: float,
    recommended_skills: List[str],
) -> str:
    """
    Generates a one-sentence explanation of why a job seeker matches a cluster's
    detected labor demand. Falls back to a template if GEMINI_API_KEY is not set.
    """
    client = _get_client()
    if client is None:
        return _fallback_match_explanation(job_seeker_name, cluster_name, signal_type)

    prompt = f"""You are an economic matching engine for Kluster. Write one sentence explaining why this job seeker is a good match for this cluster's detected labor demand. Be specific and practical.

Job seeker: {job_seeker_name} | Skills: {', '.join(job_seeker_skills)} | Location: {job_seeker_location}
Cluster: {cluster_name} | Location: {cluster_location}
Demand signal: {signal_type} (strength: {signal_strength:.0%})
Cluster needs: {', '.join(recommended_skills)}"""

    response = client.models.generate_content(model=_MODEL, contents=prompt)
    return response.text.strip()


def infer_required_skills(
    cluster_name: str,
    cluster_type: str,
    signal_type: str,
    recent_volume: float,
    growth_rate: float,
    transaction_count: int,
) -> List[str]:
    """
    Uses Gemini to infer what kinds of workers a cluster likely needs based on
    its trade, type, and the demand signal detected from its transaction data.

    Returns a list of 3-5 skill/role labels. The keyword map in demand.py is
    used as a fallback if GEMINI_API_KEY is not set or the response is malformed.
    """
    client = _get_client()
    if client is None:
        return []

    signal_label = signal_type.replace("_", " ")

    prompt = f"""You are an economic analyst for Kluster, a platform serving informal Nigerian trade clusters.

Based on this cluster's activity, list exactly 4 types of workers they likely need right now.
Return only a JSON array of short role labels, nothing else. Example: ["repair assistant", "dispatch rider", "cashier", "inventory clerk"]

Cluster: {cluster_name}
Type: {cluster_type}
Signal: {signal_label}
Last 30 days: ₦{recent_volume:,.0f} across {transaction_count} transactions
Growth: {growth_rate*100:+.1f}%"""

    response = client.models.generate_content(model=_MODEL, contents=prompt)
    raw = response.text.strip()

    # Strip markdown code fences if Gemini wraps the JSON
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        skills = json.loads(raw)
        if isinstance(skills, list):
            return [str(s) for s in skills[:5]]
    except (json.JSONDecodeError, ValueError):
        pass

    return []


def _fallback_profile(
    first_name: str,
    last_name: str,
    cluster_name: str,
    score_data: Dict[str, Any],
    transaction_summary: Dict[str, Any],
) -> str:
    score = score_data.get("score", 0)
    volume = transaction_summary.get("total_volume", 0)
    customers = transaction_summary.get("unique_customers", 0)
    growth = transaction_summary.get("growth_rate", 0)
    direction = "growing" if growth > 0 else "declining"
    return (
        f"{first_name} {last_name} is an active member of {cluster_name} with an activity score of {score}/100. "
        f"Over the last 30 days, they recorded ₦{volume:,.0f} in revenue from {customers} unique customers, "
        f"with a {direction} trend of {abs(growth)*100:.1f}%."
    )


def _fallback_match_explanation(job_seeker_name: str, cluster_name: str, signal_type: str) -> str:
    signal_label = signal_type.replace("_", " ")
    return (
        f"{job_seeker_name}'s skills align with {cluster_name}'s detected {signal_label}, "
        f"making them a strong candidate for available opportunities in this cluster."
    )
