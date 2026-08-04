import Image from "next/image";
import Link from "next/link";

import { reconquistaScenarios } from "@/features/upsells/reconquista-content";

export function ReconquistaMasthead() {
  return (
    <header className="r30-masthead">
      <Image
        alt="Haz Que Vuelva"
        height={392}
        priority
        src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
        width={1451}
      />
      <span>Tu siguiente decisión ya está disponible</span>
    </header>
  );
}

export function ReconquistaBrand({ priority = false }: { priority?: boolean }) {
  return (
    <div className="r30-brand" aria-label="Reconquista 30">
      <Image
        alt=""
        aria-hidden="true"
        height={300}
        priority={priority}
        src="/images/upsells/reconquista-30/brand-v2.png"
        width={300}
      />
      <div>
        <strong>RECONQUISTA 30</strong>
        <small>Reciprocidad · acuerdos · claridad</small>
      </div>
    </div>
  );
}

export function ProductMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`r30-mockup${compact ? " r30-mockup--compact" : ""}`}>
      <div className="r30-mockup__page r30-mockup__page--back">
        <Image
          alt=""
          fill
          sizes="260px"
          src="/images/upsells/reconquista-30/pages/reciprocity-board.webp"
        />
      </div>
      <div className="r30-mockup__page r30-mockup__page--middle">
        <Image
          alt=""
          fill
          sizes="260px"
          src="/images/upsells/reconquista-30/pages/day-30.webp"
        />
      </div>
      <div className="r30-mockup__cover">
        <span>HAZ QUE VUELVA</span>
        <Image
          alt=""
          aria-hidden="true"
          height={300}
          priority={!compact}
          src="/images/upsells/reconquista-30/brand-v2.png"
          width={300}
        />
        <strong>RECONQUISTA 30</strong>
        <p>Treinta días para medir reciprocidad, reconstruir con acuerdos o salir con claridad.</p>
      </div>
    </div>
  );
}

export function OfferActions({
  acceptHref,
  declineHref,
  downsell = false,
}: {
  acceptHref: string | null;
  declineHref: string;
  downsell?: boolean;
}) {
  return (
    <div className="r30-actions">
      <div className="r30-price">
        <span>{downsell ? "Última condición poscompra" : "Añádelo ahora por"}</span>
        {downsell ? <del>US$7,90</del> : null}
        <strong>{downsell ? "US$5" : "US$7,90"}</strong>
        <small>Pago único · acceso inmediato · garantía de 7 días</small>
      </div>
      {acceptHref ? (
        <a
          className="r30-action r30-action--accept"
          href={acceptHref}
          rel="noopener noreferrer"
        >
          Sí, quiero Reconquista 30
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="r30-action r30-action--accept r30-action--disabled"
          role="link"
        >
          Sí, quiero Reconquista 30
        </span>
      )}
      <small className="r30-actions__note">
        {acceptHref
          ? "Al continuar, abrirás la página segura de pago para confirmar este acceso adicional."
          : "La aceptación todavía no está conectada al pago. Este botón no realizará ningún cargo."}
      </small>
      <Link className="r30-action r30-action--decline" href={declineHref}>
        No, prefiero seguir solo con mi plan de 7 días.
      </Link>
    </div>
  );
}

export function ScenarioStories({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`r30-stories${compact ? " r30-stories--compact" : ""}`}>
      <header>
        <span className="r30-kicker">Decisiones que el protocolo organiza</span>
        <h2>No se trata de creer más fuerte. Se trata de mirar mejor.</h2>
        <p>
          Estos relatos son escenarios ilustrativos de uso, no testimonios de compradoras ni promesas de resultado.
        </p>
      </header>
      <div className="r30-stories__grid">
        {reconquistaScenarios.map((scenario) => (
          <article key={scenario.title}>
            <span>Escenario ilustrativo</span>
            <blockquote>“{scenario.quote}”</blockquote>
            <h3>{scenario.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ReconquistaFooter() {
  const legalRegistration = process.env.NEXT_PUBLIC_VERTICAL_PARTNERS_CNPJ?.trim();

  return (
    <footer className="r30-footer">
      <Image
        alt="Haz Que Vuelva"
        height={392}
        src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
        width={1451}
      />
      <nav aria-label="Información legal">
        <Link href="/politica-de-privacidad">Política de privacidad</Link>
        <Link href="/terminos-de-uso">Términos de uso</Link>
      </nav>
      {legalRegistration ? <p>CNPJ {legalRegistration}</p> : null}
      <small>© {new Date().getFullYear()} Haz Que Vuelva. Todos los derechos reservados.</small>
    </footer>
  );
}
