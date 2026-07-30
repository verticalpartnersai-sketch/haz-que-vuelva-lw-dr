"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLocale } from "@/features/i18n/locale";
import type {
  DesireCommitment,
  ExecutionCommitment,
  QuizAnswers,
  QuizOption,
  QuizStage,
} from "@/features/quiz/quiz-contracts";
import {
  calculateDistanceIndex,
  channelStateForRoute,
  distanceBandFor,
  isReconquista30Eligible,
  resolveRoute,
  resolvedLastAction,
  routeSoFar,
} from "@/features/quiz/quiz-engine";
import { PublicHeader } from "@/features/quiz/quiz-intro-question";
import { QUIZ_CHECKOUT_URL } from "@/features/quiz/quiz-checkout-config";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { QuizStageRouter } from "@/features/quiz/quiz-stage-router";
import {
  persistQuizState,
  persistQuizSessionState,
  restoreQuizSessionState,
  track,
  utmParameters,
} from "@/features/quiz/quiz-runtime";

function scrollQuizToTop() {
  window.scrollTo({ behavior: "auto", left: 0, top: 0 });
  document.documentElement.scrollTop = 0;
}

function progressForStage(
  stage: QuizStage,
  questionIndex: number,
  questionCount: number,
  loaderTick: number,
  enhancedExperience: boolean,
) {
  if (stage === "intro") return 0;
  if (stage === "question") {
    const lastQuestionIndex = Math.max(1, questionCount - 1);
    return 8 + (questionIndex / lastQuestionIndex) * 36;
  }
  if (stage === "loader-one") return 48 + (loaderTick / 4) * 10;
  if (stage === "prediagnosis") return 60;
  if (stage === "desire") return 68;
  if (stage === "demonstration") return 76;
  if (stage === "commitment") return 84;
  if (stage === "loader-two" && enhancedExperience) return 96;
  if (stage === "loader-two") return 88 + (loaderTick / 4) * 10;
  return 100;
}

