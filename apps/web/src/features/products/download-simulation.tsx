"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export function DownloadSimulation() {
  const { l } = useLocale();
  const [status, setStatus] = useState("");

  return (
    <>
      <button
        className="button button--secondary"
        onClick={() =>
          setStatus(
            l(
              "Descarga simulada. No existe un archivo real en este prototipo.",
              "Download simulado. Não existe um arquivo real neste protótipo.",
              "Simulated download. No real file exists in this prototype.",
            ),
          )
        }
        type="button"
      >
        <Icon name="download" />
        {l("Descargar PDF", "Baixar PDF", "Download PDF")}
      </button>
      <span aria-live="polite" className="download-status">
        {status}
      </span>
    </>
  );
}
