"use client";

import type { RefObject } from "react";

import type {
  DistanceBand,
  QuizAnswers,
  QuizOption,
  QuizRoute,
  QuizStage,
} from "@/features/quiz/quiz-contracts";
import {
  CommitmentQuestion,
  Intro,
  QuestionStep,
} from "@/features/quiz/quiz-intro-question";
import { AnalysisLoader } from "@/features/quiz/quiz-lead-loading";
import { Demonstration, Prediagnosis } from "@/features/quiz/quiz-middle";
import { quizContentFor } from "@/features/quiz/quiz-i18n";
import { Result } from "@/features/quiz/quiz-result";
import type { Locale } from "@/features/i18n/locale";

export function QuizStageRouter({
  answers,
  checkoutStatus,
  distanceBand,
  distanceIndex,
  headingRef,
  loaderTick,
  locale,
  locked,
  onAnswer,
  onCheckout,
  onCommitment,
  onRestart,
  onStage,
  onStart,
  questionIndex,
  route,
  stage,
}: {
  answers: QuizAnswers;
  checkoutStatus: string;
  distanceBand: DistanceBand;
  distanceIndex: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  loaderTick: number;
  locale: Locale;
  locked: boolean;
  onAnswer: (option: QuizOption) => void;
  onCheckout: () => void;
  onCommitment: (option: QuizOption) => void;
  onRestart: () => void;
  onStage: (stage: QuizStage) => void;
  onStart: () => void;
  questionIndex: number;
  route: QuizRoute;
  stage: QuizStage;
}) {
  const copy = quizContentFor(locale);

  if (stage === "intro") {
    return <Intro headingRef={headingRef} onStart={onStart} />;
  }

  if (stage === "question") {
    return (
      <QuestionStep
        answers={answers}
        disabled={locked}
        headingRef={headingRef}
        onAnswer={onAnswer}
        questionIndex={questionIndex}
      />
    );
  }

  if (stage === "loader-one" || stage === "loader-two") {
    const first = stage === "loader-one";
    return (
      <AnalysisLoader
        copy={first ? copy.loaderOne : copy.loaderTwo}
        headingRef={headingRef}
        mode={first ? "analysis" : "route"}
        tick={loaderTick}
      />
    );
  }

  if (stage === "prediagnosis") {
    return (
      <Prediagnosis
        answers={answers}
        band={distanceBand}
        headingRef={headingRef}
        index={distanceIndex}
        onContinue={() => onStage("desire")}
        route={route}
      />
    );
  }

  if (stage === "desire" || stage === "commitment") {
    const desire = stage === "desire";
    return (
      <CommitmentQuestion
        disabled={locked}
        headingRef={headingRef}
        kind={desire ? "desire" : "commitment"}
        onAnswer={onCommitment}
        selectedValue={desire ? answers.desire : answers.commitment}
      />
    );
  }

  if (stage === "demonstration") {
    return (
      <Demonstration
        answers={answers}
        headingRef={headingRef}
        onContinue={() => onStage("commitment")}
        route={route}
      />
    );
  }

  return (
    <Result
      answers={answers}
      band={distanceBand}
      checkoutStatus={checkoutStatus}
      headingRef={headingRef}
      index={distanceIndex}
      onCheckout={onCheckout}
      onRestart={onRestart}
      route={route}
    />
  );
}
