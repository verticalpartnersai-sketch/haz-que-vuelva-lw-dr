import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/icon";

export type OfferStep = {
  body: string;
  label: string;
  title: string;
};

export type OfferGalleryItem = {
  alt: string;
  caption: string;
  src: string;
};

export type OfferDetail = {
  description: string;
  title: string;
};

export type OfferExample = {
  decision: string;
  fact: string;
  signal: string;
  unknown: string;
};

export type UpsellOffer = {
  acceptLabel: string;
  accessLine: string;
  brandAlt: string;
  brandSrc: string;
  declineLabel: string;
  details: readonly OfferDetail[];
  detailsBody: string;
  detailsHeading: string;
  example?: OfferExample;
  gallery?: readonly OfferGalleryItem[];
  guaranteeBody: string;
  heroAlt: string;
  heroBody: string;
  heroImage: string;
  heroTitle: string;
  kicker: string;
  offerBody: string;
  offerHeading: string;
  price: string;
  priceContext: string;
  proofBody: string;
  proofHeading: string;
  sceneBody: readonly string[];
  sceneHeading: string;
  steps: readonly OfferStep[];
  stepsBody: string;
  stepsHeading: string;
};

function AcceptButton({
  href,
  label,
}: {
  href: string | null;
  label: string;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        className="offer-cta offer-cta--disabled"
        role="link"
      >
        {label}
        <Icon name="arrowRight" weight="bold" />
      </span>
    );
  }

  return (
    <a
      className="offer-cta"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
      <Icon name="external" weight="bold" />
    </a>
  );
}

function OfferExampleCard({ example }: { example: OfferExample }) {
  return (
    <div className="offer-analysis" aria-label="Ejemplo sintético de análisis">
      <span className="offer-analysis__label">
        Ejemplo sintético de salida
      </span>
      <dl>
        <div>
          <dt>Hecho observable</dt>
          <dd>{example.fact}</dd>
        </div>
        <div>
          <dt>Lo que no sabemos</dt>
          <dd>{example.unknown}</dd>
        </div>
        <div>
          <dt>Señal</dt>
          <dd>{example.signal}</dd>
        </div>
        <div>
          <dt>Decisión ahora</dt>
          <dd>{example.decision}</dd>
        </div>
      </dl>
    </div>
  );
}

export function UpsellOfferPage({
  acceptHref,
  declineHref,
  offer,
}: {
  acceptHref: string | null;
  declineHref: string;
  offer: UpsellOffer;
}) {
  return (
    <main className="offer-page">
      <a className="skip-link" href="#oferta">
        Ir a la oferta
      </a>

      <header className="offer-masthead">
        <Image
          alt="Haz Que Vuelva"
          height={392}
          priority
          src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
          width={1451}
        />
        <span>
          <Icon name="spark" weight="bold" />
          Tu siguiente decisión ya está disponible
        </span>
      </header>

      <section className="offer-hero">
        <div className="offer-hero__brand">
          <Image
            alt={offer.brandAlt}
            height={600}
            priority
            src={offer.brandSrc}
            width={600}
          />
        </div>
        <span className="offer-kicker">{offer.kicker}</span>
        <h1>{offer.heroTitle}</h1>
        <p>{offer.heroBody}</p>
        <AcceptButton href={acceptHref} label={offer.acceptLabel} />
        <small>{offer.accessLine}</small>
        <figure className="offer-hero__media">
          <Image
            alt={offer.heroAlt}
            fill
            priority
            sizes="(max-width: 719px) calc(100vw - 32px), 760px"
            src={offer.heroImage}
          />
        </figure>
      </section>

      <section className="offer-prose">
        <h2>{offer.sceneHeading}</h2>
        {offer.sceneBody.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="offer-steps">
        <header>
          <h2>{offer.stepsHeading}</h2>
          <p>{offer.stepsBody}</p>
        </header>
        <ol>
          {offer.steps.map((step) => (
            <li key={step.label}>
              <span>{step.label}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="offer-proof">
        <header>
          <h2>{offer.proofHeading}</h2>
          <p>{offer.proofBody}</p>
        </header>
        {offer.gallery ? (
          <div className="offer-gallery">
            {offer.gallery.map((item) => (
              <figure key={item.src}>
                <Image
                  alt={item.alt}
                  height={1020}
                  loading="lazy"
                  sizes="(max-width: 719px) 72vw, 220px"
                  src={item.src}
                  width={720}
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : null}
        {offer.example ? <OfferExampleCard example={offer.example} /> : null}
      </section>

      <section className="offer-details">
        <header>
          <h2>{offer.detailsHeading}</h2>
          <p>{offer.detailsBody}</p>
        </header>
        <div>
          {offer.details.map((detail) => (
            <article key={detail.title}>
              <span>
                <Icon name="check" weight="bold" />
              </span>
              <div>
                <h3>{detail.title}</h3>
                <p>{detail.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="offer-guarantee">
        <span aria-hidden="true">7</span>
        <div>
          <h2>Prueba tu acceso durante 7 días</h2>
          <p>{offer.guaranteeBody}</p>
        </div>
      </section>

      <section className="offer-checkout" id="oferta">
        <Image
          alt={offer.brandAlt}
          height={600}
          loading="lazy"
          src={offer.brandSrc}
          width={600}
        />
        <span>{offer.priceContext}</span>
        <h2>{offer.offerHeading}</h2>
        <p>{offer.offerBody}</p>
        <strong>{offer.price}</strong>
        <AcceptButton href={acceptHref} label={offer.acceptLabel} />
        <small>
          {acceptHref
            ? offer.accessLine
            : "La aceptación todavía no está conectada a Perfect Pay. No se realizará ningún cargo desde este botón."}
        </small>
        <Link className="offer-decline" href={declineHref}>
          {offer.declineLabel}
        </Link>
      </section>
    </main>
  );
}
