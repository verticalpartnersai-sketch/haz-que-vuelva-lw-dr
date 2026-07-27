"use client";

import type { RefObject } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { type QuizAnswers, type QuizRoute } from "@/features/quiz/quiz-data";
import {
  getRecapLabel,
  resolveMainError,
} from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import type { Lead } from "@/features/quiz/quiz-runtime";

function Recap({
  answers,
  name,
}: {
  answers: QuizAnswers;
  name: string;
}) {
  const { locale } = useLocale();
  const channel = getRecapLabel("estado_canal", answers.estado_canal, locale);
  const attempt = getRecapLabel(
    "intento_previo",
    answers.intento_previo,
    locale,
  );
  const otherWoman = getRecapLabel(
    "tercera_persona",
    answers.tercera_persona,
    locale,
  );
  const urgent = getRecapLabel(
    "accion_urgente",
    answers.accion_urgente,
    locale,
  );

  if (locale === "pt") {
    return (
      <p className="quiz-result__recap">
        {name ? `${name}, você` : "Você"} marcou que <strong>{channel}</strong>.
        A última coisa que fez foi <strong>{attempt}</strong> e, sobre a outra
        mulher, disse <strong>{otherWoman}</strong>. Hoje estava prestes a{" "}
        <strong>{urgent}</strong>.
      </p>
    );
  }

  if (locale === "en") {
    return (
      <p className="quiz-result__recap">
        {name ? `${name}, you` : "You"} said that <strong>{channel}</strong>.
        The last thing you did was <strong>{attempt}</strong>, and about the
        other woman, you said <strong>{otherWoman}</strong>. Today you were
        about to <strong>{urgent}</strong>.
      </p>
    );
  }

  return (
    <p className="quiz-result__recap">
      {name ? `${name}, m` : "M"}arcaste que{" "}
      <strong>{channel}</strong>. Lo último que hiciste fue{" "}
      <strong>{attempt}</strong> y, sobre otra mujer, dijiste{" "}
      <strong>{otherWoman}</strong>. Hoy estabas a punto de{" "}
      <strong>{urgent}</strong>.
    </p>
  );
}

function Offer({
  checkoutStatus,
  cta,
  microcopy,
  onCheckout,
}: {
  checkoutStatus: string;
  cta: string;
  microcopy: string | undefined;
  onCheckout: () => void;
}) {
  const { l, locale } = useLocale();
  const { commonOfferItems } = quizContentFor(locale);

  return (
    <aside aria-labelledby="offer-title" className="quiz-offer">
      <span className="section-kicker">
        {l("Tu ruta de 7 días", "Sua rota de 7 dias", "Your 7-day route")}
      </span>
      <h2 id="offer-title">
        {l("Lo que recibes hoy", "O que você recebe hoje", "What you receive today")}
      </h2>
      <ul>
        {commonOfferItems.map((item) => (
          <li key={item.title}>
            <Icon name="check" />
            <p>
              <strong>{item.title}:</strong> {item.description}
            </p>
          </li>
        ))}
      </ul>
      <div className="quiz-offer__price">
        <span>{l("Acceso inmediato", "Acesso imediato", "Immediate access")}</span>
        <strong>
          <small>US$</small>7
        </strong>
        <p>
          {l(
            "Tienes 7 días de garantía. No necesitas comprar ningún bump para recibir el método completo.",
            "Você tem 7 dias de garantia. Não precisa comprar nenhum adicional para receber o método completo.",
            "You have a 7-day guarantee. You do not need to buy any add-on to receive the complete method.",
          )}
        </p>
      </div>
      <button
        className="button button--primary button--full quiz-button--large"
        onClick={onCheckout}
        type="button"
      >
        {cta}
        <Icon name="arrowRight" />
      </button>
      {microcopy ? <small>{microcopy}</small> : null}
      <p aria-live="polite" className="quiz-checkout-status">
        {checkoutStatus}
      </p>
    </aside>
  );
}

