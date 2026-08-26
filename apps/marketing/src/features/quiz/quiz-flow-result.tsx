import type { QuizFlowCopy } from "./quiz-flow-contracts";

export function QuizFlowResult({
  copy,
  onContinue,
  score,
}: {
  copy: QuizFlowCopy;
  onContinue: () => void;
  score: number;
}) {
  return (
    <section className="quiz-v2-result" id="quiz-content">
      <span className="quiz-v2-badge">{copy.result.badge}</span>
      <h1>{copy.result.title}</h1>
      <div className="quiz-v2-score" aria-label={`${copy.result.scoreLabel}: ${score}%`}>
        <svg aria-hidden="true" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" />
          <circle
            className="quiz-v2-score__value"
            cx="60"
            cy="60"
            pathLength="100"
            r="52"
            style={{ strokeDasharray: `${score} ${100 - score}` }}
          />
        </svg>
        <strong>{score}%</strong>
      </div>
      <h2>{copy.result.scoreLabel}</h2>
      <p className="quiz-v2-result__level">{copy.result.scoreLevel}</p>
      <ol className="quiz-v2-timeline">
        {copy.result.timeline.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <p>{item.text}</p>
          </li>
        ))}
      </ol>
      <ul className="quiz-v2-outcomes">
        {copy.result.outcomes.map((outcome) => (
          <li key={outcome}>
            <span aria-hidden="true">✓</span>
            {outcome}
          </li>
        ))}
      </ul>
      <button className="quiz-v2-primary" onClick={onContinue} type="button">
        {copy.result.button}
      </button>
    </section>
  );
}
