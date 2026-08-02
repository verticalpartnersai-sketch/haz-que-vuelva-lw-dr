"use client";

import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist";
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

type AccessResponse = {
  code?: string;
  retryAfterSeconds?: number;
  signedUrl?: string;
};

type ReaderState = "loading" | "ready" | "error" | "unavailable";
type ProgressSaveState = "idle" | "saving" | "saved" | "error";

const MAX_ACCESS_ATTEMPTS = 30;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.75;
const ZOOM_STEP = 0.25;
const DEFAULT_PAGE_RATIO = 1.414;

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

function ProtectedPdfPage({
  document,
  pageNumber,
  productName,
  scrollRootRef,
  stageWidth,
  zoom,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
  productName: string;
  scrollRootRef: RefObject<HTMLDivElement | null>;
  stageWidth: number;
  zoom: number;
}) {
  const { l } = useLocale();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(pageNumber <= 2);
  const [pageRatio, setPageRatio] = useState(DEFAULT_PAGE_RATIO);
  const [rendered, setRendered] = useState(false);

  const pageWidth = Math.max(stageWidth * zoom, 240);
  const pageHeight = pageWidth * pageRatio;

  useEffect(() => {
    const pageElement = pageRef.current;
    const scrollRoot = scrollRootRef.current;
    if (!pageElement || !scrollRoot) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      {
        root: scrollRoot,
        rootMargin: "1000px 0px",
        threshold: 0,
      },
    );
    observer.observe(pageElement);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  useEffect(() => {
    let active = true;
    void document.getPage(pageNumber).then((page) => {
      if (!active) return;
      const viewport = page.getViewport({ scale: 1 });
      setPageRatio(viewport.height / viewport.width);
    });
    return () => {
      active = false;
    };
  }, [document, pageNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isNearViewport || !canvas || stageWidth <= 0) return;

    let active = true;
    setRendered(false);
    renderTaskRef.current?.cancel();

    async function renderPage() {
      const page = await document.getPage(pageNumber);
      if (!active || !canvas) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const fitScale = stageWidth / baseViewport.width;
      const viewport = page.getViewport({ scale: fitScale * zoom });
      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("canvas_context_unavailable");

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const renderTask = page.render({
        canvas,
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
        if (active) setRendered(true);
      } catch (error) {
        if (
          active &&
          !(error instanceof Error && error.name === "RenderingCancelledException")
        ) {
          throw error;
        }
      }
    }

    void renderPage().catch(() => {
      if (active) setRendered(false);
    });
    return () => {
      active = false;
      renderTaskRef.current?.cancel();
    };
  }, [document, isNearViewport, pageNumber, stageWidth, zoom]);

  return (
    <div
      className="pdf-reader__page-shell"
      data-pdf-page={pageNumber}
      ref={pageRef}
      style={
        {
          "--pdf-page-height": `${pageHeight}px`,
          "--pdf-page-width": `${pageWidth}px`,
        } as CSSProperties
      }
    >
      <canvas
        aria-label={l(
          `Página ${pageNumber} de ${document.numPages} de ${productName}`,
          `Página ${pageNumber} de ${document.numPages} de ${productName}`,
          `Page ${pageNumber} of ${document.numPages} of ${productName}`,
        )}
        className={`pdf-reader__page${rendered ? " is-rendered" : ""}`}
        ref={canvasRef}
        role="img"
      />
      {!rendered && isNearViewport ? (
        <span aria-hidden="true" className="pdf-reader__page-loading">
          <span className="pdf-reader__spinner" />
        </span>
      ) : null}
    </div>
  );
}

export function ProtectedPdfReader({
  contentEnabled,
  fileId,
  initialProgress,
  productCode,
  productName,
}: {
  contentEnabled: boolean;
  fileId: string | null;
  initialProgress: number;
  productCode: string;
  productName: string;
}) {
  const { l } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(initialProgress);
  const persistedProgressRef = useRef(initialProgress);
  const restoredProgressRef = useRef(false);
  const [automaticProgress, setAutomaticProgress] = useState(initialProgress);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(0);
  const [state, setState] = useState<ReaderState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [progressSaveState, setProgressSaveState] =
    useState<ProgressSaveState>("idle");
  const [zoom, setZoom] = useState(1);

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
      if (progressTimerRef.current !== null) {
        window.clearTimeout(progressTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const updateWidth = () => {
      const style = window.getComputedStyle(stage);
      const horizontalPadding =
        Number.parseFloat(style.paddingLeft) + Number.parseFloat(style.paddingRight);
      setPageWidth(Math.max(stage.clientWidth - horizontalPadding, 240));
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!contentEnabled || !fileId) return;
    const activeFileId = fileId;

    let active = true;
    let loadingTask: PDFDocumentLoadingTask | null = null;
    const controller = new AbortController();

    async function load() {
      setState("loading");
      setPageNumber(1);
      restoredProgressRef.current = false;
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
        const loadedDocument = await loadingTask.promise;
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
      if (loadingTask) void loadingTask.destroy();
    };
  }, [contentEnabled, fileId, reloadKey]);

  const totalPages = document?.numPages ?? 0;
  const readerState = contentEnabled && fileId ? state : "unavailable";

  const persistProgress = useCallback(
    async (nextProgress: number, keepalive = false) => {
      if (nextProgress <= persistedProgressRef.current) return;
      setProgressSaveState("saving");
      try {
        const response = await fetch(`/api/products/${productCode}/progress`, {
          body: JSON.stringify({ progressPercent: nextProgress }),
          cache: "no-store",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          keepalive,
          method: "PUT",
        });
        if (!response.ok) throw new Error("reading_progress_save_failed");
        const payload = (await response.json()) as { progressPercent?: unknown };
        if (payload.progressPercent !== nextProgress) {
          throw new Error("reading_progress_response_invalid");
        }
        persistedProgressRef.current = Math.max(
          persistedProgressRef.current,
          nextProgress,
        );
        setProgressSaveState("saved");
      } catch {
        setProgressSaveState("error");
      }
    },
    [productCode],
  );

  useEffect(() => {
    persistedProgressRef.current = initialProgress;
    pendingProgressRef.current = initialProgress;
    setAutomaticProgress(initialProgress);
    setProgressSaveState("idle");
  }, [fileId, initialProgress, productCode]);

  useEffect(() => {
    if (readerState !== "ready" || totalPages === 0) return;
    const reachedProgress = Math.max(
      automaticProgress,
      Math.round((pageNumber / totalPages) * 100),
    );
    if (reachedProgress > automaticProgress) {
      setAutomaticProgress(reachedProgress);
    }
    if (reachedProgress <= persistedProgressRef.current) return;

    pendingProgressRef.current = reachedProgress;
    setProgressSaveState("idle");
    if (progressTimerRef.current !== null) {
      window.clearTimeout(progressTimerRef.current);
    }
    progressTimerRef.current = window.setTimeout(() => {
      progressTimerRef.current = null;
      void persistProgress(pendingProgressRef.current);
    }, 1_500);
  }, [automaticProgress, pageNumber, persistProgress, readerState, totalPages]);

  useEffect(() => {
    function flushPendingProgress() {
      if (
        pendingProgressRef.current <= persistedProgressRef.current ||
        readerState !== "ready"
      ) {
        return;
      }
      if (progressTimerRef.current !== null) {
        window.clearTimeout(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      void persistProgress(pendingProgressRef.current, true);
    }

    function handleVisibilityChange() {
      if (window.document.visibilityState === "hidden") {
        flushPendingProgress();
      }
    }

    window.document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flushPendingProgress);
    return () => {
      window.document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      window.removeEventListener("pagehide", flushPendingProgress);
      flushPendingProgress();
    };
  }, [persistProgress, readerState]);

  useEffect(() => {
    if (
      !document ||
      pageWidth <= 0 ||
      restoredProgressRef.current ||
      initialProgress <= 0
    ) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const stage = stageRef.current;
      if (!stage) return;
      const targetPage = Math.min(
        Math.max(Math.ceil((initialProgress / 100) * document.numPages), 1),
        document.numPages,
      );
      const target = stage.querySelector<HTMLElement>(
        `[data-pdf-page="${targetPage}"]`,
      );
      if (!target) return;
      restoredProgressRef.current = true;
      setPageNumber(targetPage);
      stage.scrollTo({ left: 0, top: Math.max(target.offsetTop - 16, 0) });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [document, initialProgress, pageWidth]);

  function updateCurrentPage() {
    const stage = stageRef.current;
    if (!stage) return;

    const stageCenter = stage.getBoundingClientRect().top + stage.clientHeight / 2;
    let closestPage = pageNumber;
    let closestDistance = Number.POSITIVE_INFINITY;

    stage.querySelectorAll<HTMLElement>("[data-pdf-page]").forEach((page) => {
      const rect = page.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - stageCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = Number(page.dataset.pdfPage);
      }
    });
    setPageNumber(closestPage);
  }

  function handleScroll() {
    if (scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      scrollFrameRef.current = null;
      updateCurrentPage();
    });
  }

  function goToPage(nextPage: number) {
    const stage = stageRef.current;
    if (!stage || totalPages === 0) return;
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);
    const target = stage.querySelector<HTMLElement>(
      `[data-pdf-page="${boundedPage}"]`,
    );
    if (!target) return;
    setPageNumber(boundedPage);
    stage.scrollTo({
      behavior: "smooth",
      left: Math.max(target.offsetLeft - stage.clientWidth / 2 + target.clientWidth / 2, 0),
      top: Math.max(target.offsetTop - 16, 0),
    });
  }

  function movePage(direction: -1 | 1) {
    goToPage(pageNumber + direction);
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
            `Progreso del documento: ${automaticProgress}%`,
            `Progresso do documento: ${automaticProgress}%`,
            `Document progress: ${automaticProgress}%`,
          )}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={automaticProgress}
          className="pdf-reader__progress"
          role="progressbar"
        >
          <span style={{ width: `${automaticProgress}%` }} />
        </div>
      ) : null}

      <div className="pdf-reader__stage" onScroll={handleScroll} ref={stageRef}>
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
        {readerState === "ready" && document
          ? Array.from({ length: totalPages }, (_, index) => (
              <ProtectedPdfPage
                document={document}
                key={index + 1}
                pageNumber={index + 1}
                productName={productName}
                scrollRootRef={stageRef}
                stageWidth={pageWidth}
                zoom={zoom}
              />
            ))
          : null}
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
            {progressSaveState === "saving"
              ? l("Guardando avance…", "Salvando progresso…", "Saving progress…")
              : progressSaveState === "saved"
                ? l(
                    "Avance guardado automáticamente",
                    "Progresso salvo automaticamente",
                    "Progress saved automatically",
                  )
                : progressSaveState === "error"
                  ? l(
                      "El avance se volverá a guardar al continuar",
                      "O progresso será salvo novamente ao continuar",
                      "Progress will be saved again as you continue",
                    )
                  : l(
                      "Desplázate para leer. Tu avance se guarda automáticamente.",
                      "Role para ler. Seu progresso é salvo automaticamente.",
                      "Scroll to read. Your progress is saved automatically.",
                    )}
          </small>
        </div>
      ) : null}
    </div>
  );
}