export function QuizPage() {
  const { l, locale, setLocale } = useLocale();
  const copy = quizContentFor(locale);
  const [stage, setStage] = useState<QuizStage>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [locked, setLocked] = useState(false);
  const [loaderTick, setLoaderTick] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [audioNeedsGesture, setAudioNeedsGesture] = useState(false);
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const enhancedExperience = true;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ambientAudioRef = useRef<HTMLAudioElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const hydrationStartedRef = useRef(false);
  const trackedViewRef = useRef("");
  const userStartedQuizRef = useRef(false);
  const route = useMemo(() => resolveRoute(answers), [answers]);
  const distanceIndex = useMemo(
    () => calculateDistanceIndex(answers),
    [answers],
  );
  const distanceBand = distanceBandFor(distanceIndex);
  const progress = progressForStage(
    stage,
    questionIndex,
    copy.questions.length,
    loaderTick,
    enhancedExperience,
  );
  const progressIsLive =
    stage === "loader-one" || (stage === "loader-two" && !enhancedExperience);

  useEffect(() => {
    const hydrationFrame = window.requestAnimationFrame(() => {
      if (hydrationStartedRef.current) return;
      hydrationStartedRef.current = true;

      const restored = restoreQuizSessionState();
      if (restored && !userStartedQuizRef.current) {
        const restoredLocale = restored.locale ?? locale;
        const questionCount = quizContentFor(restoredLocale).questions.length;
        const restoredStage =
          restored.stage === "loader-one"
            ? "prediagnosis"
            : restored.stage === "loader-two"
              ? "result"
              : restored.stage;

        setAnswers(restored.answers);
        setQuestionIndex(
          Math.min(
            Math.max(0, restored.questionIndex ?? 0),
            Math.max(0, questionCount - 1),
          ),
        );
        if (restoredStage) setStage(restoredStage);
        if (restored.locale) setLocale(restored.locale);
        setAudioStarted(restored.audioStarted ?? false);
        setAudioMuted(restored.audioMuted ?? true);
      }
      setSessionHydrated(true);
    });

    return () => window.cancelAnimationFrame(hydrationFrame);
  }, [locale, setLocale]);

  useEffect(() => {
    if (!sessionHydrated) return;
    persistQuizSessionState({
      answers,
      audioMuted,
      audioStarted,
      locale,
      questionIndex,
      stage,
    });
  }, [
    answers,
    audioMuted,
    audioStarted,
    locale,
    questionIndex,
    sessionHydrated,
    stage,
  ]);

  useEffect(() => {
    if (!sessionHydrated) return;
    const ambientAudio = ambientAudioRef.current;
    if (!ambientAudio) return;

    ambientAudio.loop = true;
    ambientAudio.volume = 1;
    ambientAudio.muted = audioMuted;

    if (!audioStarted || audioMuted) {
      ambientAudio.pause();
      return;
    }

    void ambientAudio
      .play()
      .then(() => setAudioNeedsGesture(false))
      .catch(() => setAudioNeedsGesture(true));
  }, [audioMuted, audioStarted, sessionHydrated]);

  useEffect(() => {
    scrollQuizToTop();
    window.requestAnimationFrame(() => headingRef.current?.focus());

    const titles: Record<QuizStage, string> = {
      intro: l("Diagnóstico privado", "Diagnóstico privado", "Private diagnosis"),
      question: l("Tu situación", "Sua situação", "Your situation"),
      "loader-one": l(
        "Analizando la conexión",
        "Analisando a conexão",
        "Analyzing the connection",
      ),
      prediagnosis: l("Análisis inicial", "Análise inicial", "Initial analysis"),
      desire: l("Tu objetivo", "Seu objetivo", "Your goal"),
      demonstration: l("Cómo cambia la ruta", "Como a rota muda", "How the route changes"),
      commitment: l("Tu compromiso", "Seu compromisso", "Your commitment"),
      "loader-two": l("Creando tu ruta", "Criando sua rota", "Creating your route"),
      result: l("Tu diagnóstico", "Seu diagnóstico", "Your diagnosis"),
    };
    document.title = `${titles[stage]} · Haz Que Vuelva`;
  }, [l, locale, questionIndex, stage]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
      const ambientAudio = ambientAudioRef.current;
      if (ambientAudio) {
        ambientAudio.pause();
      }
    },
    [],
  );

  useEffect(() => {
    const viewKey = `${stage}:${questionIndex}`;
    if (trackedViewRef.current === viewKey) return;
    trackedViewRef.current = viewKey;

    if (stage === "question") {
      track("quiz_step_view", {
        question_id: copy.questions[questionIndex].id,
        route_so_far: routeSoFar(answers),
        step_id: `question_${questionIndex + 1}`,
        step_number: questionIndex + 1,
      });
    }
    if (stage === "loader-one" || stage === "loader-two") {
      track("quiz_loader_view", {
        duration: stage === "loader-two" && enhancedExperience ? 900 : 6000,
        loader_id: stage,
      });
    }
    if (stage === "prediagnosis") {
      track("quiz_prediagnosis_view", {
        distance_band: distanceBand,
        distance_index: distanceIndex,
        main_error: resolvedLastAction(answers),
        route,
      });
    }
    if (stage === "demonstration") {
      track("quiz_proof_view", {
        proof_variant: route,
        route,
      });
    }
    if (stage === "result") {
      track("quiz_result_view", {
        distance_band: distanceBand,
        distance_index: distanceIndex,
        first_action: copy.routes[route].firstAction,
        reconquista30_eligible: isReconquista30Eligible(answers),
        route,
      });
    }
  }, [
    answers,
    copy.questions,
    copy.routes,
    distanceBand,
    distanceIndex,
    enhancedExperience,
    questionIndex,
    route,
    stage,
  ]);

  useEffect(() => {
    if (stage !== "loader-one" && stage !== "loader-two") return;

    if (stage === "loader-two" && enhancedExperience) {
      const reveal = window.setTimeout(() => setStage("result"), 900);
      return () => window.clearTimeout(reveal);
    }

    if (loaderTick < 4) {
      const timer = window.setTimeout(
        () => setLoaderTick((tick) => tick + 1),
        1500,
      );
      return () => window.clearTimeout(timer);
    }

    const reveal = window.setTimeout(() => {
      if (stage === "loader-one") {
        setStage("prediagnosis");
      } else {
        setStage("result");
      }
    }, 220);

    return () => window.clearTimeout(reveal);
  }, [enhancedExperience, loaderTick, route, stage]);

  function playAmbientAudio(restart = false) {
    const ambientAudio = ambientAudioRef.current;
    if (!ambientAudio) return;
    if (restart) ambientAudio.currentTime = 0;
    ambientAudio.loop = true;
    ambientAudio.muted = false;
    ambientAudio.volume = 1;
    void ambientAudio
      .play()
      .then(() => setAudioNeedsGesture(false))
      .catch(() => setAudioNeedsGesture(true));
  }

  function startQuiz() {
    userStartedQuizRef.current = true;
    setAudioStarted(true);
    setAudioMuted(false);
    setAudioNeedsGesture(false);
    playAmbientAudio(true);

    track("quiz_start", utmParameters());
    scrollQuizToTop();
    setQuestionIndex(0);
    setStage("question");
  }

  function queueAdvance(action: () => void, delay = 520) {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
    }
    advanceTimerRef.current = window.setTimeout(() => {
      scrollQuizToTop();
      action();
      setLocked(false);
      advanceTimerRef.current = null;
    }, delay);
  }

  function changeStage(nextStage: QuizStage) {
    scrollQuizToTop();
    setStage(nextStage);
  }

  function toggleAmbientAudio() {
    const ambientAudio = ambientAudioRef.current;
    if (!audioStarted || audioMuted) {
      setAudioStarted(true);
      setAudioMuted(false);
      playAmbientAudio();
      return;
    }

    ambientAudio?.pause();
    setAudioMuted(true);
    setAudioNeedsGesture(false);
  }

  function resumeAmbientAudio() {
    if (!audioNeedsGesture || audioMuted || !audioStarted) return;
    playAmbientAudio();
  }

  function goBackInDevelopment() {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setLocked(false);
    setLoaderTick(0);
    scrollQuizToTop();

    if (stage === "question") {
      if (questionIndex > 0) {
        setQuestionIndex((index) => index - 1);
      } else {
        setStage("intro");
      }
      return;
    }

    const previousStage: Partial<Record<QuizStage, QuizStage>> = {
      "loader-one": "question",
      prediagnosis: "question",
      desire: "prediagnosis",
      demonstration: "desire",
      commitment: "demonstration",
      "loader-two": "commitment",
      result: "commitment",
    };
    const nextStage = previousStage[stage];
    if (!nextStage) return;
    if (nextStage === "question") {
      setQuestionIndex(copy.questions.length - 1);
    }
    setStage(nextStage);
  }

  function answerQuestion(option: QuizOption) {
    if (locked) return;

    const question = copy.questions[questionIndex];
    const nextAnswers = {
      ...answers,
      [question.id]: option.value,
    } as QuizAnswers;
    setAnswers(nextAnswers);
    persistQuizState(nextAnswers);
    setLocked(true);
    track("quiz_answer", {
      answer_id: option.value,
      answer_value: option.value,
      question_id: question.id,
      step_id: `question_${questionIndex + 1}`,
    });

    queueAdvance(() => {
      if (questionIndex === copy.questions.length - 1) {
        setLoaderTick(0);
        setStage("loader-one");
      } else {
        setQuestionIndex((index) => index + 1);
      }
    });
  }

  function answerCommitment(option: QuizOption) {
    if (locked) return;

    const isDesire = stage === "desire";
    const nextAnswers: QuizAnswers = isDesire
      ? { ...answers, desire: option.value as DesireCommitment }
      : { ...answers, commitment: option.value as ExecutionCommitment };
    setAnswers(nextAnswers);
    persistQuizState(nextAnswers);
    setLocked(true);
    track("quiz_microcommitment", {
      answer_value: option.value,
      question_id: isDesire ? "desire" : "commitment",
    });

    queueAdvance(() => {
      if (isDesire) {
        setStage("demonstration");
      } else {
        setLoaderTick(0);
        setStage("loader-two");
      }
    }, 420);
  }

  function checkout(ctaPosition = "unknown") {
    track("quiz_cta_click", {
      cta_id: "haz_que_vuelva_front",
      cta_position: ctaPosition,
      destination: "checkout",
      route,
    });

    try {
      const destination = new URL(QUIZ_CHECKOUT_URL);
      const checkoutContext = {
        route,
        channel_state: channelStateForRoute(route),
        distance_band: distanceBand,
        cta_position: ctaPosition,
      };
      Object.entries({ ...checkoutContext, ...utmParameters() }).forEach(
        ([key, value]) => {
          if (value) destination.searchParams.set(key, String(value));
        },
      );
      track("checkout_start", {
        cta_position: ctaPosition,
        price: 7,
        route,
      });
      const checkoutWindow = window.open(
        destination.toString(),
        "_blank",
        "noopener,noreferrer",
      );
      if (checkoutWindow) checkoutWindow.opener = null;
    } catch {
      setCheckoutStatus(
        l(
          "La URL de checkout configurada no es válida.",
          "A URL de checkout configurada é inválida.",
          "The configured checkout URL is invalid.",
        ),
      );
    }
  }

  return (
    <div className="quiz-public" onPointerDown={resumeAmbientAudio}>
      <audio
        aria-hidden="true"
        loop
        preload="metadata"
        ref={ambientAudioRef}
        src="/audio/ambient-sound.mp3?v=1"
      />
      <a className="skip-link" href="#quiz-content">
        {l("Ir al diagnóstico", "Ir para o diagnóstico", "Skip to diagnosis")}
      </a>
      {process.env.NODE_ENV === "development" ? (
        <span className="quiz-preview-badge">{copy.preview.internalLabel}</span>
      ) : null}
      {stage !== "intro" &&
      stage !== "prediagnosis" &&
      stage !== "demonstration" &&
      stage !== "result" ? (
        <div
          aria-label={l(
            "Progreso del diagnóstico",
            "Progresso do diagnóstico",
            "Diagnosis progress",
          )}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={Math.round(progress)}
          className={
            progressIsLive
              ? "quiz-global-progress is-live"
              : "quiz-global-progress"
          }
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <PublicHeader
        audioMuted={audioMuted}
        audioNeedsGesture={audioNeedsGesture}
        audioStarted={audioStarted}
        onToggleAudio={toggleAmbientAudio}
      />
      {process.env.NODE_ENV === "development" && stage !== "intro" ? (
        <button
          className="quiz-dev-back"
          onClick={goBackInDevelopment}
          type="button"
        >
          <span aria-hidden="true">←</span>
          {l("VOLVER", "VOLTAR", "BACK")}
        </button>
      ) : null}
      <QuizStageRouter
        answers={answers}
        checkoutStatus={checkoutStatus}
        distanceBand={distanceBand}
        distanceIndex={distanceIndex}
        headingRef={headingRef}
        loaderTick={loaderTick}
        enhancedExperience={enhancedExperience}
        locale={locale}
        locked={locked}
        onAnswer={answerQuestion}
        onCheckout={checkout}
        onCommitment={answerCommitment}
        onStage={changeStage}
        onStart={startQuiz}
        questionIndex={questionIndex}
        route={route}
        stage={stage}
      />
    </div>
  );
}
