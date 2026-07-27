"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export function AiThinkingPanel() {
  const { l } = useLocale();
  const [elapsed, setElapsed] = useState(0);
  const steps = [
    l(
      "Comprendiendo tu contexto",
      "Entendendo o seu contexto",
      "Understanding your context",
    ),
    l(
      "Organizando las ideas principales",
      "Organizando as ideias principais",
      "Organizing the main ideas",
    ),
    l(
      "Preparando una respuesta clara",
      "Preparando uma resposta clara",
      "Preparing a clear response",
    ),
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      aria-label={l(
        "La IA está preparando una respuesta",
        "A IA está preparando uma resposta",
        "The AI is preparing a response",
      )}
      aria-live="polite"
      className="oracle-thinking"
      role="status"
    >
      <div className="oracle-thinking__header">
        <span aria-hidden="true" className="oracle-thinking__spinner" />
        <strong>{l("Pensando", "Pensando", "Thinking")}</strong>
        <span>{elapsed}s</span>
      </div>
      <div className="oracle-thinking__process">
        {steps.map((step, index) => (
          <span className={index === 2 ? "is-active" : "is-complete"} key={step}>
            <i aria-hidden="true">
              {index === 2 ? <span /> : <Icon name="check" weight="bold" />}
            </i>
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
