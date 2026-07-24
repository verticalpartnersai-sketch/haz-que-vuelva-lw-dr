import Link from "next/link";

import { Icon } from "@/components/icon";
import { DownloadSimulation } from "@/features/products/download-simulation";
import { featureFlags } from "@/mocks/data";
import type { Product } from "@/mocks/types";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <article className="product-detail page-frame">
      <Link className="back-link" href="/productos">
        <Icon name="arrowLeft" />
        Volver a Productos
      </Link>
      <header className="product-detail__header">
        <div>
          <span className="eyebrow">{product.eyebrow} · Contenido de ejemplo</span>
          <h1 data-route-heading tabIndex={-1}>
            {product.name}
          </h1>
          <p>{product.description}</p>
        </div>
        <span className="status-badge status-badge--available">
          <Icon name="check" />
          Disponible
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
              <span className="section-kicker">Lectura integrada</span>
              <h2 id="reader-title">Documento PDF de ejemplo</h2>
            </div>
            <DownloadSimulation />
          </div>
          <div
            aria-label="Vista previa del lector PDF de ejemplo"
            className="pdf-reader"
            role="img"
          >
            <div className="pdf-reader__toolbar">
              <span>Documento de ejemplo</span>
              <span>Página 1 de 12 · simulación</span>
            </div>
            <div className="pdf-reader__canvas">
              <div className="pdf-page">
                <span className="pdf-page__eyebrow">HAZ QUE VUELVA</span>
                <strong>Lectura de ejemplo</strong>
                <span />
                <span />
                <span />
                <small>Este contenedor no carga un archivo real.</small>
              </div>
            </div>
          </div>
        </section>

        {product.relatedItems?.length ? (
          <aside aria-labelledby="related-title" className="related-panel">
            <span className="section-kicker">Recorrido</span>
            <h2 id="related-title">Contenido relacionado</h2>
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
          <span className="section-kicker">Comunidad</span>
          <h2 id="comments-title">Comentarios</h2>
          <p>
            Función futura sin envío, moderación ni persistencia en este gate.
          </p>
        </section>
      ) : null}
    </article>
  );
}
