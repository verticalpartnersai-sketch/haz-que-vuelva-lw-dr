"use client";

import Image from "next/image";
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
import { productProofAssets } from "@/features/quiz/quiz-proof";

export function Prediagnosis({
  answers,
  band,
  headingRef,
  index,
  onContinue,
  route,
}: {
  answers: QuizAnswers;
  band: DistanceBand;
  headingRef: RefObject<HTMLHeadingElement | null>;
  index: number;
  onContinue: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const pain = copy.painImpulses[answers.dominant_pain ?? "silence"];
  const routeCopy = copy.routes[route];
  const scorePosition = Math.min(100, Math.round((index / 95) * 100));
  const decisionLabel = {
    en: "7 DAYS · 4 DECISIONS",
    es: "7 DÍAS · 4 DECISIONES",
    pt: "7 DIAS · 4 DECISÕES",
  }[locale];
  const loopLabel = {
    en: "Rejection Loop™",
    es: "Bucle de Rechazo™",
    pt: "Ciclo da Rejeição™",
  }[locale];

  return (
    <main className="quiz-prediagnosis quiz-stage" id="quiz-content">
      <header className="quiz-prediagnosis__header">
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          {copy.prediagnosis.alert}
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {routeCopy.prediagnosisHeadline}
        </h1>
      </header>

      <section className="quiz-score" aria-label={copy.prediagnosis.scoreTitle}>
        <div className="quiz-score__heading">
          <span>{copy.prediagnosis.scoreTitle}</span>
          <strong>
            {index}
            <small>/95</small>
          </strong>
        </div>
        <div className="quiz-score__rail">
          <span style={{ width: `${scorePosition}%` }} />
          <i style={{ left: `${scorePosition}%` }} />
        </div>
        <div className="quiz-score__labels">
          {(["low", "medium", "high"] as const).map((item) => (
            <span className={item === band ? "is-active" : undefined} key={item}>
              {distanceBandLabel(item, locale)}
            </span>
          ))}
        </div>
        <p>{copy.prediagnosis.scoreSubtitle}</p>
      </section>

      <div className="quiz-prediagnosis__grid">
        <article className="quiz-prediagnosis__story">
          <p>
            {locale === "pt" ? (
              <>
                O que você escolheu mostra que <strong>{pain.sentence}</strong>{" "}
                está dirigindo suas decisões. Por isso, seu impulso é{" "}
                {pain.impulse}.
              </>
            ) : locale === "en" ? (
              <>
                Your answers show that <strong>{pain.sentence}</strong> is
                driving your decisions. That is why your impulse is to{" "}
                {pain.impulse}.
              </>
            ) : (
              <>
                Lo que elegiste muestra que <strong>{pain.sentence}</strong>{" "}
                está dirigiendo tus decisiones. Por eso tu impulso es{" "}
                {pain.impulse}.
              </>
            )}
          </p>
          <div className="quiz-loop">
            <span className="section-kicker">{loopLabel}</span>
            <ol>
              {copy.prediagnosis.loop.map((step, position) => (
                <li key={step}>
                  <span>{step}</span>
                  {position < copy.prediagnosis.loop.length - 1 ? (
                    <Icon name="arrowDown" />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
          {copy.prediagnosis.bodyAfterLoop.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        <aside className="quiz-prediagnosis__needs">
          <span className="section-kicker">{decisionLabel}</span>
          <ul>
            {copy.prediagnosis.needs.map((need) => (
              <li key={need}>
                <Icon name="check" />
                <span>{need}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className="quiz-stage-cta">
        <button
          className="button button--primary quiz-button--large"
          onClick={onContinue}
          type="button"
        >
          {copy.prediagnosis.cta}
          <Icon name="arrowRight" />
        </button>
        <p>{copy.prediagnosis.microcopy}</p>
      </div>
    </main>
  );
}

const proofByCase = {
  decision: productProofAssets.decision,
  routes: productProofAssets.routes,
  scale: productProofAssets.scale,
} as const;

export function Demonstration({
  answers,
  headingRef,
  onContinue,
  route,
}: {
  answers: QuizAnswers;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onContinue: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const labels = copy.demonstration.dynamicLabels;
  const routeCopy = copy.routes[route];
  const action = copy.summaries.action[resolvedLastAction(answers)];
  const demonstrationLabel = {
    en: "ONE RULE ≠ EVERY CASE",
    es: "UNA REGLA ≠ TODOS LOS CASOS",
    pt: "UMA REGRA ≠ TODOS OS CASOS",
  }[locale];

  return (
    <main className="quiz-demonstration quiz-stage" id="quiz-content">
      <header className="quiz-demonstration__header">
        <span className="section-kicker">{demonstrationLabel}</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {copy.demonstration.headline}
        </h1>
        <p>{copy.demonstration.subheadline}</p>
      </header>

      <div className="quiz-case-grid">
        {copy.demonstration.cases.map((item) => (
          <article className="quiz-case" key={item.eyebrow}>
            <div className="quiz-case__media">
              <Image
                alt=""
                fill
                loading="lazy"
                sizes="(max-width: 639px) 100vw, (max-width: 900px) 40vw, 33vw"
                src={proofByCase[item.proof]}
              />
            </div>
            <div>
              <span>{item.eyebrow}</span>
              <p>{item.description}</p>
              <strong>
                <Icon name="check" />
                {item.decision}
              </strong>
            </div>
          </article>
        ))}
      </div>

      <section className="quiz-route-preview">
        <dl>
          <div>
            <dt>{labels[0]}</dt>
            <dd>{routeCopy.publicName}</dd>
          </div>
          <div>
            <dt>{labels[1]}</dt>
            <dd>{action}</dd>
          </div>
          <div>
            <dt>{labels[2]}</dt>
            <dd>{routeCopy.firstAction}</dd>
          </div>
        </dl>
      </section>

      <div className="quiz-stage-cta">
        <button
          className="button button--primary quiz-button--large"
          onClick={onContinue}
          type="button"
        >
          {copy.demonstration.cta}
          <Icon name="arrowRight" />
        </button>
      </div>
    </main>
  );
}
