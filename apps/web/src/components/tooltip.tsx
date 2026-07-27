"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useState,
  type FocusEvent,
  type HTMLAttributes,
  type ReactElement,
} from "react";

type TooltipProps = {
  label: string;
  children: ReactElement<HTMLAttributes<HTMLElement>>;
};

export function Tooltip({ label, children }: TooltipProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const tooltipId = useId();
  const open = (focused || hovered) && !dismissed;

  useEffect(() => {
    if (!open) return;

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }

    document.addEventListener("keydown", dismissOnEscape);
    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [open]);

  const trigger = cloneElement(children, {
    "aria-describedby": open ? tooltipId : undefined,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      setDismissed(false);
      setFocused(true);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      setFocused(false);
    },
  });

  return (
    <span
      className="tooltip-wrap"
      onClick={() => {
        setDismissed(true);
        setFocused(false);
      }}
      onMouseEnter={() => {
        setDismissed(false);
        setHovered(true);
      }}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={() => {
        setDismissed(true);
        setFocused(false);
      }}
    >
      {trigger}
      {open ? (
        <span className="tooltip" id={tooltipId} role="tooltip">
          {label}
        </span>
      ) : null}
    </span>
  );
}
