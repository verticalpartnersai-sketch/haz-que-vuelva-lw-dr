"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type { LoaderCopy } from "@/features/quiz/quiz-contracts";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import { ProofCarousel, type ProofSlide } from "@/features/quiz/quiz-proof";

const relationshipProofAssets = {
  colombiaHome: "/images/quiz/loader/happy-couple-colombia-home-v1.webp",
  colombiaStreet: "/images/quiz/loader/happy-couple-colombia-street-v2.webp",
  mexicoKitchen: "/images/quiz/loader/happy-couple-mexico-kitchen-v1.webp",
} as const;

function loaderSlides(locale: "en" | "es" | "pt"): readonly ProofSlide[] {
  const alt = {
    en: [
      "Happy Mexican couple cooking together at home",
      "Happy Colombian couple walking together in Bogotá",
      "Happy Colombian couple relaxing together at home",
    ],
    es: [
      "Pareja mexicana feliz cocinando junta en casa",
      "Pareja colombiana feliz caminando junta en Bogotá",
      "Pareja colombiana feliz descansando junta en casa",
    ],
    pt: [
      "Casal mexicano feliz cozinhando junto em casa",
      "Casal colombiano feliz caminhando junto em Bogotá",
      "Casal colombiano feliz descansando junto em casa",
    ],
  }[locale];

  return [
    {
      alt: alt[0],
      src: relationshipProofAssets.mexicoKitchen,
    },
    {
      alt: alt[1],
      src: relationshipProofAssets.colombiaStreet,
    },
    {
      alt: alt[2],
      src: relationshipProofAssets.colombiaHome,
    },
  ];
}

export function AnalysisLoader({
  copy,
  headingRef,
  internalPreview = false,
  mode,
  tick,
}: {
  copy: LoaderCopy;
  headingRef: RefObject<HTMLHeadingElement | null>;
  internalPreview?: boolean;
  mode: "analysis" | "route";
  tick: number;
}) {
  const { locale } = useLocale();
  const fullCopy = quizContentFor(locale);
  const engineLabel = {
    en: "PREPARING YOUR DIAGNOSIS",
    es: "PREPARANDO TU DIAGNÓSTICO",
    pt: "PREPARANDO SEU DIAGNÓSTICO",
  }[locale];
  const active = Math.min(tick, copy.states.length - 1);
  const progress = Math.min(100, tick * 25);

  if (internalPreview && mode === "route") {
    return (
      <main
        className="quiz-loading quiz-loading--minimal quiz-stage"
        id="quiz-content"
      >
        <section className="quiz-loading__content quiz-loading__minimal-content">
          <QuizLogo compact />
          <header className="quiz-loading__heading">
            <h1 ref={headingRef} tabIndex={-1}>
              {fullCopy.preview.loader.title}
            </h1>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="quiz-loading quiz-stage" id="quiz-content">
      <section className="quiz-loading__content">
        <QuizLogo compact />
        <div aria-hidden="true" className="quiz-loader-mark">
          <span>{progress}</span>
          <svg viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="21" />
            <circle
              cx="24"
              cy="24"
              pathLength="100"
              r="21"
              style={{ strokeDashoffset: 100 - progress }}
            />
          </svg>
        </div>
        <header className="quiz-loading__heading">
          <span className="section-kicker">
            {mode === "analysis" ? engineLabel : "R.E.G.R.E.S.A. 7D™"}
          </span>
          <h1 ref={headingRef} tabIndex={-1}>
            {copy.title}
          </h1>
          <p aria-live="polite" aria-atomic="true">
            {copy.states[active]}
          </p>
        </header>

        <div
          aria-label={copy.title}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="quiz-loader-progress"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>

        {mode === "analysis" ? (
          <div className="quiz-loader-proof">
            {copy.socialProof ? (
              <p className="quiz-loader-proof__copy">
                <strong>{copy.socialProof.lead}</strong>{" "}
                {copy.socialProof.middle}{" "}
                <strong>{copy.socialProof.highlight}</strong>
              </p>
            ) : null}
            <ProofCarousel
              autoIndex={active}
              eager
              label={fullCopy.ui.loadingProofLabel}
              slides={loaderSlides(locale)}
            />
          </div>
        ) : (
          <ol className="quiz-method-preview">
            {copy.captions.map((caption, index) => (
              <li className={index <= active ? "is-visible" : undefined} key={caption}>
                <span>{index + 1}</span>
                <p>{caption}</p>
                {index < active ? <Icon name="check" /> : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
