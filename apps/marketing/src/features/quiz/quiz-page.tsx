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
  resolveRoute,
} from "@/features/quiz/quiz-engine";
import { PublicHeader } from "@/features/quiz/quiz-intro-question";
import { QUIZ_CHECKOUT_URL } from "@/features/quiz/quiz-checkout-config";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import {
  QuizNotificationBanner,
  useQuizNotifications,
} from "@/features/quiz/quiz-notification";
import {
  useQuizLoaderProgress,
  useQuizSessionEffects,
  useQuizStagePresentation,
  useQuizViewTracking,
} from "@/features/quiz/quiz-page-effects";
import { QuizStageRouter } from "@/features/quiz/quiz-stage-router";
import {
  persistQuizState,
  track,
  utmParameters,
} from "@/features/quiz/quiz-runtime";
import { useQuizSoundscape } from "@/features/quiz/use-quiz-soundscape";

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
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const enhancedExperience = true;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const userStartedQuizRef = useRef(false);
  const {
    ambientAudioRef,
    audioMuted,
    audioNeedsGesture,
    audioStarted,
    playNotificationChime,
    restoreAudioState,
    resumeAmbientAudio,
    startSoundscape,
    toggleAmbientAudio,
  } = useQuizSoundscape(sessionHydrated);
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

  useQuizSessionEffects({
    answers,
    audioMuted,
    audioStarted,
    locale,
    questionIndex,
    restoreAudioState,
    sessionHydrated,
    setAnswers,
    setLocale,
    setQuestionIndex,
    setSessionHydrated,
    setStage,
    stage,
    userStartedQuizRef,
  });

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    },
    [],
  );

  useQuizStagePresentation({ headingRef, locale, questionIndex, stage });
  useQuizViewTracking({
    answers,
    distanceBand,
    distanceIndex,
    enhancedExperience,
    locale,
    questionIndex,
    route,
    stage,
  });
  useQuizLoaderProgress({
    enhancedExperience,
    loaderTick,
    setLoaderTick,
    setStage,
    stage,
  });
  const { active: notification } = useQuizNotifications({
      answers,
      locale,
      onSound: playNotificationChime,
      questionIndex,
      route,
      stage,
    });

  function startQuiz() {
    userStartedQuizRef.current = true;
    startSoundscape();

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
        preload="auto"
        ref={ambientAudioRef}
        src="/audio/ambient-sound.mp3?v=1"
      />
      <QuizNotificationBanner notification={notification} />
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
