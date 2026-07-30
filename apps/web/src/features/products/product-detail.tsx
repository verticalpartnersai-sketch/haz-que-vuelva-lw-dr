"use client";

import Link from "next/link";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { DownloadControl } from "@/features/products/download-control";
import { featureFlags } from "@/mocks/data";
import type { Product } from "@/mocks/types";

export function ProductDetail({
  contentEnabled,
  contentFileId,
  product,
}: {
  contentEnabled: boolean;
  contentFileId: string | null;
  product: Product;
}) {
  const { l, t } = useLocale();

  return (
    <article className="product-detail page-frame page-frame--top">
      <Link className="back-link" href="/productos">
        <Icon name="arrowLeft" />
        {l("Volver a Productos", "Voltar para Produtos", "Back to Products")}
      </Link>
      <header className="product-detail__header">
        <div>
          <span className="eyebrow">
            {product.eyebrow} ·{" "}
            {contentEnabled
              ? l("Contenido privado", "Conteúdo privado", "Private content")
              : l("Contenido de ejemplo", "Conteúdo de exemplo", "Example content")}
          </span>
          <h1 data-route-heading tabIndex={-1}>
            {product.name}
          </h1>
          <p>{product.description}</p>
        </div>
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          {t("status.available")}
        </span>
      </header>

      <div
        className={
          product.relatedItems?.length
            ? "product-detail__layout product-detail__layout--with-aside"
            : "product-detail__layout"
        }
      >
        <section aria-labelledby="reader-title" className="reader-section">
          <div className="reader-section__heading">
            <div>
              <span className="section-kicker">
                {l("Lectura integrada", "Leitura integrada", "Embedded reading")}
              </span>
              <h2 id="reader-title">
                {contentEnabled
                  ? l("Documento PDF protegido", "Documento PDF protegido", "Protected PDF document")
                  : l(
                      "Documento PDF de ejemplo",
                      "Documento PDF de exemplo",
                      "Example PDF document",
                    )}
              </h2>
            </div>
            <DownloadControl
              contentEnabled={contentEnabled}
              fileId={contentFileId}
            />
          </div>
          <div
            aria-label={l(
              "Vista previa del lector PDF de ejemplo",
              "Prévia do leitor de PDF de exemplo",
              "Example PDF reader preview",
            )}
            className="pdf-reader"
            role="img"
          >
            <div className="pdf-reader__toolbar">
              <span>
                {contentEnabled
                  ? l("Documento privado", "Documento privado", "Private document")
                  : l("Documento de ejemplo", "Documento de exemplo", "Example document")}
              </span>
              <span>
                {l(
                  contentEnabled ? "Vista protegida" : "Página 1 de 12 · simulación",
                  contentEnabled ? "Visualização protegida" : "Página 1 de 12 · simulação",
                  contentEnabled ? "Protected preview" : "Page 1 of 12 · simulation",
                )}
              </span>
            </div>
            <div className="pdf-reader__canvas">
              <div className="pdf-page">
                <span className="pdf-page__eyebrow">HAZ QUE VUELVA</span>
                <strong>
                  {l("Lectura de ejemplo", "Leitura de exemplo", "Example reading")}
                </strong>
                <span />
                <span />
                <span />
                <small>
                  {l(
                    contentEnabled
                      ? "Usa el botón para generar y descargar tu copia individual."
                      : "Este contenedor no carga un archivo real.",
                    contentEnabled
                      ? "Use o botão para gerar e baixar sua cópia individual."
                      : "Este contêiner não carrega um arquivo real.",
                    contentEnabled
                      ? "Use the button to generate and download your individual copy."
                      : "This container does not load a real file.",
                  )}
                </small>
              </div>
            </div>
          </div>
        </section>

        {product.relatedItems?.length ? (
          <aside aria-labelledby="related-title" className="related-panel">
            <span className="section-kicker">
              {l("Recorrido", "Percurso", "Journey")}
            </span>
            <h2 id="related-title">
              {l(
                "Contenido relacionado",
                "Conteúdo relacionado",
                "Related content",
              )}
            </h2>
            <ol>
              {product.relatedItems.map((item, index) => (
                <li key={item.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>

      {featureFlags.comments ? (
        <section aria-labelledby="comments-title" className="surface-card">
          <span className="section-kicker">
            {l("Comunidad", "Comunidade", "Community")}
          </span>
          <h2 id="comments-title">{l("Comentarios", "Comentários", "Comments")}</h2>
          <p>
            {l(
              "Función futura sin envío, moderación ni persistencia en este gate.",
              "Função futura sem envio, moderação ou persistência neste gate.",
              "Future feature with no posting, moderation, or persistence in this gate.",
            )}
          </p>
        </section>
      ) : null}
    </article>
  );
}
