from app.safety.policy import evaluate_safety


def test_immediate_risk_interrupts_relational_strategy():
    decision = evaluate_safety("Me amenaza con un arma si termino la relación")
    assert decision.safety_mode
    assert decision.category == "immediate_risk"


def test_regular_relationship_question_stays_in_normal_mode():
    decision = evaluate_safety("Quiero entender por qué dejamos de hablar")
    assert not decision.safety_mode
