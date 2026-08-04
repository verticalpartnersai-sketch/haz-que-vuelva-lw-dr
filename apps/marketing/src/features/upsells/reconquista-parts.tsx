import Image from "next/image";
import Link from "next/link";

import { QuizTestimonialCarousel } from "@/features/quiz/quiz-testimonial-carousel";
import { previewCopyEs } from "@/features/quiz/quiz-preview-copy";

export function ReconquistaMasthead() {
  return (
    <header className="r30-masthead">
      <Image
        alt="Reconquista 30"
        height={300}
        priority
        src="/images/upsells/reconquista-30/brand-transparent-light-v1.png"
        width={300}
      />
    </header>
  );
}

export function ReconquistaBrand({ priority = false }: { priority?: boolean }) {
  return (
    <div className="r30-brand" aria-label="Reconquista 30">
      <Image
        alt="Reconquista 30"
        height={300}
        priority={priority}
        src="/images/upsells/reconquista-30/brand-transparent-dark-v1.png"
        width={300}
      />
    </div>
  );
}

export function ProductMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`r30-mockup${compact ? " r30-mockup--compact" : ""}`}>
      <Image
        alt="Reconquista 30 abierto en ebook, notebook, tablet y celular"
        height={916}
        priority
        sizes="(max-width: 639px) calc(100vw - 20px), 860px"
        src="/images/upsells/reconquista-30/product-bundle-mockup-v1.png"
        width={1717}
      />
    </div>
  );
}

export function OfferActions({
  acceptHref,
  declineHref,
  price,
  priceLabel = "Añádelo ahora por",
}: {
  acceptHref: string | null;
  declineHref: string;
  price?: string;
  priceLabel?: string;
}) {
  return (
    <div className="r30-actions">
      {price ? (
        <div className="r30-price">
          <span>{priceLabel}</span>
          <strong>{price}</strong>
        </div>
      ) : null}
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
      <Link className="r30-action r30-action--decline" href={declineHref}>
        NO, GRACIAS. PREFIERO CONTINUAR SIN RECONQUISTA 30
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
