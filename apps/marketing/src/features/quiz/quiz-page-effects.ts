"use client";

import { useEffect, useRef } from "react";
import type {
  Dispatch,
  RefObject,
  SetStateAction,
} from "react";

import type { Locale } from "@/features/i18n/locale";
import type {
  DistanceBand,
  QuizAnswers,
  QuizRoute,
  QuizStage,
} from "@/features/quiz/quiz-contracts";
import {
  isReconquista30Eligible,
  resolvedLastAction,
  routeSoFar,
} from "@/features/quiz/quiz-engine";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import {
  persistQuizSessionState,
  restoreQuizSessionState,
  track,
} from "@/features/quiz/quiz-runtime";

const titles: Record<Locale, Record<QuizStage, string>> = {
  en: {
    commitment: "Your commitment",
    demonstration: "How the route changes",
    desire: "Your goal",
    intro: "Private diagnosis",
    "loader-one": "Analyzing the connection",
    "loader-two": "Creating your route",
    prediagnosis: "Initial analysis",
    question: "Your situation",
    result: "Your diagnosis",
  },
  es: {
    commitment: "Tu compromiso",
    demonstration: "Cómo cambia la ruta",
    desire: "Tu objetivo",
    intro: "Diagnóstico privado",
    "loader-one": "Analizando la conexión",
    "loader-two": "Creando tu ruta",
    prediagnosis: "Análisis inicial",
    question: "Tu situación",
    result: "Tu diagnóstico",
  },
  pt: {
    commitment: "Seu compromisso",
    demonstration: "Como a rota muda",
    desire: "Seu objetivo",
    intro: "Diagnóstico privado",
    "loader-one": "Analisando a conexão",
    "loader-two": "Criando sua rota",
    prediagnosis: "Análise inicial",
    question: "Sua situação",
    result: "Seu diagnóstico",
  },
};

export function useQuizSessionEffects({
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
}: {
  answers: QuizAnswers;
  audioMuted: boolean;
  audioStarted: boolean;
  locale: Locale;
  questionIndex: number;
  restoreAudioState: (started: boolean, muted: boolean) => void;
  sessionHydrated: boolean;
  setAnswers: Dispatch<SetStateAction<QuizAnswers>>;
  setLocale: (locale: Locale) => void;
  setQuestionIndex: Dispatch<SetStateAction<number>>;
  setSessionHydrated: Dispatch<SetStateAction<boolean>>;
  setStage: Dispatch<SetStateAction<QuizStage>>;
  stage: QuizStage;
  userStartedQuizRef: RefObject<boolean>;
}) {
  const hydrationStartedRef = useRef(false);

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
        restoreAudioState(
          restored.audioStarted ?? false,
          restored.audioMuted ?? true,
        );
      }
      setSessionHydrated(true);
    });

    return () => window.cancelAnimationFrame(hydrationFrame);
  }, [
    locale,
    restoreAudioState,
    setAnswers,
    setLocale,
    setQuestionIndex,
    setSessionHydrated,
    setStage,
    userStartedQuizRef,
  ]);

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
}

export function useQuizStagePresentation({
  headingRef,
  locale,
  questionIndex,
  stage,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  locale: Locale;
  questionIndex: number;
  stage: QuizStage;
}) {
  useEffect(() => {
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
    document.documentElement.scrollTop = 0;
    window.requestAnimationFrame(() => headingRef.current?.focus());
    document.title = `${titles[locale][stage]} · Haz Que Vuelva`;
  }, [headingRef, locale, questionIndex, stage]);
}

export function useQuizViewTracking({
  answers,
  distanceBand,
  distanceIndex,
  enhancedExperience,
  locale,
  questionIndex,
  route,
  stage,
}: {
  answers: QuizAnswers;
  distanceBand: DistanceBand;
  distanceIndex: number;
  enhancedExperience: boolean;
  locale: Locale;
  questionIndex: number;
  route: QuizRoute;
  stage: QuizStage;
}) {
  const trackedViewRef = useRef("");
  const copy = quizContentFor(locale);

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
      track("quiz_proof_view", { proof_variant: route, route });
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
}

export function useQuizLoaderProgress({
  enhancedExperience,
  loaderTick,
  setStage,
  setLoaderTick,
  stage,
}: {
  enhancedExperience: boolean;
  loaderTick: number;
  setLoaderTick: Dispatch<SetStateAction<number>>;
  setStage: Dispatch<SetStateAction<QuizStage>>;
  stage: QuizStage;
}) {
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

    const reveal = window.setTimeout(
      () => setStage(stage === "loader-one" ? "prediagnosis" : "result"),
      220,
    );
    return () => window.clearTimeout(reveal);
  }, [enhancedExperience, loaderTick, setLoaderTick, setStage, stage]);
}
