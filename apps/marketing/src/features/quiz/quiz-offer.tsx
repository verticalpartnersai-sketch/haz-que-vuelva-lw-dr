"use client";

import Image from "next/image";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type {
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import {
  productProofAssets,
  ProofCarousel,
  type ProofSlide,
} from "@/features/quiz/quiz-proof";

function offerProofSlides(
  caption: string,
  locale: "en" | "es" | "pt",
  route: QuizRoute,
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
  const preferredAsset: Record<QuizRoute, number> = {
    gray: 1,
    green: 4,
    logistics: 3,
    red: 1,
    third_person: 3,
    yellow: 4,
  };
  const order = [
    preferredAsset[route],
    ...assets.map((_, index) => index),
  ].filter((index, position, values) => values.indexOf(index) === position);

  return order.map((assetIndex, position) => ({
    alt: labels[assetIndex],
    caption: position === 0 ? caption : labels[assetIndex],
    src: assets[assetIndex],
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
  route,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  onCheckout: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const { pitch } = copy;
  const routeCopy = copy.routes[route];
  const labels = {
    en: {
      benefits: "YOUR ROUTE, NOT A MAGIC PHRASE",
      cost: "THE COST OF IMPROVISING AGAIN",
      duration: "7 DAYS",
      product: "COMPLETE FRONT PRODUCT",
    },
    es: {
      benefits: "TU RUTA, NO UNA FRASE MÁGICA",
      cost: "EL COSTO DE VOLVER A IMPROVISAR",
      duration: "7 DÍAS",
      product: "PRODUCTO FRONT COMPLETO",
    },
    pt: {
      benefits: "SUA ROTA, NÃO UMA FRASE MÁGICA",
      cost: "O CUSTO DE VOLTAR A IMPROVISAR",
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
            {routeCopy.publicName} · {labels.duration}
          </span>
          <h2>{routeCopy.offerHeadline}</h2>
          <p className="quiz-offer-section__route-lead">
            {routeCopy.offerLead}
          </p>
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
        slides={offerProofSlides(pitch.caption, locale, route)}
        title={pitch.proofTitle}
      />

      <aside className="quiz-offer-cost">
        <Icon name="arrowDown" />
        <div>
          <span className="section-kicker">{labels.cost}</span>
          <p>{routeCopy.costOfInaction}</p>
        </div>
      </aside>

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
            {routeCopy.cta}
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

export function PreviewOfferSection({
  answers,
  checkoutStatus,
  onCheckout,
  route,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  onCheckout: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const { pitch, preview } = copy;
  const routeCopy = copy.routes[route];
  const commitment = answers.commitment ?? "commit_route";
  const labels = {
    en: {
      bookAlt: "Haz Que Vuelva protocol shown as a hardcover book",
      bundleAlt:
        "Haz Que Vuelva protocol on a book, laptop, tablet and phone",
      guaranteeAlt: "Haz Que Vuelva seven-day guarantee seal",
    },
    es: {
      bookAlt: "Protocolo Haz Que Vuelva presentado como libro físico",
      bundleAlt:
        "Protocolo Haz Que Vuelva en libro, computadora, tableta y celular",
      guaranteeAlt: "Sello de garantía de siete días de Haz Que Vuelva",
    },
    pt: {
      bookAlt: "Protocolo Haz Que Vuelva apresentado como livro físico",
      bundleAlt:
        "Protocolo Haz Que Vuelva em livro, computador, tablet e celular",
      guaranteeAlt: "Selo de garantia de sete dias do Haz Que Vuelva",
    },
  }[locale];

  return (
    <section
      className="quiz-offer-section quiz-offer-section--preview"
      id="quiz-offer"
    >
      <header className="quiz-offer-section__header">
        <div>
          <span className="section-kicker">
            {routeCopy.publicName}
          </span>
          <h2>{routeCopy.offerHeadline}</h2>
          <p className="quiz-offer-section__route-lead">
            {routeCopy.offerLead}
          </p>
          <p className="quiz-offer-section__commitment-lead">
            {preview.pitch.commitmentLead[commitment]}
          </p>
        </div>
        <Image
          alt={labels.bookAlt}
          height={800}
          loading="lazy"
          sizes="(max-width: 900px) 100vw, 680px"
          src={productProofAssets.bookMockup}
          width={1200}
        />
      </header>

      <section className="quiz-stack">
        <h2>{pitch.proofTitle}</h2>
        <div>
          {pitch.items.map((item) => (
            <article key={item.title}>
              <span className="quiz-stack__icon">
                <Icon name="check" />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
        <figure className="quiz-offer-bundle">
          <Image
            alt={labels.bundleAlt}
            height={960}
            loading="lazy"
            sizes="(max-width: 900px) 100vw, 680px"
            src={productProofAssets.bundleMockup}
            width={1440}
          />
          <figcaption>{pitch.caption}</figcaption>
        </figure>
      </section>

      <aside className="quiz-offer-cost">
        <h2>{preview.pitch.cost.eyebrow}</h2>
        <p>{preview.pitch.cost.body}</p>
      </aside>

      <aside className="quiz-checkout">
        <div>
          <div className="quiz-checkout__logo">
            <QuizLogo compact />
          </div>
          <strong>{preview.pitch.offer.price}</strong>
        </div>
        <div>
          <button
            className="button button--primary button--full quiz-button--large"
            onClick={onCheckout}
            type="button"
          >
            {preview.pitch.offer.cta}
            <Icon name="arrowRight" />
          </button>
          <p aria-live="polite" className="quiz-checkout-status">
            {checkoutStatus}
          </p>
        </div>
      </aside>

      <section className="quiz-guarantee">
        <Image
          alt={labels.guaranteeAlt}
          height={640}
          loading="lazy"
          sizes="180px"
          src={productProofAssets.guaranteeSeal}
          width={640}
        />
        <h2>{preview.pitch.offer.guaranteeTitle}</h2>
        <p>{preview.pitch.offer.guarantee}</p>
      </section>
    </section>
  );
}

export function Faq({
  ctaLabel,
  onCheckout,
  route,
}: {
  ctaLabel?: string;
  onCheckout: () => void;
  route: QuizRoute;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const { faq } = copy;

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
        {ctaLabel ?? copy.routes[route].cta}
        <Icon name="arrowRight" />
      </button>
    </section>
  );
}
