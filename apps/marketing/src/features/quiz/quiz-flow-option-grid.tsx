"use client";

import type { QuizFlowOption } from "./quiz-flow-contracts";

export function QuizFlowOptionGrid({
  disabled,
  multiple,
  onSelect,
  options,
  selected,
}: {
  disabled: boolean;
  multiple: boolean;
  onSelect: (option: QuizFlowOption) => void;
  options: readonly QuizFlowOption[];
  selected: readonly string[];
}) {
  const compact = options.length <= 4;
  const single = options.length === 1;
  return (
    <div
      className={`quiz-v2-options${compact ? " quiz-v2-options--compact" : ""}${single ? " quiz-v2-options--single" : ""}`}
      role={multiple ? "group" : "radiogroup"}
    >
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            aria-checked={multiple ? undefined : active}
            aria-pressed={multiple ? active : undefined}
            className={`quiz-v2-option${active ? " is-selected" : ""}`}
            disabled={disabled}
            key={option.value}
            onClick={() => onSelect(option)}
            role={multiple ? undefined : "radio"}
            type="button"
          >
            {option.emoji ? (
              <span aria-hidden="true" className="quiz-v2-option__emoji">
                {option.emoji}
              </span>
            ) : null}
            <span>{option.label}</span>
            {multiple ? (
              <i aria-hidden="true" className="quiz-v2-option__check">
                {active ? "✓" : ""}
              </i>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
