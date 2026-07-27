"use client";

import Image from "next/image";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type { QuizAnswers } from "@/features/quiz/quiz-contracts";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import {
  productProofAssets,
  ProofCarousel,
  type ProofSlide,
} from "@/features/quiz/quiz-proof";

function offerProofSlides(
  caption: string,
  locale: "en" | "es" | "pt",
): readonly ProofSlide[] {
  const labels = {
    en: ["Haz Que Vuelva™ cover", "Special routes", "7-day calendar", "Decision sheet", "R0–R4 reciprocity scale"],
    es: ["Portada de Haz Que Vuelva™", "Rutas especiales", "Calendario de 7 días", "Hoja de decisión", "Escala R0–R4 de reciprocidad"],
    pt: ["Capa de Haz Que Vuelva™", "Rotas especiais", "Calendário de sete dias", "Folha de decisão", "Escala R0–R4 de reciprocidade"],
  }[locale];
  const assets = [
    productProofAssets.cover,
    productProofAssets.routes,
    productProofAssets.calendar,
    productProofAssets.decision,
    productProofAssets.scale,
  ];

  return labels.map((label, index) => ({
    alt: label,
    caption: index === 0 ? caption : label,
    src: assets[index],
  }));
}

function Method({
  compactFirst,
}: {
  compactFirst: boolean;
}) {
  const { locale } = useLocale();
  const { pitch } = quizContentFor(locale);
  const startLabel = {
    en: "START TODAY",
    es: "EMPIEZA HOY",
    pt: "COMECE HOJE",
  }[locale];
  const quickStart = (
    <div className="quiz-offer__quick-start">
      <span className="section-kicker">{startLabel}</span>
      <strong>{pitch.items[0].title}</strong>
      <p>{pitch.items[0].description}</p>
    </div>
  );
  const method = (
    <ol className="quiz-method">
      {pitch.method.map((step) => {
        const [letter, text] = step.split(" · ");
        return (
          <li key={step}>
            <span>{letter}</span>
            <p>{text}</p>
          </li>
        );
      })}
    </ol>
  );

  return compactFirst ? (
    <>
      {quickStart}
      {method}
    </>
  ) : (
    <>
      {method}
      {quickStart}
    </>
  );
}

export function OfferSection({
  answers,
  checkoutStatus,
  onCheckout,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  onCheckout: () => void;
}) {
  const { locale } = useLocale();
  const { pitch } = quizContentFor(locale);
  const labels = {
    en: {
      benefits: "YOUR ROUTE, NOT A MAGIC PHRASE",
      duration: "7 DAYS",
      product: "COMPLETE FRONT PRODUCT",
    },
    es: {
      benefits: "TU RUTA, NO UNA FRASE MÁGICA",
      duration: "7 DÍAS",
      product: "PRODUCTO FRONT COMPLETO",
    },
    pt: {
      benefits: "SUA ROTA, NÃO UMA FRASE MÁGICA",
      duration: "7 DIAS",
      product: "PRODUTO FRONT COMPLETO",
    },
  }[locale];
  const desireOrder =
    answers.desire === "desire_missing"
      ? [3, 5, 0, 1, 2, 4]
      : [0, 1, 2, 4, 3, 5];

  return (
    <section className="quiz-offer-section" id="quiz-offer">
      <header className="quiz-offer-section__header">
        <div>
          <span className="section-kicker">
            HAZ QUE VUELVA™ · {labels.duration}
          </span>
          <h2>{pitch.headline}</h2>
          {pitch.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <Image
          alt="Haz Que Vuelva protocol cover"
          height={1275}
          loading="lazy"
          sizes="(max-width: 900px) 300px, 24vw"
          src={productProofAssets.cover}
          width={900}
        />
      </header>

      <div className="quiz-offer-section__control">
        <article className="quiz-offer-section__benefits">
          <span className="section-kicker">{labels.benefits}</span>
          <ul>
            {desireOrder.map((index) => (
              <li key={pitch.bullets[index]}>
                <Icon name="check" />
                <span>{pitch.bullets[index]}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="quiz-offer-section__method">
          <span className="section-kicker">MÉTODO R.E.G.R.E.S.A. 7D™</span>
          <Method compactFirst={answers.commitment === "commit_simple"} />
        </article>
      </div>

      <section className="quiz-stack">
        <span className="section-kicker">{labels.product}</span>
        <div>
          {pitch.items.map((item) => (
            <article key={item.title}>
              <Icon name="check" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <ProofCarousel
        label={pitch.proofTitle}
        slides={offerProofSlides(pitch.caption, locale)}
        title={pitch.proofTitle}
      />

      <aside className="quiz-checkout">
        <div>
          <span>HAZ QUE VUELVA™</span>
          <strong>{pitch.price}</strong>
          <p>{pitch.guarantee}</p>
        </div>
        <div>
          <button
            className="button button--primary button--full quiz-button--large"
            onClick={onCheckout}
            type="button"
          >
            {pitch.cta}
            <Icon name="arrowRight" />
          </button>
          <small>{pitch.microcopy}</small>
          <p aria-live="polite" className="quiz-checkout-status">
            {checkoutStatus}
          </p>
        </div>
      </aside>
    </section>
  );
}

export function Faq({
  onCheckout,
}: {
  onCheckout: () => void;
}) {
  const { locale } = useLocale();
  const { faq } = quizContentFor(locale);

  return (
    <section className="quiz-faq">
      <h2>{faq.title}</h2>
      <div>
        {faq.items.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <Icon name="arrowDown" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
      <button
        className="button button--primary quiz-button--large"
        onClick={onCheckout}
        type="button"
      >
        {faq.cta}
        <Icon name="arrowRight" />
      </button>
    </section>
  );
}
