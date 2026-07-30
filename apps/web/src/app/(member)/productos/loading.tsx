export default function ProductsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando productos"
      className="page-frame page-frame--catalog page-frame--top"
    >
      <div className="catalog-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div aria-hidden="true" className="skeleton-card" key={index}>
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}
