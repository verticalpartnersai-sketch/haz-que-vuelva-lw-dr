"use client";

import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

type AccessResponse = {
  code?: string;
  retryAfterSeconds?: number;
  signedUrl?: string;
};

type ReaderState = "loading" | "ready" | "error" | "unavailable";

const MAX_ACCESS_ATTEMPTS = 30;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.75;
const ZOOM_STEP = 0.25;

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, milliseconds);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function requestProtectedUrl(fileId: string, signal: AbortSignal) {
  for (let attempt = 0; attempt < MAX_ACCESS_ATTEMPTS; attempt += 1) {
    const response = await fetch(`/api/content/files/${fileId}/access`, {
      body: JSON.stringify({ purpose: "view" }),
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal,
    });
    const payload = (await response.json()) as AccessResponse;

    if (response.ok && response.status === 200 && payload.signedUrl) {
      return payload.signedUrl;
    }
    if (response.status === 202 && payload.code === "watermark_pending") {
      const retrySeconds = Math.min(
        Math.max(payload.retryAfterSeconds ?? 3, 2),
        10,
      );
      await wait(retrySeconds * 1_000, signal);
      continue;
    }
    if (response.status === 401) throw new Error("authentication_required");
    if (response.status === 403) throw new Error("access_denied");
    if (response.status === 404) throw new Error("file_not_found");
    throw new Error("reader_unavailable");
  }
  throw new Error("watermark_timeout");
}

