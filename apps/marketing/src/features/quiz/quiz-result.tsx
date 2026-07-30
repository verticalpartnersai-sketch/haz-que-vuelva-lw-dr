"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { QuizBrandSystem } from "@/features/quiz/quiz-brand-system";
import type {
  DistanceBand,
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";
import { distanceBandLabel, resolvedLastAction } from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import { Faq, OfferSection } from "@/features/quiz/quiz-offer";
import { QuizSalesPage } from "@/features/quiz/quiz-sales-page";

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
    </section>
  );
}

function PreviewResult({
  answers,
  checkoutStatus,
  headingRef,
  onCheckout,
  route,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onCheckout: (position?: string) => void;
  route: QuizRoute;
}) {
  return (
    <QuizSalesPage
        answers={answers}
        checkoutStatus={checkoutStatus}
        onCheckout={onCheckout}
        headingRef={headingRef}
        route={route}
      />
  );
}

export function Result({
  answers,
  band,
  checkoutStatus,
  headingRef,
  index,
  enhancedExperience,
  onCheckout,
  route,
}: {
  answers: QuizAnswers;
  band: DistanceBand;
  checkoutStatus: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  index: number;
  enhancedExperience: boolean;
  onCheckout: (position?: string) => void;
  route: QuizRoute;
}) {
  const { l, locale } = useLocale();
  const copy = quizContentFor(locale);
  const routeCopy = copy.routes[route];

  if (enhancedExperience) {
    return (
      <PreviewResult
        answers={answers}
        checkoutStatus={checkoutStatus}
        headingRef={headingRef}
        onCheckout={onCheckout}
        route={route}
      />
    );
  }

  return (
    <main className="quiz-result quiz-stage" id="quiz-content">
      <QuizLogo compact />
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

      <QuizBrandSystem answers={answers} />

      <p className="quiz-result__bridge">{routeCopy.bridge}</p>
      <OfferSection
        answers={answers}
        checkoutStatus={checkoutStatus}
        onCheckout={() => onCheckout("legacy_offer")}
        route={route}
      />
      <Faq onCheckout={() => onCheckout("legacy_faq")} route={route} />

    </main>
  );
}
