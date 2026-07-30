"use client";

import Image from "next/image";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export type ProofSlide = {
  alt: string;
  caption?: string;
  src: string;
};

export const productProofAssets = {
  bookMockup: "/images/quiz/offer/product-book-mockup-transparent-v2.webp",
  bundleMockup: "/images/quiz/offer/product-bundle-mockup-transparent-v2.webp",
  calendar: "/images/quiz/proof/proof-calendar.webp",
  channelFragile: "/images/quiz/proof/proof-channel-fragile-v3.webp",
  cover: "/images/quiz/proof/front-cover.webp",
  decision: "/images/quiz/proof/proof-decision.webp",
  guaranteeSeal: "/images/quiz/offer/guarantee-seal-transparent-v2.webp",
  routes: "/images/quiz/proof/proof-routes.webp",
  scale: "/images/quiz/proof/proof-scale.webp",
} as const;

export function ProofCarousel({
  autoIndex,
  eager = false,
  label,
  slides,
  title,
}: {
  autoIndex?: number;
  eager?: boolean;
  label: string;
  slides: readonly ProofSlide[];
  title?: string;
}) {
  const { locale } = useLocale();
  const controls = {
    en: { next: "Next", previous: "Previous" },
    es: { next: "Siguiente", previous: "Anterior" },
    pt: { next: "Próximo", previous: "Anterior" },
  }[locale];
  const [manualActive, setManualActive] = useState(0);
  const active =
    autoIndex === undefined ? manualActive : autoIndex % slides.length;
  const current = slides[active];

  function move(direction: -1 | 1) {
    setManualActive(
      (index) => (index + direction + slides.length) % slides.length,
    );
  }

  return (
    <section aria-label={label} className="quiz-proof">
      {title ? <h2>{title}</h2> : null}
      <div className="quiz-proof__viewport">
        <figure key={current.src}>
          <div className="quiz-proof__media">
            <Image
              alt={current.alt}
              height={1275}
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 639px) 70vw, 420px"
              src={current.src}
              width={900}
            />
          </div>
          {current.caption ? <figcaption>{current.caption}</figcaption> : null}
        </figure>
      </div>
      <div
        className={
          autoIndex === undefined
            ? "quiz-proof__controls"
            : "quiz-proof__controls quiz-proof__controls--auto"
        }
      >
        {autoIndex === undefined ? (
          <button
            aria-label={controls.previous}
            className="quiz-proof__arrow"
            onClick={() => move(-1)}
            type="button"
          >
            <Icon name="arrowLeft" />
          </button>
        ) : null}
        <div aria-hidden="true" className="quiz-proof__dots">
          {slides.map((slide, index) => (
            <span className={index === active ? "is-active" : undefined} key={slide.src} />
          ))}
        </div>
        {autoIndex === undefined ? (
          <button
            aria-label={controls.next}
            className="quiz-proof__arrow"
            onClick={() => move(1)}
            type="button"
          >
            <Icon name="arrowRight" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
