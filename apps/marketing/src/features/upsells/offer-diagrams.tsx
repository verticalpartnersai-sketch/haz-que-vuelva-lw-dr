const cycleSteps = ["Señal", "Alivio", "Urgencia", "Acelerar", "Retirada"];
const reciprocitySignals = [
  "Iniciativa",
  "Consistencia",
  "Claridad",
  "Respeto",
  "Bienestar",
];
const contextSteps = [
  "Conversación real",
  "Hechos",
  "Interpretaciones",
  "Señales",
  "Decisión",
  "Razón",
  "Mensaje posible",
  "Señal a observar",
];

export function SecondLossCycle() {
  return (
    <figure className="pp-diagram pp-cycle" aria-label="Ciclo de la Segunda Pérdida">
      <ol>
        {cycleSteps.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ol>
      <svg aria-hidden="true" viewBox="0 0 600 100">
        <path d="M20 50 C120 5 170 95 270 50 S420 5 520 50" />
        <path d="M512 36 L536 50 L512 64" />
      </svg>
    </figure>
  );
}

export function ReciprocitySignal() {
  return (
    <figure className="pp-diagram pp-reciprocity" aria-label="Señales de reciprocidad">
      <div className="pp-reciprocity__axis" aria-hidden="true" />
      <ol>
        {reciprocitySignals.map((signal, index) => (
          <li key={signal}>
            <i style={{ "--signal": index + 1 } as React.CSSProperties} />
            <span>{signal}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ContextDecisionFlow() {
  return (
    <figure className="pp-diagram pp-context" aria-label="Flujo de análisis de VUELVE IA">
      <ol>
        {contextSteps.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
    </figure>
  );
}