export function Result({
  answers,
  checkoutStatus,
  headingRef,
  lead,
  onCheckout,
  onRestart,
  onSafetyExit,
  route,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  lead: Lead;
  onCheckout: () => void;
  onRestart: () => void;
  onSafetyExit: () => void;
  route: QuizRoute;
}) {
  const { l, locale } = useLocale();
  const { mainErrorCopy, results } = quizContentFor(locale);
  const result = results[route];
  const mainError = resolveMainError(answers);
  const isSafetyRoute = route === "red";

  return (
    <main
      className={
        isSafetyRoute
          ? "quiz-result quiz-result--safety quiz-stage"
          : "quiz-result quiz-stage"
      }
      id="quiz-content"
    >
      <header className="quiz-result__header">
        <span className="status-badge status-badge--locked">
          <Icon name={isSafetyRoute ? "heart" : "spark"} />
          {result.label}
        </span>
        <span className="quiz-result__eyebrow">
          {l("Tu diagnóstico", "Seu diagnóstico", "Your diagnosis")}
        </span>
        <h1 ref={headingRef} tabIndex={-1}>
          {result.headline}
        </h1>
        <Recap answers={answers} name={lead.name.trim()} />
      </header>

      <div
        className={
          isSafetyRoute
            ? "quiz-result__layout quiz-result__layout--single"
            : "quiz-result__layout"
        }
      >
        <article className="quiz-result__article">
          <section>
            <span className="section-kicker">
              {l("Lo que está pasando", "O que está acontecendo", "What is happening")}
            </span>
            <h2>{l("Diagnóstico", "Diagnóstico", "Diagnosis")}</h2>
            <p>{result.diagnosis}</p>
          </section>

          {isSafetyRoute ? null : (
            <section className="quiz-result__error">
              <Icon name="spark" />
              <div>
                <span className="section-kicker">
                  {l(
                    "El error que debes cortar hoy",
                    "O erro que você precisa interromper hoje",
                    "The mistake you need to stop today",
                  )}
                </span>
                <p>{mainErrorCopy[mainError]}</p>
              </div>
            </section>
          )}

          <section>
            <span className="section-kicker">
              {l("Próximas 24 horas", "Próximas 24 horas", "Next 24 hours")}
            </span>
            <h2>{result.decisionTitle}</h2>
            {result.safetySteps ? (
              <ol className="quiz-result__safety-steps">
                {result.safetySteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : (
              <p>{result.decision}</p>
            )}
          </section>

          {result.pitch ? (
            <section className="quiz-result__pitch">
              <span className="section-kicker">
                {l("Tu ruta", "Sua rota", "Your route")}
              </span>
              <h2>
                {l(
                  "Deja de improvisar el próximo paso",
                  "Pare de improvisar o próximo passo",
                  "Stop improvising your next step",
                )}
              </h2>
              {result.pitch.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ) : null}

          {result.closing ? (
            <section className="quiz-result__closing">
              <Icon name="heart" />
              <p>{result.closing}</p>
            </section>
          ) : null}
        </article>

        {isSafetyRoute ? (
          <aside className="quiz-safety-actions">
            <span className="section-kicker">
              {l("Tu seguridad importa", "Sua segurança importa", "Your safety matters")}
            </span>
            <h2>
              {l(
                "No necesitas resolver esta relación hoy.",
                "Você não precisa resolver esta relação hoje.",
                "You do not need to resolve this relationship today.",
              )}
            </h2>
            <p>
              {l(
                "Sal de esta pantalla y busca una persona de confianza o apoyo local. Si existe peligro inmediato, usa los servicios de emergencia de tu localidad.",
                "Saia desta tela e procure uma pessoa de confiança ou apoio local. Se houver perigo imediato, acione os serviços de emergência da sua região.",
                "Leave this screen and find someone you trust or local support. If there is immediate danger, contact your local emergency services.",
              )}
            </p>
            <button
              className="button button--primary button--full"
              onClick={onSafetyExit}
              type="button"
            >
              {result.cta}
              <Icon name="external" />
            </button>
            <button
              className="button button--ghost button--full"
              onClick={() => window.print()}
              type="button"
            >
              {l("Guardar mi resultado", "Salvar meu resultado", "Save my result")}
            </button>
          </aside>
        ) : (
          <Offer
            checkoutStatus={checkoutStatus}
            cta={result.cta}
            microcopy={result.microcopy}
            onCheckout={onCheckout}
          />
        )}
      </div>

      <footer className="quiz-result__footer">
        <p>
          {l(
            "Este diagnóstico no promete una respuesta, un regreso ni control sobre otra persona.",
            "Este diagnóstico não promete uma resposta, uma volta nem controle sobre outra pessoa.",
            "This diagnosis does not promise a reply, a reunion, or control over another person.",
          )}
        </p>
        <button className="button button--ghost" onClick={onRestart} type="button">
          {l("Rehacer el diagnóstico", "Refazer o diagnóstico", "Retake the diagnosis")}
        </button>
      </footer>
    </main>
  );
}