export function ProtectedPdfReader({
  contentEnabled,
  fileId,
  productName,
}: {
  contentEnabled: boolean;
  fileId: string | null;
  productName: string;
}) {
  const { l } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderedPage, setRenderedPage] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);
  const [state, setState] = useState<ReaderState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateWidth = () => setStageWidth(stage.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentEnabled || !fileId) return;
    const activeFileId = fileId;

    let active = true;
    let loadedDocument: PDFDocumentProxy | null = null;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    const controller = new AbortController();

    async function load() {
      setState("loading");
      setPageNumber(1);
      setRenderedPage(0);
      try {
        const signedUrl = await requestProtectedUrl(activeFileId, controller.signal);
        const response = await fetch(signedUrl, {
          cache: "no-store",
          credentials: "omit",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("protected_pdf_fetch_failed");

        const [bytes, pdfjs] = await Promise.all([
          response.arrayBuffer(),
          import("pdfjs-dist"),
        ]);
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
        loadedDocument = await loadingTask.promise;
        if (!active) {
          await loadingTask.destroy();
          return;
        }
        setDocument(loadedDocument);
        setState("ready");
      } catch (error) {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) {
          return;
        }
        setDocument(null);
        setState("error");
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
      renderTaskRef.current?.cancel();
      if (loadingTask) void loadingTask.destroy();
    };
  }, [contentEnabled, fileId, reloadKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!document || !canvas || !stage || stageWidth === 0) return;
    const activeDocument = document;
    const activeCanvas = canvas;
    const activeStage = stage;

    let active = true;
    setRenderedPage(0);
    renderTaskRef.current?.cancel();

    async function renderPage() {
      const page = await activeDocument.getPage(pageNumber);
      if (!active) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const style = window.getComputedStyle(activeStage);
      const horizontalPadding =
        Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      const availableWidth = Math.max(stageWidth - horizontalPadding, 240);
      const fitScale = availableWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: fitScale * zoom });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const context = activeCanvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("canvas_context_unavailable");

      activeCanvas.width = Math.floor(viewport.width * outputScale);
      activeCanvas.height = Math.floor(viewport.height * outputScale);
      activeCanvas.style.width = `${Math.floor(viewport.width)}px`;
      activeCanvas.style.height = `${Math.floor(viewport.height)}px`;

      const renderTask = page.render({
        canvas: activeCanvas,
        canvasContext: context,
        transform:
          outputScale === 1
            ? undefined
            : [outputScale, 0, 0, outputScale, 0, 0],
        viewport,
      });
      renderTaskRef.current = renderTask;
      try {
        await renderTask.promise;
        if (active) setRenderedPage(pageNumber);
      } catch (error) {
        if (
          active &&
          !(error instanceof Error && error.name === "RenderingCancelledException")
        ) {
          setState("error");
        }
      }
    }

    void renderPage();
    return () => {
      active = false;
      renderTaskRef.current?.cancel();
    };
  }, [document, pageNumber, stageWidth, zoom]);

  const totalPages = document?.numPages ?? 0;
  const progress = totalPages > 0 ? Math.round((pageNumber / totalPages) * 100) : 0;
  const readerState = contentEnabled && fileId ? state : "unavailable";
  const rendering = readerState === "ready" && renderedPage !== pageNumber;

  function movePage(direction: -1 | 1) {
    setPageNumber((current) =>
      Math.min(Math.max(current + direction, 1), totalPages),
    );
  }

  return (
    <div
      aria-label={l(
        `Lector protegido de ${productName}`,
        `Leitor protegido de ${productName}`,
        `Protected reader for ${productName}`,
      )}
      className="pdf-reader"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") movePage(-1);
        if (event.key === "ArrowRight") movePage(1);
      }}
      tabIndex={0}
    >
      <div className="pdf-reader__toolbar">
        <div className="pdf-reader__identity">
          <Icon name="lock" weight="fill" />
          <span>{l("Copia protegida", "Cópia protegida", "Protected copy")}</span>
        </div>

        {readerState === "ready" ? (
          <div className="pdf-reader__controls">
            <div className="pdf-reader__pagination">
              <button
                aria-label={l("Página anterior", "Página anterior", "Previous page")}
                disabled={pageNumber <= 1}
                onClick={() => movePage(-1)}
                type="button"
              >
                <Icon name="arrowLeft" />
              </button>
              <span aria-live="polite">
                {pageNumber} / {totalPages}
              </span>
              <button
                aria-label={l("Página siguiente", "Próxima página", "Next page")}
                disabled={pageNumber >= totalPages}
                onClick={() => movePage(1)}
                type="button"
              >
                <Icon name="arrowRight" />
              </button>
            </div>
            <div className="pdf-reader__zoom">
              <button
                aria-label={l("Reducir zoom", "Reduzir zoom", "Zoom out")}
                disabled={zoom <= MIN_ZOOM}
                onClick={() =>
                  setZoom((current) => Math.max(current - ZOOM_STEP, MIN_ZOOM))
                }
                type="button"
              >
                −
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                aria-label={l("Aumentar zoom", "Aumentar zoom", "Zoom in")}
                disabled={zoom >= MAX_ZOOM}
                onClick={() =>
                  setZoom((current) => Math.min(current + ZOOM_STEP, MAX_ZOOM))
                }
                type="button"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <span>{l("Vista privada", "Visualização privada", "Private view")}</span>
        )}
      </div>

      {readerState === "ready" ? (
        <div
          aria-label={l(
            `Progreso del documento: ${progress}%`,
            `Progresso do documento: ${progress}%`,
            `Document progress: ${progress}%`,
          )}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="pdf-reader__progress"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <div className="pdf-reader__stage" ref={stageRef}>
        {readerState === "unavailable" ? (
          <div className="pdf-reader__feedback">
            <Icon name="lock" />
            <strong>
              {l(
                "El documento todavía no está disponible",
                "O documento ainda não está disponível",
                "The document is not available yet",
              )}
            </strong>
          </div>
        ) : null}
        {readerState === "loading" ? (
          <div aria-live="polite" className="pdf-reader__feedback">
            <span aria-hidden="true" className="pdf-reader__spinner" />
            <strong>
              {l(
                "Preparando tu copia protegida…",
                "Preparando sua cópia protegida…",
                "Preparing your protected copy…",
              )}
            </strong>
            <small>
              {l(
                "La primera apertura puede tardar unos segundos.",
                "A primeira abertura pode levar alguns segundos.",
                "The first opening may take a few seconds.",
              )}
            </small>
          </div>
        ) : null}
        {readerState === "error" ? (
          <div aria-live="assertive" className="pdf-reader__feedback">
            <Icon name="book" />
            <strong>
              {l(
                "No pudimos abrir el documento",
                "Não foi possível abrir o documento",
                "We could not open the document",
              )}
            </strong>
            <small>
              {l(
                "Comprueba tu conexión e inténtalo de nuevo.",
                "Verifique sua conexão e tente novamente.",
                "Check your connection and try again.",
              )}
            </small>
            <button
              className="button button--secondary"
              onClick={() => setReloadKey((current) => current + 1)}
              type="button"
            >
              {l("Intentar de nuevo", "Tentar novamente", "Try again")}
            </button>
          </div>
        ) : null}
        <canvas
          aria-label={l(
            `Página ${pageNumber} de ${totalPages} de ${productName}`,
            `Página ${pageNumber} de ${totalPages} de ${productName}`,
            `Page ${pageNumber} of ${totalPages} of ${productName}`,
          )}
          className={
            readerState === "ready"
              ? "pdf-reader__page"
              : "pdf-reader__page is-hidden"
          }
          ref={canvasRef}
          role="img"
        />
        {rendering ? (
          <span aria-hidden="true" className="pdf-reader__rendering">
            <span className="pdf-reader__spinner" />
          </span>
        ) : null}
      </div>

      {readerState === "ready" ? (
        <div className="pdf-reader__footer">
          <span>
            {l(
              `Página ${pageNumber} de ${totalPages}`,
              `Página ${pageNumber} de ${totalPages}`,
              `Page ${pageNumber} of ${totalPages}`,
            )}
          </span>
          <small>
            {l(
              "Usa las flechas del teclado para avanzar.",
              "Use as setas do teclado para avançar.",
              "Use the keyboard arrows to navigate.",
            )}
          </small>
        </div>
      ) : null}
    </div>
  );
}
