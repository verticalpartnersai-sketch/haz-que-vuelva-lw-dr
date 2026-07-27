"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import type { IconName } from "@/components/icon";
import { Icon } from "@/components/icon";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

export function SelectControl<T extends string>({
  ariaLabel,
  className = "",
  leadingIcon,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  className?: string;
  leadingIcon?: IconName;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  value: T;
}) {
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;

    function closeFromOutside(event: PointerEvent) {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeFromOutside);
    return () => document.removeEventListener("pointerdown", closeFromOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
  }, [open, selectedIndex]);

  function closeAndFocusTrigger() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function choose(option: SelectOption<T>) {
    onChange(option.value);
    closeAndFocusTrigger();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const lastIndex = options.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowDown") nextIndex = index === lastIndex ? 0 : index + 1;
    if (event.key === "ArrowUp") nextIndex = index === 0 ? lastIndex : index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;

    if (nextIndex !== null) {
      event.preventDefault();
      optionRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
    }
  }

  return (
    <span
      className={`select-control ${open ? "select-control--open" : ""} ${className}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      ref={controlRef}
    >
      <button
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="select-control__trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        {leadingIcon ? (
          <Icon className="select-control__leading" name={leadingIcon} />
        ) : null}
        <span className="select-control__value">{selectedOption?.label}</span>
        <Icon className="select-control__caret" name="arrowDown" weight="bold" />
      </button>
      {open ? (
        <span
          aria-label={ariaLabel}
          className="select-control__menu"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => {
            const selected = option.value === value;

            return (
              <button
                aria-selected={selected}
                className="select-control__option"
                key={option.value}
                onClick={() => choose(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                <Icon
                  className="select-control__check"
                  name="check"
                  weight="bold"
                />
              </button>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}
