"use client";

import { useRef, useState, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { useLocale } from "@/features/i18n/locale";
import type { ProductCode } from "@/modules/catalog/domain/product";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const productOptions = [
  { label: "Haz Que Vuelva", value: "haz_que_vuelva" },
  { label: "21 Mensajes de Reconexión", value: "21_mensajes" },
  { label: "La Otra", value: "la_otra" },
  { label: "Reconquista 30", value: "reconquista_30" },
  { label: "Vuelve IA", value: "vuelve_ia" },
] as const;

export function AdminContentUpload() {
  const { l } = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [productCode, setProductCode] =
    useState<ProductCode>("haz_que_vuelva");
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"idle" | "error" | "success">(
    "idle",
  );
  const [title, setTitle] = useState("Guía principal");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatusKind("error");
      setStatus(
        l(
          "Selecciona un PDF antes de publicar.",
          "Selecione um PDF antes de publicar.",
          "Select a PDF before publishing.",
        ),
      );
      return;
    }
    if (file.type !== "application/pdf" || file.size > MAX_UPLOAD_BYTES) {
      setStatusKind("error");
      setStatus(
        l(
          "El archivo debe ser un PDF válido de hasta 12 MiB.",
          "O arquivo deve ser um PDF válido de até 12 MiB.",
          "The file must be a valid PDF up to 12 MiB.",
        ),
      );
      return;
    }

    setBusy(true);
    setStatusKind("idle");
    setStatus(
      l("Validando y publicando…", "Validando e publicando…", "Validating and publishing…"),
    );
    const body = new FormData();
    body.set("file", file);
    body.set("productCode", productCode);
    body.set("title", title);

    try {
      const response = await fetch("/api/admin/content/pdfs", {
        body,
        method: "POST",
      });
      const payload = (await response.json()) as {
        code?: string;
        version?: number;
      };
      if (!response.ok) {
        throw new Error(payload.code ?? "content_pdf_publish_failed");
      }

      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setStatusKind("success");
      setStatus(
        l(
          `PDF publicado como versión ${payload.version ?? "nueva"}.`,
          `PDF publicado como versão ${payload.version ?? "nova"}.`,
          `PDF published as version ${payload.version ?? "new"}.`,
        ),
      );
    } catch {
      setStatusKind("error");
      setStatus(
        l(
          "No se pudo publicar. El archivo no quedó activo; inténtalo de nuevo.",
          "Não foi possível publicar. O arquivo não ficou ativo; tente novamente.",
          "Publishing failed. The file was not activated; try again.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-content-upload" onSubmit={submit}>
      <div className="card-heading">
        <div>
          <span className="section-kicker">
            {l("Contenido privado", "Conteúdo privado", "Private content")}
          </span>
          <h2>
            {l(
              "Publicar PDF del producto",
              "Publicar PDF do produto",
              "Publish product PDF",
            )}
          </h2>
        </div>
        <span className="status-badge status-badge--available">
          <Icon name="lock" />
          {l("Bucket privado", "Bucket privado", "Private bucket")}
        </span>
      </div>

      <div className="field-grid">
        <label>
          {l("Producto", "Produto", "Product")}
          <SelectControl
            ariaLabel={l(
              "Producto del contenido",
              "Produto do conteúdo",
              "Content product",
            )}
            onChange={setProductCode}
            options={productOptions}
            value={productCode}
          />
        </label>
        <label>
          {l("Título interno", "Título interno", "Internal title")}
          <input
            maxLength={160}
            minLength={3}
            onChange={(event) => setTitle(event.target.value)}
            required
            type="text"
            value={title}
          />
        </label>
        <label className="admin-content-upload__file">
          {l("Archivo PDF", "Arquivo PDF", "PDF file")}
          <input
            accept="application/pdf,.pdf"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            ref={fileRef}
            required
            type="file"
          />
          <small>
            {l(
              "Máximo 12 MiB y 300 páginas. Cada publicación crea una nueva versión.",
              "Máximo de 12 MiB e 300 páginas. Cada publicação cria uma nova versão.",
              "Maximum 12 MiB and 300 pages. Each publication creates a new version.",
            )}
          </small>
        </label>
      </div>

      <div className="button-row">
        <button className="button button--primary" disabled={busy} type="submit">
          <Icon name="upload" />
          {busy
            ? l("Publicando…", "Publicando…", "Publishing…")
            : l("Validar y publicar", "Validar e publicar", "Validate and publish")}
        </button>
      </div>
      <p
        aria-live="polite"
        className={`form-status form-status--${statusKind}`}
      >
        {status}
      </p>
    </form>
  );
}
