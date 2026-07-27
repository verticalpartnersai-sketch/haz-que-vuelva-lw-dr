"use client";

import Link from "next/link";

import { Icon } from "@/components/icon";
import { useLocale, type CopyKey } from "@/features/i18n/locale";
import { ProductRail } from "@/features/products/product-rail";
import { productGroups } from "@/mocks/data";

function Hero() {
  const { t } = useLocale();

  return (
    <section className="home-hero">
      <div aria-hidden="true" className="home-hero__media">
        <picture>
          <source
            media="(min-width: 1920px)"
            srcSet="/images/hero-haz-que-vuelva-ultrawide.webp"
          />
          <source
            media="(min-width: 1024px)"
            srcSet="/images/hero-haz-que-vuelva-desktop.webp"
          />
          <source
            media="(min-width: 640px)"
            srcSet="/images/hero-haz-que-vuelva-tablet.webp"
          />
          <source
            media="(max-width: 639px)"
            srcSet="/images/hero-haz-que-vuelva-mobile.webp"
          />
          <img
            alt=""
            decoding="async"
            fetchPriority="high"
            height="941"
            loading="eager"
            src="/images/hero-haz-que-vuelva-desktop.webp"
            width="1672"
          />
        </picture>
      </div>
      <div aria-hidden="true" className="home-hero__scrim" />
      <div className="home-hero__content">
        <div aria-label="Haz Que Vuelva" className="home-hero__wordmark">
          <span aria-hidden="true">Haz Que</span>
          <strong aria-hidden="true">Vuelva</strong>
        </div>
        <h1 data-route-heading tabIndex={-1}>
          {t("home.title")}
        </h1>
        <p>{t("home.description")}</p>
        <div className="button-row">
          <Link className="button button--primary" href="/productos">
            {t("home.explore")}
            <Icon name="arrowRight" />
          </Link>
          <Link
            className="button button--secondary"
            href="/productos/haz-que-vuelva"
          >
            <Icon name="book" />
            {t("home.library")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const { t } = useLocale();
  const railTitleKeys: Record<(typeof productGroups)[number]["id"], CopyKey> = {
    todos: "home.rail.all",
    disponibles: "home.rail.available",
    bloqueados: "home.rail.locked",
  };

  return (
    <div className="home-page">
      <Hero />
      <div className="home-page__rails">
        {productGroups.map((group, index) => (
          <div className={index === 0 ? "home-rail home-rail--featured" : "home-rail"} key={group.id}>
            <ProductRail products={group.products} title={t(railTitleKeys[group.id])} />
          </div>
        ))}
      </div>
    </div>
  );
}
