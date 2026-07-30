"use client";

import Image from "next/image";
import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { useLocale, type Locale } from "@/features/i18n/locale";
import type {
  QuizAnswers,
  QuizOption,
} from "@/features/quiz/quiz-contracts";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { selectedOption } from "@/features/quiz/quiz-runtime";

export function PublicHeader({
  audioMuted,
  audioNeedsGesture,
  audioStarted,
  onToggleAudio,
}: {
  audioMuted: boolean;
  audioNeedsGesture: boolean;
  audioStarted: boolean;
  onToggleAudio: () => void;
}) {
  const { l, locale, setLocale } = useLocale();
  const copy = quizContentFor(locale);
  const audioOff = !audioStarted || audioMuted;

  return (
    <div className="quiz-header-controls">
      <button
        aria-label={
          audioOff
            ? l("Activar audio", "Ativar áudio", "Turn audio on")
            : l("Silenciar audio", "Silenciar áudio", "Mute audio")
        }
        className={
          audioNeedsGesture
            ? "quiz-audio-control needs-gesture"
            : "quiz-audio-control"
        }
        onClick={onToggleAudio}
        type="button"
      >
        <Icon name={audioOff ? "speakerSlash" : "speakerHigh"} />
      </button>
      <div className="quiz-language-control">
        <SelectControl
          ariaLabel={copy.ui.changeLanguage}
          className="select-control--quiz"
          leadingIcon="globe"
          onChange={(value) => setLocale(value as Locale)}
          options={[
            { label: "ES", value: "es" },
            { label: "PT-BR", value: "pt" },
            { label: "EN", value: "en" },
          ]}
          value={locale}
        />
      </div>
    </div>
  );
}

export function QuizLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      alt="Haz Que Vuelva"
      className={compact ? "quiz-logo quiz-logo--step" : "quiz-logo quiz-logo--intro"}
      fetchPriority={compact ? "auto" : "high"}
      height={392}
      priority={!compact}
      src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
      width={1451}
    />
  );
}

export function Intro({
  headingRef,
  onStart,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onStart: () => void;
}) {
  const { locale } = useLocale();
  const { intro } = quizContentFor(locale);

  return (
    <main className="quiz-intro quiz-stage" id="quiz-content">
      <picture className="quiz-intro__backdrop">
        <source
          media="(max-width: 639px)"
          srcSet="/images/quiz/hero-mobile.webp"
        />
        <source
          media="(max-width: 1439px)"
          srcSet="/images/quiz/hero-notebook.webp"
        />
        <source
          media="(max-width: 1919px)"
          srcSet="/images/quiz/hero-desktop.webp"
        />
        <img
          alt=""
          decoding="async"
          fetchPriority="high"
          height={809}
          src="/images/quiz/hero-ultrawide.webp"
          width={1942}
        />
      </picture>
      <div className="quiz-intro__copy">
        <QuizLogo />
        <span className="quiz-intro__eyebrow">{intro.eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {intro.headline}
          <span className="quiz-intro__headline-accent">
            {intro.headlineAccent}
          </span>
        </h1>
        <p className="quiz-intro__subheadline">{intro.subheadline}</p>
        <button
          className="button button--primary quiz-button--large"
          onClick={onStart}
          type="button"
        >
          {intro.cta}
          <Icon name="arrowRight" />
        </button>
        <p className="quiz-intro__privacy-note">{intro.privacy}</p>
      </div>
    </main>
  );
}

export function QuestionStep({
  answers,
  disabled,
  headingRef,
  onAnswer,
  questionIndex,
}: {
  answers: QuizAnswers;
  disabled: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onAnswer: (option: QuizOption) => void;
  questionIndex: number;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const question = copy.questions[questionIndex];
  const selected = selectedOption(question, answers);

  return (
    <main className="quiz-question-page quiz-stage" id="quiz-content">
      <section aria-labelledby={`question-${question.id}`} className="quiz-question">
        <QuizLogo compact />
        {question.context ? (
          <p className="quiz-question__context">{question.context}</p>
        ) : null}
        <header className="quiz-question__heading">
          <h1
            id={`question-${question.id}`}
            ref={headingRef}
            tabIndex={-1}
          >
            {question.title}
          </h1>
          {question.microcopy ? <p>{question.microcopy}</p> : null}
        </header>

        <fieldset
          className={
            question.variant === "cards"
              ? "quiz-options quiz-options--cards"
              : "quiz-options"
          }
          disabled={disabled}
        >
          <legend className="sr-only">{copy.ui.answerHint}</legend>
          {question.options.map((option) => {
            const checked = selected?.value === option.value;

            return (
              <label
                className={checked ? "quiz-option is-selected" : "quiz-option"}
                key={option.value}
              >
                <input
                  checked={checked}
                  name={question.id}
                  onChange={() => onAnswer(option)}
                  type="radio"
                  value={option.value}
                />
                {option.image ? (
                  <span aria-hidden="true" className="quiz-option__media">
                    <Image
                      alt=""
                      height="512"
                      src={option.image}
                      width="512"
                    />
                  </span>
                ) : option.emoji ? (
                  <span aria-hidden="true" className="quiz-option__emoji">
                    {option.emoji}
                  </span>
                ) : null}
                <span className="quiz-option__content">
                  <span className="quiz-option__label">{option.label}</span>
                  <span aria-hidden="true" className="quiz-option__mark">
                    {checked ? <Icon name="check" /> : null}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div aria-live="polite" className="quiz-transition">
          {selected?.transition ? (
            <>
              <Icon name="spark" />
              <p>{selected.transition}</p>
            </>
          ) : (
            <p>{copy.ui.answerHint}</p>
          )}
        </div>
      </section>
    </main>
  );
}

export function CommitmentQuestion({
  disabled,
  headingRef,
  enhancedExperience = false,
  kind,
  onAnswer,
  selectedValue,
}: {
  disabled: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  enhancedExperience?: boolean;
  kind: "commitment" | "desire";
  onAnswer: (option: QuizOption) => void;
  selectedValue: string | undefined;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const previewCommitment = enhancedExperience && kind === "commitment";
  const content = previewCommitment ? copy.preview.commitment : copy[kind];

  return (
    <main className="quiz-question-page quiz-stage" id="quiz-content">
      <section
        className={
          previewCommitment
            ? "quiz-question quiz-question--commitment quiz-question--commitment-preview"
            : "quiz-question quiz-question--commitment"
        }
      >
        <QuizLogo compact />
        {previewCommitment ? (
          <span className="quiz-question__kicker section-kicker">
            {copy.preview.commitment.eyebrow}
          </span>
        ) : null}
        <header className="quiz-question__heading">
          <h1 ref={headingRef} tabIndex={-1}>
            {content.title}
          </h1>
        </header>
        <fieldset className="quiz-options" disabled={disabled}>
          <legend className="sr-only">{copy.ui.answerHint}</legend>
          {content.options.map((option) => {
            const checked = selectedValue === option.value;

            return (
              <label
                className={checked ? "quiz-option is-selected" : "quiz-option"}
                key={option.value}
              >
                <input
                  checked={checked}
                  name={kind}
                  onChange={() => onAnswer(option)}
                  type="radio"
                  value={option.value}
                />
                <span className="quiz-option__label">{option.label}</span>
                <span aria-hidden="true" className="quiz-option__mark">
                  {checked && !previewCommitment ? <Icon name="check" /> : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      </section>
    </main>
  );
}
