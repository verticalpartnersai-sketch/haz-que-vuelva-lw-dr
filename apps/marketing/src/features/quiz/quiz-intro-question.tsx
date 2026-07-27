"use client";

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

export function PublicHeader() {
  const { locale, setLocale } = useLocale();
  const copy = quizContentFor(locale);

  return (
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
        <span aria-hidden="true" className="quiz-intro__heartbeat">
          <Icon name="heart" weight="fill" />
        </span>
        <span className="quiz-intro__eyebrow">{intro.eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {intro.headline}
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
        {question.context ? (
          <p className="quiz-question__context">
            <Icon name="spark" />
            {question.context}
          </p>
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
                {option.emoji ? (
                  <span aria-hidden="true" className="quiz-option__emoji">
                    {option.emoji}
                  </span>
                ) : null}
                <span className="quiz-option__label">{option.label}</span>
                <span aria-hidden="true" className="quiz-option__mark">
                  {checked ? <Icon name="check" /> : null}
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
  kind,
  onAnswer,
  selectedValue,
}: {
  disabled: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  kind: "commitment" | "desire";
  onAnswer: (option: QuizOption) => void;
  selectedValue: string | undefined;
}) {
  const { locale } = useLocale();
  const copy = quizContentFor(locale);
  const content = copy[kind];

  return (
    <main className="quiz-question-page quiz-stage" id="quiz-content">
      <section className="quiz-question quiz-question--commitment">
        <span aria-hidden="true" className="quiz-question__signal">
          <Icon name={kind === "desire" ? "heart" : "check"} weight="fill" />
        </span>
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
                  {checked ? <Icon name="check" /> : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      </section>
    </main>
  );
}
