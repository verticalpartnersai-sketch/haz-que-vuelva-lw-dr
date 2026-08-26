"use client";

import Image from "next/image";
import type { RefObject } from "react";

import type {
  QuizFlowCopy,
  QuizFlowOption,
  QuizFlowScreen,
} from "./quiz-flow-contracts";
import { QuizFlowOptionGrid } from "./quiz-flow-option-grid";
import { QuizFlowProof } from "./quiz-flow-proof";
import { QuizFlowResult } from "./quiz-flow-result";

export function QuizFlowStage({
  copy,
  headingRef,
  locked,
  onContinue,
  onOption,
  screen,
  score,
  selected,
}: {
  copy: QuizFlowCopy;
  headingRef: RefObject<HTMLHeadingElement | null>;
  locked: boolean;
  onContinue: () => void;
  onOption: (option: QuizFlowOption) => void;
  screen: QuizFlowScreen;
  score: number;
  selected: readonly string[];
}) {
  if (screen.type === "result") {
    return <QuizFlowResult copy={copy} onContinue={onContinue} score={score} />;
  }

  const isLoader = screen.type === "loader";
  return (
    <main
      className={`quiz-v2-stage quiz-v2-stage--${screen.type}`}
      id="quiz-content"
    >
      {screen.asset ? (
        <div className="quiz-v2-stage__media">
          <Image
            alt=""
            fill
            priority={screen.id === "urgency_interstitial" || screen.id === "expert_intro"}
            sizes="(max-width: 640px) calc(100vw - 40px), 620px"
            src={screen.asset}
          />
        </div>
      ) : null}
      <h1 ref={headingRef} tabIndex={-1}>{screen.title}</h1>
      {screen.subtitle ? <p className="quiz-v2-stage__subtitle">{screen.subtitle}</p> : null}
      {screen.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

      {isLoader ? (
        <div className="quiz-v2-loader" role="status">
          <span className="quiz-v2-loader__line"><i /></span>
          <ul>{screen.body?.map((state) => <li key={state}>{state}</li>)}</ul>
        </div>
      ) : null}

      {screen.type === "proof" ? <QuizFlowProof copy={copy} /> : null}

      {screen.options ? (
        <QuizFlowOptionGrid
          disabled={locked}
          multiple={Boolean(screen.multiple)}
          onSelect={onOption}
          options={screen.options}
          selected={selected}
        />
      ) : null}

      {screen.instruction ? <small className="quiz-v2-stage__instruction">{screen.instruction}</small> : null}

      {screen.button ? (
        <button
          className="quiz-v2-primary"
          disabled={locked || (screen.multiple && selected.length === 0)}
          onClick={onContinue}
          type="button"
        >
          {screen.button}
        </button>
      ) : null}
    </main>
  );
}
