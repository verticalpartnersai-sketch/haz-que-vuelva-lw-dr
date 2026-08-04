"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/features/i18n/locale";

export function AiThinkingPanel() {
  const { l } = useLocale();
  const [elapsed, setElapsed] = useState(0);

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
    </div>
  );
}
