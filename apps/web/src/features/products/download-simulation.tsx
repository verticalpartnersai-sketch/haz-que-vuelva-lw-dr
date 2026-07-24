"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";

export function DownloadSimulation() {
  const [status, setStatus] = useState("");

  return (
    <>
      <button
        className="button button--secondary"
        onClick={() =>
          setStatus("Descarga simulada. No existe un archivo real en este prototipo.")
        }
        type="button"
      >
        <Icon name="download" />
        Descargar PDF
      </button>
      <span aria-live="polite" className="download-status">
        {status}
      </span>
    </>
  );
}
