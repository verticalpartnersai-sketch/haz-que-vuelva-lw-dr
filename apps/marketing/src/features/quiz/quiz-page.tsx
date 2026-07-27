"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useLocale } from "@/features/i18n/locale";
import {
  type QuizAnswers,
  type QuizOption,
} from "@/features/quiz/quiz-data";
import {
  channelStateForRoute,
  resolveMainError,
  resolveRoute,
} from "@/features/quiz/quiz-engine";
import {
  Intro,
  PublicHeader,
  QuestionStep,
} from "@/features/quiz/quiz-intro-question";
import {
  LeadCapture,
  Loading,
} from "@/features/quiz/quiz-lead-loading";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { Result } from "@/features/quiz/quiz-result";
import {
  selectedOption,
  track,
  utmParameters,
  type Lead,
  type QuizStage,
} from "@/features/quiz/quiz-runtime";

function scrollQuizToTop() {
  window.scrollTo({ behavior: "auto", left: 0, top: 0 });
}

export function QuizPage() {
  const { l, locale } = useLocale();
  const { loadingMessages, questions, results } = quizContentFor(locale);
  const [stage, setStage] = useState<QuizStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [lead, setLead] = useState<Lead>({
    name: "",
    email: "",
    country: "mx",
    consent: false,
  });
  const [leadError, setLeadError] = useState("");
  const [loadingCompleted, setLoadingCompleted] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRoute = useMemo(() => resolveRoute(answers), [answers]);

  useEffect(() => {
    const labels: Record<QuizStage, string> = {
      intro: l("Diagnóstico", "Diagnóstico", "Diagnosis"),
      question: `${l("Pregunta", "Pergunta", "Question")} ${questionIndex + 1} ${l("de", "de", "of")} ${questions.length}`,
      lead: l(
        "Tu diagnóstico está listo",
        "Seu diagnóstico está pronto",
        "Your diagnosis is ready",
      ),
      loading: l(
        "Preparando tu resultado",
        "Preparando seu resultado",
        "Preparing your result",
      ),
      result: l("Tu resultado", "Seu resultado", "Your result"),
    };

    document.title = `${labels[stage]} · Haz Que Vuelva`;
    scrollQuizToTop();
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [l, locale, questionIndex, questions.length, stage]);

  useEffect(() => {
    if (stage === "question") {
      track("quiz_step_view", {
        step_id: questionIndex + 1,
        step_name: questions[questionIndex].id,
      });
    }
  }, [questionIndex, questions, stage]);

  useEffect(() => {
    if (stage === "result") {
      track("quiz_result_view", {
        route: resultRoute,
        channel_state: channelStateForRoute(resultRoute),
        main_error: resolveMainError(answers),
      });
    }
  }, [answers, questionIndex, resultRoute, stage]);

  useEffect(() => {
    if (stage !== "loading" || loadingCompleted >= loadingMessages.length) {
      return;
    }

    const timer = window.setTimeout(
      () => setLoadingCompleted((current) => current + 1),
      760,
    );

    return () => window.clearTimeout(timer);
  }, [loadingCompleted, loadingMessages.length, stage]);

  function startQuiz() {
    track("quiz_start", {
      ...utmParameters(),
      country_detected: "unknown",
    });
    setStage("question");
  }

  function answerQuestion(option: QuizOption) {
    const question = questions[questionIndex];
    setAnswers((current) => ({ ...current, [question.id]: option.value }));
    track("quiz_answer", {
      step_id: questionIndex + 1,
      answer_value: option.value,
      tags: option.tags.join(","),
    });

    if (option.tags.includes("red")) {
      track("quiz_safety_flag", { red_reason: option.value });
    }
  }

  function continueQuestion() {
    if (!selectedOption(questionIndex, answers)) return;

    scrollQuizToTop();

    if (questionIndex === questions.length - 1) {
      setStage("lead");
      return;
    }

    setQuestionIndex((current) => current + 1);
  }

  function backFromQuestion() {
    if (questionIndex === 0) {
      setStage("intro");
      return;
    }

    setQuestionIndex((current) => current - 1);
  }

  function beginLoading() {
    setLeadError("");
    setLoadingCompleted(0);
    setStage("loading");
  }

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!lead.email.trim()) {
      setLeadError(
        l(
          "Escribe un email o elige “Verlo sin dejar mis datos” para continuar.",
          "Informe um e-mail ou escolha “Ver sem deixar meus dados” para continuar.",
          "Enter an email or choose “See it without leaving my details” to continue.",
        ),
      );
      return;
    }

    if (!lead.consent) {
      setLeadError(
        l(
          "Confirma el permiso para recibir el resultado o continúa sin dejar tus datos.",
          "Confirme a permissão para receber o resultado ou continue sem deixar seus dados.",
          "Confirm permission to receive the result, or continue without leaving your details.",
        ),
      );
      return;
    }

    track("quiz_lead_submit", {
      country: lead.country,
      has_email: true,
    });
    beginLoading();
  }

  function checkout() {
    track("quiz_cta_click", {
      route: resultRoute,
      cta_variant: results[resultRoute].cta,
    });

    const configuredUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL;
    if (!configuredUrl) {
      setCheckoutStatus(
        l(
          "El checkout todavía no está conectado. Falta configurar NEXT_PUBLIC_CHECKOUT_URL.",
          "O checkout ainda não está conectado. Falta configurar NEXT_PUBLIC_CHECKOUT_URL.",
          "Checkout is not connected yet. NEXT_PUBLIC_CHECKOUT_URL still needs to be configured.",
        ),
      );
      return;
    }

    try {
      const destination = new URL(configuredUrl);
      destination.searchParams.set("route", resultRoute);
      destination.searchParams.set(
        "channel_state",
        channelStateForRoute(resultRoute),
      );
      destination.searchParams.set("main_error", resolveMainError(answers));
      destination.searchParams.set("country", lead.country || "unknown");

      Object.entries(utmParameters()).forEach(([key, value]) => {
        if (value) destination.searchParams.set(key, value);
      });

      track("checkout_start", { route: resultRoute, price: 7 });
      window.location.assign(destination.toString());
    } catch {
      setCheckoutStatus(
        l(
          "La URL de checkout configurada no es válida. Revisa NEXT_PUBLIC_CHECKOUT_URL.",
          "A URL de checkout configurada é inválida. Revise NEXT_PUBLIC_CHECKOUT_URL.",
          "The configured checkout URL is invalid. Check NEXT_PUBLIC_CHECKOUT_URL.",
        ),
      );
    }
  }

  function restart() {
    setAnswers({});
    setLead({
      name: "",
      email: "",
      country: "mx",
      consent: false,
    });
    setQuestionIndex(0);
    setLoadingCompleted(0);
    setCheckoutStatus("");
    setStage("intro");
  }

  function safetyExit() {
    const query = {
      es: "servicios locales de emergencia y apoyo contra la violencia",
      pt: "serviços locais de emergência e apoio contra a violência",
      en: "local emergency services and domestic violence support",
    }[locale];
    window.location.assign(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    );
  }

  return (
    <div className="quiz-public">
      <a className="skip-link" href="#quiz-content">
        {l("Saltar al diagnóstico", "Ir para o diagnóstico", "Skip to diagnosis")}
      </a>
      <PublicHeader />
      {stage === "intro" ? (
        <Intro headingRef={headingRef} onStart={startQuiz} />
      ) : null}
      {stage === "question" ? (
        <QuestionStep
          answers={answers}
          headingRef={headingRef}
          onAnswer={answerQuestion}
          onBack={backFromQuestion}
          onContinue={continueQuestion}
          questionIndex={questionIndex}
        />
      ) : null}
      {stage === "lead" ? (
        <LeadCapture
          error={leadError}
          headingRef={headingRef}
          lead={lead}
          onBack={() => {
            setQuestionIndex(questions.length - 1);
            setStage("question");
          }}
          onChange={setLead}
          onSkip={beginLoading}
          onSubmit={submitLead}
        />
      ) : null}
      {stage === "loading" ? (
        <Loading
          completed={loadingCompleted}
          headingRef={headingRef}
          onReveal={() => setStage("result")}
        />
      ) : null}
      {stage === "result" ? (
        <Result
          answers={answers}
          checkoutStatus={checkoutStatus}
          headingRef={headingRef}
          lead={lead}
          onCheckout={checkout}
          onRestart={restart}
          onSafetyExit={safetyExit}
          route={resultRoute}
        />
      ) : null}
    </div>
  );
}
