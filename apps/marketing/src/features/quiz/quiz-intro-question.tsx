"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { useLocale, type Locale } from "@/features/i18n/locale";
import {
  type QuizAnswers,
  type QuizOption,
} from "@/features/quiz/quiz-data";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { selectedOption } from "@/features/quiz/quiz-runtime";

export function PublicHeader() {
  const { l, locale, setLocale } = useLocale();

  return (
    <div className="quiz-language-control">
      <SelectControl
        ariaLabel={l("Cambiar idioma", "Alterar idioma", "Change language")}
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
  const { l } = useLocale();

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
        <h1 ref={headingRef} tabIndex={-1}>
          {l(
            "Antes de escribirle otra vez, descubre qué está empujándolo más lejos:",
            "Antes de escrever para ele novamente, descubra o que está afastando ele ainda mais:",
            "Before you write to him again, discover what is pushing him further away:",
          )}
          <em>
            {l(
              " tu mensaje, tu silencio o la otra mujer.",
              " sua mensagem, seu silêncio ou a outra mulher.",
              " your message, your silence, or the other woman.",
            )}
          </em>
        </h1>
        <div className="quiz-intro__actions">
          <button
            className="button button--primary quiz-button--large"
            onClick={onStart}
            type="button"
          >
            {l(
              "Ver qué está pasando en mi caso",
              "Ver o que está acontecendo no meu caso",
              "See what is happening in my case",
            )}
            <Icon name="arrowRight" />
          </button>
        </div>
        <p className="quiz-intro__privacy-note">
          {l(
            "Tus datos están 100% seguros, protegidos con encriptación avanzada. Garantizamos total privacidad y confidencialidad para ti.",
            "Seus dados estão 100% seguros, protegidos com criptografia avançada. Garantimos total privacidade e confidencialidade para você.",
            "Your data is 100% secure, protected with advanced encryption. We guarantee complete privacy and confidentiality for you.",
          )}
        </p>
      </div>
    </main>
  );
}

export function QuestionStep({
  answers,
  headingRef,
  onAnswer,
  onBack,
  onContinue,
  questionIndex,
}: {
  answers: QuizAnswers;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onAnswer: (option: QuizOption) => void;
  onBack: () => void;
  onContinue: () => void;
  questionIndex: number;
}) {
  const { l, locale } = useLocale();
  const { questions } = quizContentFor(locale);
  const question = questions[questionIndex];
  const selected = selectedOption(questionIndex, answers);

  return (
    <main className="quiz-question-page quiz-stage" id="quiz-content">
      <section
        aria-labelledby={`question-${questionIndex}`}
        className="quiz-question-card"
      >
        <div className="quiz-question-card__heading">
          <h1
            id={`question-${questionIndex}`}
            ref={headingRef}
            tabIndex={-1}
          >
            {question.title}
          </h1>
          <p>{question.microcopy}</p>
        </div>

        <fieldset className="quiz-options">
          <legend className="sr-only">
            {l("Elige una respuesta", "Escolha uma resposta", "Choose an answer")}
          </legend>
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
                <span className="quiz-option__label">{option.label}</span>
                <span aria-hidden="true" className="quiz-option__mark">
                  {checked ? <Icon name="check" /> : null}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div aria-live="polite" className="quiz-transition">
          {selected ? (
            <>
              <Icon name="spark" />
              <p>{question.transition}</p>
            </>
          ) : (
            <p>
              {l(
                "Selecciona la opción que más se parece a tu situación.",
                "Selecione a opção mais parecida com a sua situação.",
                "Select the option that most closely matches your situation.",
              )}
            </p>
          )}
        </div>

        <div className="quiz-question-card__actions">
          <button className="button button--ghost" onClick={onBack} type="button">
            <Icon name="arrowLeft" />
            {l("Volver", "Voltar", "Back")}
          </button>
          <button
            className="button button--primary"
            disabled={!selected}
            onClick={onContinue}
            type="button"
          >
            {questionIndex === questions.length - 1
              ? l("Preparar mi diagnóstico", "Preparar meu diagnóstico", "Prepare my diagnosis")
              : l("Continuar", "Continuar", "Continue")}
            <Icon name="arrowRight" />
          </button>
        </div>
      </section>
    </main>
  );
}
