"use client";

import type { FormEvent, RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import type { Lead } from "@/features/quiz/quiz-runtime";

export function LeadCapture({
  error,
  headingRef,
  lead,
  onBack,
  onChange,
  onSkip,
  onSubmit,
}: {
  error: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  lead: Lead;
  onBack: () => void;
  onChange: (lead: Lead) => void;
  onSkip: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { l } = useLocale();

  return (
    <main className="quiz-capture quiz-stage" id="quiz-content">
      <section className="quiz-capture__card">
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          {l("5 de 5 respuestas", "5 de 5 respostas", "5 of 5 answers")}
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {l(
            "Tu diagnóstico está listo.",
            "Seu diagnóstico está pronto.",
            "Your diagnosis is ready.",
          )}
        </h1>
        <p>
          {l(
            "Déjanos tu nombre y email si quieres guardar el resultado. También puedes saltar este paso y verlo ahora.",
            "Deixe seu nome e e-mail se quiser salvar o resultado. Você também pode pular esta etapa e vê-lo agora.",
            "Leave your name and email if you want to save the result. You can also skip this step and see it now.",
          )}
        </p>

        <form onSubmit={onSubmit}>
          <div className="quiz-capture__fields">
            <label>
              <span>{l("Nombre", "Nome", "Name")}</span>
              <input
                autoComplete="name"
                onChange={(event) =>
                  onChange({ ...lead, name: event.target.value })
                }
                placeholder={l(
                  "¿Cómo quieres que te llamemos?",
                  "Como você quer ser chamada?",
                  "What should we call you?",
                )}
                value={lead.name}
              />
            </label>
            <label>
              <span>{l("Email", "E-mail", "Email")}</span>
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) =>
                  onChange({ ...lead, email: event.target.value })
                }
                placeholder={l(
                  "¿A dónde enviamos tu resultado?",
                  "Para onde enviamos seu resultado?",
                  "Where should we send your result?",
                )}
                type="email"
                value={lead.email}
              />
            </label>
            <label>
              <span>{l("País", "País", "Country")}</span>
              <select
                onChange={(event) =>
                  onChange({
                    ...lead,
                    country: event.target.value as Lead["country"],
                  })
                }
                value={lead.country}
              >
                <option value="mx">{l("México", "México", "Mexico")}</option>
                <option value="co">{l("Colombia", "Colômbia", "Colombia")}</option>
                <option value="other">{l("Otro", "Outro", "Other")}</option>
              </select>
            </label>
          </div>

          <label className="quiz-consent">
            <input
              checked={lead.consent}
              onChange={(event) =>
                onChange({ ...lead, consent: event.target.checked })
              }
              type="checkbox"
            />
            <span aria-hidden="true" className="quiz-consent__mark">
              {lead.consent ? <Icon name="check" /> : null}
            </span>
            <span>
              {l(
                "Acepto recibir mi resultado y comunicaciones de Haz Que Vuelva™. Puedo salir cuando quiera.",
                "Aceito receber meu resultado e comunicações da Haz Que Vuelva™. Posso cancelar quando quiser.",
                "I agree to receive my result and messages from Haz Que Vuelva™. I can unsubscribe at any time.",
              )}
            </span>
          </label>

          <p aria-live="polite" className="quiz-form-error">
            {error}
          </p>

          <div className="quiz-capture__actions">
            <button className="button button--ghost" onClick={onBack} type="button">
              <Icon name="arrowLeft" />
              {l("Volver", "Voltar", "Back")}
            </button>
            <div>
              <button className="button button--primary" type="submit">
                {l(
                  "Guardar y ver mi resultado",
                  "Salvar e ver meu resultado",
                  "Save and see my result",
                )}
                <Icon name="arrowRight" />
              </button>
              <button
                className="button button--ghost"
                onClick={onSkip}
                type="button"
              >
                {l(
                  "Verlo sin dejar mis datos",
                  "Ver sem deixar meus dados",
                  "See it without leaving my details",
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

export function Loading({
  completed,
  headingRef,
  onReveal,
}: {
  completed: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onReveal: () => void;
}) {
  const { l, locale } = useLocale();
  const { loadingMessages } = quizContentFor(locale);
  const ready = completed >= loadingMessages.length;

  return (
    <main className="quiz-loading quiz-stage" id="quiz-content">
      <section className="quiz-loading__card">
        <div aria-hidden="true" className={ready ? "quiz-orbit is-ready" : "quiz-orbit"}>
          <span>H</span>
        </div>
        <span className="section-kicker">
          {l("Cruzando tus respuestas", "Cruzando suas respostas", "Comparing your answers")}
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {ready
            ? l("Tu ruta está preparada.", "Sua rota está pronta.", "Your route is ready.")
            : l("Estamos leyendo el patrón.", "Estamos lendo o padrão.", "We are reading the pattern.")}
        </h1>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {ready
            ? l("Diagnóstico listo.", "Diagnóstico pronto.", "Diagnosis ready.")
            : loadingMessages[Math.min(completed, loadingMessages.length - 1)]}
        </div>
        <ol className="quiz-loading__steps">
          {loadingMessages.map((message, index) => (
            <li
              className={
                index < completed
                  ? "is-complete"
                  : index === completed
                    ? "is-active"
                    : undefined
              }
              key={message}
            >
              <span aria-hidden="true">
                {index < completed ? <Icon name="check" /> : index + 1}
              </span>
              <p>{message}</p>
            </li>
          ))}
        </ol>
        {ready ? (
          <button
            className="button button--primary quiz-button--large"
            onClick={onReveal}
            type="button"
          >
            {l("Ver mi resultado", "Ver meu resultado", "See my result")}
            <Icon name="arrowRight" />
          </button>
        ) : null}
      </section>
    </main>
  );
}
