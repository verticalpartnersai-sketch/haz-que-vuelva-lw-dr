import Image from "next/image";
import Link from "next/link";

import { QuizTestimonialCarousel } from "@/features/quiz/quiz-testimonial-carousel";
import { previewCopyEs } from "@/features/quiz/quiz-preview-copy";

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
        <small>30 días · reciprocidad · claridad</small>
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
        <p>La ruta para sostener una apertura sin volver a perseguir.</p>
      </div>
    </div>
  );
}

export function OfferActions({
  acceptHref,
  declineHref,
  lastChance = false,
}: {
  acceptHref: string | null;
  declineHref: string;
  lastChance?: boolean;
}) {
  return (
    <div className="r30-actions">
      <div className="r30-price">
        <span>{lastChance ? "Antes de continuar" : "Añádelo ahora por"}</span>
        <strong>US$6,90</strong>
        <small>Pago único · acceso inmediato · garantía de 7 días</small>
      </div>
      {acceptHref ? (
        <a
          className="r30-action r30-action--accept"
          href={acceptHref}
          rel="noopener noreferrer"
        >
          SÍ, QUIERO AÑADIR RECONQUISTA 30
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="r30-action r30-action--accept r30-action--disabled"
          role="link"
        >
          SÍ, QUIERO AÑADIR RECONQUISTA 30
        </span>
      )}
      <small className="r30-actions__note">
        {acceptHref
          ? "Al continuar, abrirás la página segura de pago para confirmar este acceso adicional."
          : "La aceptación todavía no está conectada al pago. Este botón no realizará ningún cargo."}
      </small>
      <Link className="r30-action r30-action--decline" href={declineHref}>
        No, gracias. Prefiero continuar sin Reconquista 30.
      </Link>
    </div>
  );
}

export function ReconquistaTestimonials({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`r30-testimonials${compact ? " r30-testimonials--compact" : ""}`}>
      <header>
        <span className="r30-eyebrow">YA VISTE LO QUE CAMBIA CUANDO EXISTE UNA RUTA</span>
        <h2>No necesitas imaginar qué ocurre cuando dejas de reaccionar desde el miedo.</h2>
        <p>
          Estas son las mismas historias que acabas de ver en tu diagnóstico. Reconquista 30 existe para sostener esa ventaja después de la primera apertura, cuando volver a improvisar puede cerrar la puerta otra vez.
        </p>
      </header>
      <QuizTestimonialCarousel stories={previewCopyEs.proof.stories} />
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
