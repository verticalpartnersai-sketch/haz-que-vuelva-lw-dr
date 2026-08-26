"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { FunnelLocale } from "@/features/i18n/funnel-locale";
import { QuizLogo } from "@/features/quiz/quiz-intro-question";
import type {
  QuizFlowAnswers,
  QuizFlowOption,
} from "./quiz-flow-contracts";
import { quizFlowCopyFor } from "./quiz-flow-copy";
import {
  buildOfferHandoffPath,
  nextStageIndex,
  toggleMultipleAnswer,
} from "./quiz-flow-engine";
import { QuizFlowStage } from "./quiz-flow-stage";
import {
  probabilityBand,
  reconquestProbability,
} from "./quiz-flow-score";
import { writeQuizSession } from "./quiz-flow-runtime";
import { track, utmParameters } from "./quiz-runtime";

function scrollToQuizTop() {
  window.scrollTo({ behavior: "auto", left: 0, top: 0 });
}

export function QuizFlowPage({
  development,
  locale,
}: {
  development: boolean;
  locale: FunnelLocale;
}) {
  const copy = quizFlowCopyFor(locale);
  const router = useRouter();
  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizFlowAnswers>({});
  const [locked, setLocked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimerRef = useRef<number | null>(null);
  const resultTrackedRef = useRef(false);
  const screen = copy.screens[stageIndex];
  const score = useMemo(() => reconquestProbability(answers), [answers]);

  const answerForScreen = answers[screen.id as keyof QuizFlowAnswers];
  const selected = Array.isArray(answerForScreen)
    ? answerForScreen as string[]
    : typeof answerForScreen === "string"
      ? [answerForScreen]
      : [];

  useEffect(() => {
    track("quiz_start", { ...utmParameters(), quiz_version: "hqv_quiz_v2" });
  }, []);

  useEffect(() => {
    scrollToQuizTop();
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    track("quiz_step_view", {
      quiz_version: "hqv_quiz_v2",
      step_id: screen.id,
      step_number: stageIndex + 1,
    });
  }, [screen.id, stageIndex]);

  useEffect(() => {
    if (screen.id !== "analysis_loader" && screen.id !== "plan_loader") return;
    const delay = screen.id === "analysis_loader" ? 3800 : 5000;
    const timer = window.setTimeout(() => {
      setStageIndex((index) => nextStageIndex(index));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [screen.id]);

  useEffect(() => {
    if (screen.id !== "final_result" || resultTrackedRef.current) return;
    resultTrackedRef.current = true;
    track("quiz_complete", {
      quiz_version: "hqv_quiz_v2",
      score,
      score_band: probabilityBand(score),
    });
  }, [score, screen.id]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  function advance(delay = 0) {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    if (delay === 0) {
      setStageIndex((index) => nextStageIndex(index));
      setLocked(false);
      return;
    }
    advanceTimerRef.current = window.setTimeout(() => {
      setStageIndex((index) => nextStageIndex(index));
      setLocked(false);
      advanceTimerRef.current = null;
    }, delay);
  }

  function updateAnswer(value: string | string[]) {
    setAnswers((current) => ({
      ...current,
      [screen.id]: value,
    }) as QuizFlowAnswers);
  }

  function answerOption(option: QuizFlowOption) {
    if (locked) return;
    if (screen.multiple) {
      updateAnswer(toggleMultipleAnswer(selected, option.value));
      return;
    }

    updateAnswer(option.value);
    track("quiz_answer", {
      answer_id: option.value,
      question_id: screen.id,
      quiz_version: "hqv_quiz_v2",
    });
    setLocked(true);
    advance(300);
  }

  function continueStage() {
    if (screen.id === "final_result") {
      finishQuiz();
      return;
    }
    if (screen.multiple) {
      track("quiz_answer", {
        answer_count: selected.length,
        question_id: screen.id,
        quiz_version: "hqv_quiz_v2",
      });
    }
    advance();
  }

  function finishQuiz() {
    const scoreBand = probabilityBand(score);
    try {
      writeQuizSession(window.sessionStorage, {
        completedAt: new Date().toISOString(),
        score,
        scoreBand,
        version: "hqv_quiz_v2",
      });
    } catch {
      // The offer has a deterministic fallback for unavailable session storage.
    }
    track("result_cta_click", {
      destination: "/off",
      quiz_version: "hqv_quiz_v2",
      score_band: scoreBand,
    });
    router.push(buildOfferHandoffPath(utmParameters()));
  }

  const progress = stageIndex === 0 ? 0 : Math.round((stageIndex / (copy.screens.length - 1)) * 100);

  return (
    <div className="quiz-v2-public">
      <a className="skip-link" href="#quiz-content">{locale === "pt" ? "Ir para o quiz" : "Ir al quiz"}</a>
      {stageIndex > 0 && stageIndex < copy.screens.length - 1 ? (
        <div
          aria-label={locale === "pt" ? "Progresso do quiz" : "Progreso del quiz"}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="quiz-v2-progress"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <header className="quiz-v2-header">
        <QuizLogo compact />
        {development && stageIndex > 0 ? (
          <button
            className="quiz-v2-back"
            onClick={() => setStageIndex((index) => Math.max(0, index - 1))}
            type="button"
          >
            ← {copy.ui.back.toUpperCase()}
          </button>
        ) : null}
      </header>
      <QuizFlowStage
        copy={copy}
        headingRef={headingRef}
        locked={locked}
        onContinue={continueStage}
        onOption={answerOption}
        screen={screen}
        score={score}
        selected={selected}
      />
    </div>
  );
}
