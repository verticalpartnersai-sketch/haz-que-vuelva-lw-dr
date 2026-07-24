import Link from "next/link";

import { Icon } from "@/components/icon";
import { ProductRail } from "@/features/products/product-rail";
import { productGroups } from "@/mocks/data";

function Hero() {
  return (
    <section className="home-hero">
      <div aria-hidden="true" className="home-hero__placeholder">
        <span className="home-hero__halo" />
        <span className="home-hero__arc home-hero__arc--one" />
        <span className="home-hero__arc home-hero__arc--two" />
        <span className="home-hero__asset-note">
          Imagen hero pendiente
        </span>
      </div>
      <div aria-hidden="true" className="home-hero__scrim" />
      <div className="home-hero__content">
        <div aria-label="Haz Que Vuelva" className="home-hero__wordmark">
          <span aria-hidden="true">Haz Que</span>
          <strong aria-hidden="true">Vuelva</strong>
        </div>
        <h1 data-route-heading tabIndex={-1}>
          Tu espacio de contenidos
        </h1>
        <p>
          Continúa donde lo dejaste y encuentra todo lo que elegiste en una
          experiencia simple, directa y hecha para ti.
        </p>
        <div className="button-row">
          <Link className="button button--primary" href="/productos">
            Explorar productos
            <Icon name="arrowRight" />
          </Link>
          <Link
            className="button button--secondary"
            href="/productos/producto-principal-ejemplo"
          >
            <Icon name="book" />
            Mi biblioteca
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="home-page">
      <Hero />
      <div className="home-page__rails">
        {productGroups.map((group, index) => (
          <div className={index === 0 ? "home-rail home-rail--featured" : "home-rail"} key={group.id}>
            <ProductRail products={group.products} title={group.title} />
          </div>
        ))}
      </div>
    </div>
  );
}
