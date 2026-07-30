"use client";

import Image from "next/image";
import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type {
  DistanceBand,
  ProofPreviewStoryId,
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";
import { distanceBandLabel, resolvedLastAction } from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
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
  const stageCopy = {
    en: {
      alertBody:
        "The opportunity is not gone. The strategy you are using is reinforcing distance.",
      alertTitle:
        "There is still an emotional opening, but one impulsive move can close it.",
      proofAlt:
        "A woman hesitating before sending an anxious message at night",
      proofCaption:
        "One impulsive message can turn the last opening into even more distance.",
      storyLead: "Your answers show that",
      storyLink: "That is why your impulse is to",
      storyTail:
        "This is not a lack of feeling. It is the exact pattern that makes your next move decisive.",
    },
    es: {
      alertBody:
        "No estás sin oportunidad. La estrategia que estás usando refuerza la distancia.",
      alertTitle:
        "Todavía existe una ventana emocional, pero un movimiento impulsivo puede cerrarla.",
      proofAlt:
        "Una mujer dudando antes de enviar un mensaje ansioso durante la noche",
      proofCaption:
        "Un mensaje impulsivo puede convertir la última apertura en más distancia.",
      storyLead: "Tus respuestas muestran que",
      storyLink: "Por eso tu impulso es",
      storyTail:
        "No es falta de sentimiento. Es el patrón exacto que vuelve decisivo tu próximo movimiento.",
    },
    pt: {
      alertBody:
        "Você não está sem oportunidade. A estratégia que está usando reforça a distância.",
      alertTitle:
        "Ainda existe uma janela emocional, mas um movimento impulsivo pode fechá-la.",
      proofAlt:
        "Uma mulher hesitando antes de enviar uma mensagem ansiosa durante a noite",
      proofCaption:
        "Uma mensagem impulsiva pode transformar a última abertura em ainda mais distância.",
      storyLead: "Suas respostas mostram que",
      storyLink: "Por isso, seu impulso é",
      storyTail:
        "Não é falta de sentimento. É o padrão exato que torna decisivo o seu próximo movimento.",
    },
  }[locale];

  return (
    <main className="quiz-prediagnosis quiz-stage" id="quiz-content">
      <QuizLogo compact />
      <div className="quiz-prediagnosis__product" aria-hidden="true">
        <Image
          alt=""
          height={1275}
          priority
          sizes="92px"
          src={productProofAssets.cover}
          width={900}
        />
      </div>

      <div className="quiz-prediagnosis__progress" aria-hidden="true">
        <span />
      </div>

      <header className="quiz-prediagnosis__header">
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          {copy.prediagnosis.alert}
        </span>
      </header>

      <section className="quiz-score" aria-label={copy.prediagnosis.scoreTitle}>
        <div className="quiz-score__heading">
          <div>
            <strong>{copy.prediagnosis.scoreTitle}</strong>
            <span>{copy.prediagnosis.scoreSubtitle}</span>
          </div>
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
      </section>

      <h1
        className="quiz-prediagnosis__headline"
        ref={headingRef}
        tabIndex={-1}
      >
        {routeCopy.prediagnosisHeadline}
      </h1>

      <p className="quiz-prediagnosis__story">
        {stageCopy.storyLead} <strong>{pain.sentence}</strong>.{" "}
        {stageCopy.storyLink} {pain.impulse}. {stageCopy.storyTail}
      </p>

      <figure className="quiz-prediagnosis__proof">
        <div>
          <Image
            alt={stageCopy.proofAlt}
            fill
            loading="lazy"
            sizes="(max-width: 560px) calc(100vw - 40px), 472px"
            src={productProofAssets.channelFragile}
          />
        </div>
        <figcaption>{stageCopy.proofCaption}</figcaption>
      </figure>

      <section className="quiz-prediagnosis__alert">
        <Icon name="warning" />
        <div>
          <strong>{stageCopy.alertTitle}</strong>
          <p>{stageCopy.alertBody}</p>
        </div>
      </section>

      <div className="quiz-prediagnosis__explanation">
        {copy.prediagnosis.bodyAfterLoop.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
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

const testimonialAssets: Record<ProofPreviewStoryId, string> = {
  camila: "/images/quiz/proof-preview/camila-chat-v3.webp",
  sofia: "/images/quiz/proof-preview/sofia-chat-v3.webp",
  valentina: "/images/quiz/proof-preview/valentina-chat-v3.webp",
};

export function Demonstration({
  answers,
  headingRef,
  enhancedExperience,
  onContinue,
  route,
}: {
  answers: QuizAnswers;
  headingRef: RefObject<HTMLHeadingElement | null>;
  enhancedExperience: boolean;
  onContinue: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const labels = copy.demonstration.dynamicLabels;
  const routeCopy = copy.routes[route];
  const action = copy.summaries.action[resolvedLastAction(answers)];
  const demonstrationLabel = {
    en: "THE PROBLEM IS NOT FEELING · IT IS ACTING WITHOUT A STRATEGY",
    es: "EL PROBLEMA NO ES SENTIR · ES ACTUAR SIN ESTRATEGIA",
    pt: "O PROBLEMA NÃO É SENTIR · É AGIR SEM ESTRATÉGIA",
  }[locale];

  if (enhancedExperience) {
    const preview = copy.preview.proof;

    return (
      <main
        className="quiz-demonstration quiz-demonstration--proof quiz-stage"
        id="quiz-content"
      >
        <QuizLogo compact />
        <header className="quiz-demonstration__header">
          <h1 ref={headingRef} tabIndex={-1}>
            {preview.headline}
          </h1>
          <p className="quiz-demonstration__proof-lead">{preview.body}</p>
        </header>

        <div className="quiz-demonstration__lead-image">
          <Image
            alt={preview.heroAlt}
            fill
            loading="lazy"
            sizes="(max-width: 639px) calc(100vw - 20px), 620px"
            src="/images/quiz/proof-preview/hero.webp"
          />
        </div>

        <div className="quiz-testimonial-list">
          {preview.stories.map((story) => (
            <article className="quiz-testimonial" key={story.id}>
              <p className="quiz-testimonial__intro">{story.intro}</p>
              <figure className="quiz-testimonial__shot">
                <Image
                  alt={story.imageAlt}
                  height={880}
                  loading="lazy"
                  sizes="(max-width: 639px) calc(100vw - 40px), 360px"
                  src={testimonialAssets[story.id]}
                  width={672}
                />
                <figcaption className="sr-only">
                  {story.messages.join(" ")}
                </figcaption>
              </figure>
              <p className="quiz-testimonial__outro">{story.conclusion}</p>
            </article>
          ))}
        </div>
        <p className="quiz-testimonial-disclosure">
          {
            {
              es: "Historias recreadas para ilustrar situaciones frecuentes. Los resultados dependen de cada relación.",
              pt: "Histórias recriadas para ilustrar situações frequentes. Os resultados dependem de cada relação.",
              en: "Stories recreated to illustrate common situations. Results depend on each relationship.",
            }[locale]
          }
        </p>

        <div className="quiz-stage-cta">
          <button
            className="button button--primary quiz-button--large"
            onClick={onContinue}
            type="button"
          >
            {preview.cta}
            <Icon name="arrowRight" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="quiz-demonstration quiz-stage" id="quiz-content">
      <QuizLogo compact />
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
