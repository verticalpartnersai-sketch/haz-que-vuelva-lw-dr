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
    "orden de alejamiento",
    "medida cautelar",
    "me persigue",
    "me acosa",
    "publicar fotos íntimas",
    "filtrar fotos íntimas",
    "hay un menor en riesgo",
)

_PROHIBITED_TACTIC_MARKERS = (
    "hacerle celos",
    "darle celos",
    "cuenta falsa",
    "otro número",
    "saltarme el bloqueo",
    "fingir una emergencia",
    "amenazarlo",
    "chantajearlo",
    "usar a los hijos",
    "presionarlo para tener sexo",
    "seguirlo sin que sepa",
)


def evaluate_safety(message: str) -> SafetyDecision:
    normalized = message.casefold()
    for marker in _IMMEDIATE_RISK_MARKERS:
        if marker in normalized:
            return SafetyDecision(safety_mode=True, category="immediate_risk")
    for marker in _PROHIBITED_TACTIC_MARKERS:
        if marker in normalized:
            return SafetyDecision(safety_mode=True, category="prohibited_tactic")
    return SafetyDecision(safety_mode=False)
