"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ReadingProgressControl({
  initialProgress,
  productCode,
}: {
  initialProgress: number;
  productCode: string;
}) {
  const { l } = useLocale();
  const [draft, setDraft] = useState(initialProgress);
  const [saved, setSaved] = useState(initialProgress);
  const [state, setState] = useState<SaveState>("idle");

  async function persistProgress() {
    setState("saving");
    try {
      const response = await fetch(`/api/products/${productCode}/progress`, {
        body: JSON.stringify({ progressPercent: draft }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      if (!response.ok) throw new Error("reading_progress_save_failed");
      const body = (await response.json()) as { progressPercent?: unknown };
      if (body.progressPercent !== draft) {
        throw new Error("reading_progress_response_invalid");
      }
      setSaved(draft);
      setState("saved");
    } catch {
      setState("error");
    }
  }

  const changed = draft !== saved;

  return (
    <section
      aria-labelledby="reading-progress-title"
      className="reading-progress-control surface-card"
    >
      <div className="reading-progress-control__copy">
        <span className="section-kicker">
          {l("Tu avance", "Seu avanço", "Your progress")}
        </span>
        <h2 id="reading-progress-title">
          {l(
            "¿Cuánto has leído?",
            "Quanto você já leu?",
            "How much have you read?",
          )}
        </h2>
        <p>
          {l(
            "Actualiza este valor cuando termines una parte. Lo guardaremos para que puedas retomar desde el catálogo.",
            "Atualize este valor ao terminar uma parte. Vamos salvá-lo para você retomar pelo catálogo.",
            "Update this value when you finish a section. We will save it so you can resume from the catalog.",
          )}
        </p>
      </div>
      <div className="reading-progress-control__input">
        <output htmlFor="reading-progress-range">{draft}%</output>
        <input
          aria-label={l(
            "Porcentaje de lectura",
            "Percentual de leitura",
            "Reading percentage",
          )}
          id="reading-progress-range"
          max={100}
          min={0}
          onChange={(event) => {
            setDraft(Number(event.currentTarget.value));
            setState("idle");
          }}
          step={5}
          type="range"
          value={draft}
        />
        <div aria-hidden="true" className="reading-progress-control__scale">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="reading-progress-control__actions">
        <button
          className="button button--primary"
          disabled={!changed || state === "saving"}
          onClick={persistProgress}
          type="button"
        >
          <Icon name={state === "saved" ? "check" : "book"} />
          {state === "saving"
            ? l("Guardando…", "Salvando…", "Saving…")
            : state === "saved" && !changed
              ? l("Progreso guardado", "Progresso salvo", "Progress saved")
              : l("Guardar progreso", "Salvar progresso", "Save progress")}
        </button>
        <span
          aria-live="polite"
          className={state === "error" ? "download-status--error" : ""}
        >
          {state === "error"
            ? l(
                "No pudimos guardar. Inténtalo de nuevo.",
                "Não foi possível salvar. Tente novamente.",
                "We could not save. Try again.",
              )
            : ""}
        </span>
      </div>
    </section>
  );
}
