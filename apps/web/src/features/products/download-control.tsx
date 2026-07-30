"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

type AccessResponse = {
  code?: string;
  expiresIn?: number;
  retryAfterSeconds?: number;
  signedUrl?: string;
};

type DownloadState = "idle" | "preparing" | "error";

const MAX_ATTEMPTS = 30;

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export function DownloadControl({
  contentEnabled,
  fileId,
}: {
  contentEnabled: boolean;
  fileId: string | null;
}) {
  const { l } = useLocale();
  const [state, setState] = useState<DownloadState>("idle");
  const [message, setMessage] = useState("");
  const running = useRef(false);

  async function requestDownload() {
    if (running.current || !contentEnabled || !fileId) return;
    running.current = true;
    setState("preparing");
    setMessage(
      l(
        "Preparando tu copia individual protegida…",
        "Preparando sua cópia individual protegida…",
        "Preparing your protected individual copy…",
      ),
    );

    try {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const response = await fetch(`/api/content/files/${fileId}/access`, {
          cache: "no-store",
          credentials: "same-origin",
          method: "POST",
        });
        const payload = (await response.json()) as AccessResponse;

        if (response.ok && response.status === 200 && payload.signedUrl) {
          window.location.assign(payload.signedUrl);
          setState("idle");
          setMessage(
            l(
              "Tu descarga protegida está lista.",
              "Seu download protegido está pronto.",
              "Your protected download is ready.",
            ),
          );
          return;
        }

        if (response.status === 202 && payload.code === "watermark_pending") {
          const retrySeconds = Math.min(
            Math.max(payload.retryAfterSeconds ?? 3, 2),
            10,
          );
          await wait(retrySeconds * 1_000);
          continue;
        }

        if (response.status === 401) {
          throw new Error("authentication_required");
        }
        if (response.status === 403) {
          throw new Error("access_denied");
        }
        if (response.status === 404) {
          throw new Error("file_not_found");
        }
        throw new Error("download_unavailable");
      }
      throw new Error("watermark_timeout");
    } catch (error) {
      const code = error instanceof Error ? error.message : "download_unavailable";
      setState("error");
      setMessage(
        code === "access_denied"
          ? l(
              "Tu acceso a este material no está activo.",
              "Seu acesso a este material não está ativo.",
              "Your access to this material is not active.",
            )
          : l(
              "No pudimos preparar el archivo ahora. Inténtalo de nuevo.",
              "Não foi possível preparar o arquivo agora. Tente novamente.",
              "We could not prepare the file now. Please try again.",
            ),
      );
    } finally {
      running.current = false;
    }
  }

  const unavailable = !contentEnabled || !fileId;
  return (
    <div className="download-control">
      <button
        aria-busy={state === "preparing"}
        className="button button--secondary"
        disabled={unavailable || state === "preparing"}
        onClick={requestDownload}
        type="button"
      >
        <Icon name="download" />
        {state === "preparing"
          ? l("Preparando…", "Preparando…", "Preparing…")
          : l("Descargar PDF", "Baixar PDF", "Download PDF")}
      </button>
      <span
        aria-live="polite"
        className={
          state === "error"
            ? "download-status download-status--error"
            : "download-status"
        }
      >
        {unavailable
          ? l(
              "El archivo privado todavía no está disponible.",
              "O arquivo privado ainda não está disponível.",
              "The private file is not available yet.",
            )
          : message}
      </span>
    </div>
  );
}
