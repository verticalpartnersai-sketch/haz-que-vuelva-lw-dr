"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type { LoaderCopy } from "@/features/quiz/quiz-contracts";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import {
  productProofAssets,
  ProofCarousel,
  type ProofSlide,
} from "@/features/quiz/quiz-proof";

function loaderSlides(copy: LoaderCopy): readonly ProofSlide[] {
  return [
    {
      alt: "Route map page from Haz Que Vuelva",
      caption: copy.captions[0],
      src: productProofAssets.routes,
    },
    {
      alt: "Decision page from Haz Que Vuelva",
      caption: copy.captions[1],
      src: productProofAssets.decision,
    },
    {
      alt: "Seven-day calendar page from Haz Que Vuelva",
      caption: copy.captions[2],
      src: productProofAssets.calendar,
    },
  ];
}

export function AnalysisLoader({
  copy,
  headingRef,
  mode,
  tick,
}: {
  copy: LoaderCopy;
  headingRef: RefObject<HTMLHeadingElement | null>;
  mode: "analysis" | "route";
  tick: number;
}) {
  const { locale } = useLocale();
  const fullCopy = quizContentFor(locale);
  const engineLabel = {
    en: "DIAGNOSTIC ENGINE",
    es: "MOTOR DE DIAGNÓSTICO",
    pt: "MOTOR DE DIAGNÓSTICO",
  }[locale];
  const active = Math.min(tick, copy.states.length - 1);
  const progress = Math.min(100, tick * 25);

  return (
    <main className="quiz-loading quiz-stage" id="quiz-content">
      <section className="quiz-loading__content">
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
          <ProofCarousel
            autoIndex={active}
            label={fullCopy.ui.loadingProofLabel}
            slides={loaderSlides(copy)}
          />
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
