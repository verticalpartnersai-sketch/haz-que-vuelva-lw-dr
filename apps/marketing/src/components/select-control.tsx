"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Icon, type IconName } from "@/components/icon";

export type SelectOption<T extends string> = {
  label: string;
  value: T;
};

type SelectControlProps<T extends string> = {
  ariaLabel: string;
  className?: string;
  leadingIcon?: IconName;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  value: T;
};

export function SelectControl<T extends string>({
  ariaLabel,
  className = "",
  leadingIcon,
  onChange,
  options,
  value,
}: SelectControlProps<T>) {
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
    const close = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
  }, [open, selectedIndex]);

  function closeAndFocusTrigger() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function handleOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const last = options.length - 1;
    const nextByKey: Partial<Record<string, number>> = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = nextByKey[event.key];
    if (next !== undefined) {
      event.preventDefault();
      optionRefs.current[next]?.focus();
    } else if (event.key === "Escape") {
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
        ref={triggerRef}
        type="button"
      >
        {leadingIcon ? <Icon name={leadingIcon} /> : null}
        <span>{selectedOption?.label}</span>
        <Icon name="arrowDown" weight="bold" />
      </button>
      {open ? (
        <span className="select-control__menu" id={listboxId} role="listbox">
          {options.map((option, index) => (
            <button
              aria-selected={option.value === value}
              className="select-control__option"
              key={option.value}
              onClick={() => {
                onChange(option.value);
                closeAndFocusTrigger();
              }}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              role="option"
              type="button"
            >
              <span>{option.label}</span>
              <Icon name="check" weight="bold" />
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}
