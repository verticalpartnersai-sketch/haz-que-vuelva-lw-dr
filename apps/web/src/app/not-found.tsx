import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-frame">
      <div className="feedback-panel">
        <span className="eyebrow">404</span>
        <h1 data-route-heading tabIndex={-1}>
          No encontramos esta página
        </h1>
        <p>La ruta solicitada no forma parte de este prototipo estático.</p>
        <Link className="button button--primary" href="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
