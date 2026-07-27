from dataclasses import dataclass


@dataclass(frozen=True)
class SafetyDecision:
    safety_mode: bool
    category: str | None = None


_IMMEDIATE_RISK_MARKERS = (
    "me voy a matar",
    "suicidio",
    "me amenaza",
    "violencia",
    "me golpea",
    "arma",
    "secuestr",
    "coacción",
)


def evaluate_safety(message: str) -> SafetyDecision:
    normalized = message.casefold()
    for marker in _IMMEDIATE_RISK_MARKERS:
        if marker in normalized:
            return SafetyDecision(safety_mode=True, category="immediate_risk")
    return SafetyDecision(safety_mode=False)
