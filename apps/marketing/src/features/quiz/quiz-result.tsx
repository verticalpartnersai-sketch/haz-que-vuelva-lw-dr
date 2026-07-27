"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type {
  DistanceBand,
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";
import { distanceBandLabel, resolvedLastAction } from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { Faq, OfferSection } from "@/features/quiz/quiz-offer";

function ResultSummary({
  answers,
  band,
  index,
}: {
  answers: QuizAnswers;
  band: DistanceBand;
  index: number;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const action = resolvedLastAction(answers);
  const items = [
    {
      label: copy.result.labels.contact,
      value: copy.summaries.state[answers.current_state ?? "cold_contact"],
    },
    {
      label: copy.result.labels.distance,
      value: copy.summaries.distance[answers.distance_time ?? "lt_7d"],
    },
    {
      label: copy.result.labels.action,
      value: copy.summaries.action[action],
    },
    {
      label: copy.result.labels.pain,
      value: copy.summaries.pain[answers.dominant_pain ?? "silence"],
    },
  ];

  return (
    <section className="quiz-result-summary">
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
        <div className="quiz-result-summary__score">
          <dt>{copy.result.labels.index}</dt>
          <dd>
            {index}
            <span>{distanceBandLabel(band, locale)}</span>
          </dd>
        </div>
      </dl>
      <p>
        <Icon name="spark" />
        {copy.result.disclaimer}
      </p>
    </section>
  );
}

export function Result({
  answers,
  band,
  checkoutStatus,
  headingRef,
  index,
  onCheckout,
  onRestart,
  route,
}: {
  answers: QuizAnswers;
  band: DistanceBand;
  checkoutStatus: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  index: number;
  onCheckout: () => void;
  onRestart: () => void;
  route: QuizRoute;
}) {
  const { l, locale } = useLocale();
  const copy = quizContentFor(locale);
  const routeCopy = copy.routes[route];

  return (
    <main className="quiz-result quiz-stage" id="quiz-content">
      <header className="quiz-result__hero">
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          {copy.result.confirmation}
        </span>
        <span className="quiz-result__route-label">
          {copy.result.titlePrefix}: <strong>{routeCopy.publicName}</strong>
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {routeCopy.headline}
        </h1>
      </header>

      <ResultSummary answers={answers} band={band} index={index} />

      <section className="quiz-route-diagnosis">
        <article>
          <span className="section-kicker">
            {l("LO QUE ESTÁ PASANDO", "O QUE ESTÁ ACONTECENDO", "WHAT IS HAPPENING")}
          </span>
          {routeCopy.diagnosis.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <aside>
          <span className="section-kicker">
            {l("PRÓXIMAS 24 HORAS", "PRÓXIMAS 24 HORAS", "NEXT 24 HOURS")}
          </span>
          <Icon name="arrowRight" />
          <p>{routeCopy.firstAction}</p>
        </aside>
      </section>

      <section className="quiz-result-timeline">
        <h2>{copy.result.timelineTitle}</h2>
        <ol>
          {copy.result.timeline.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <p className="quiz-result__bridge">{routeCopy.bridge}</p>
      <OfferSection
        answers={answers}
        checkoutStatus={checkoutStatus}
        onCheckout={onCheckout}
      />
      <Faq onCheckout={onCheckout} />

      <footer className="quiz-result__footer">
        <p>{copy.result.disclaimer}</p>
        <button className="button button--ghost" onClick={onRestart} type="button">
          {copy.ui.restart}
        </button>
      </footer>
    </main>
  );
}
