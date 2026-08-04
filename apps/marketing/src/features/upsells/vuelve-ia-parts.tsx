import Image from "next/image";
import Link from "next/link";

import { QuizTestimonialCarousel } from "@/features/quiz/quiz-testimonial-carousel";
import { previewCopyEs } from "@/features/quiz/quiz-preview-copy";
import { ReconquistaFooter } from "@/features/upsells/reconquista-parts";

export function VuelveMasthead() {
  return (
    <header className="r30-masthead vuelve-masthead">
      <Image
        alt="Diagnóstico VUELVE IA"
        height={300}
        priority
        src="/images/upsells/vuelve-ia/brand-transparent-light-v1.png"
        width={300}
      />
    </header>
  );
}

export function VuelveBrand() {
  return (
    <div className="r30-brand vuelve-brand" aria-label="Diagnóstico VUELVE IA">
      <Image
        alt="Diagnóstico VUELVE IA"
        height={300}
        loading="lazy"
        src="/images/upsells/vuelve-ia/brand-transparent-dark-v1.png"
        width={300}
      />
    </div>
  );
}

export function VuelveActions({
  acceptHref,
  declineHref,
  price,
}: {
  acceptHref: string | null;
  declineHref: string;
  price?: string;
}) {
  return (
    <div className="r30-actions">
      {price ? (
        <div className="r30-price">
          <span>Añade 30 días de acceso por</span>
          <strong>{price}</strong>
        </div>
      ) : null}
      {acceptHref ? (
        <a className="r30-action r30-action--accept" href={acceptHref} rel="noopener noreferrer">
          SÍ, QUIERO AÑADIR VUELVE IA
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="r30-action r30-action--accept r30-action--disabled"
          role="link"
        >
          SÍ, QUIERO AÑADIR VUELVE IA
        </span>
      )}
      <Link className="r30-action r30-action--decline" href={declineHref}>
        NO, GRACIAS. PREFIERO CONTINUAR SIN VUELVE IA
      </Link>
    </div>
  );
}

export function VuelveProductMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`r30-mockup vuelve-mockup${compact ? " vuelve-mockup--compact" : ""}`}>
      <div className="vuelve-device vuelve-device--desktop">
        <div className="vuelve-device__bar" aria-hidden="true"><i /><i /><i /></div>
        <div className="vuelve-device__screen">
          <Image
            alt="Conversación sintética dentro de la interfaz real de VUELVE IA"
            fill
            priority
            sizes="(max-width: 639px) 86vw, 760px"
            src="/images/upsells/vuelve-ia/member-ai-conversation-v1.png"
          />
        </div>
      </div>
      <div className="vuelve-device__base" aria-hidden="true" />
      <div className="vuelve-device vuelve-device--tablet">
        <Image
          alt="Pantalla inicial real de VUELVE IA"
          fill
          priority
          sizes="(max-width: 639px) 34vw, 250px"
          src="/images/upsells/vuelve-ia/member-ai-empty-v1.png"
        />
      </div>
      <div className="vuelve-device vuelve-device--phone">
        <Image
          alt="Conversación sintética en la interfaz móvil real de VUELVE IA"
          fill
          priority
          sizes="(max-width: 639px) 25vw, 160px"
          src="/images/upsells/vuelve-ia/member-ai-conversation-mobile-v1.png"
        />
      </div>
    </div>
  );
}

export function VuelveTestimonials({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`r30-testimonials${compact ? " r30-testimonials--compact" : ""}`}>
      <header>
        <span className="r30-eyebrow">HISTORIAS REALES DEL MISMO PROCESO</span>
        <h2>No necesitas volver a interpretar cada silencio sola.</h2>
        <p>
          Estas son las mismas historias que acabas de ver en tu diagnóstico. VUELVE IA añade un espacio para organizar lo que ocurre después, cuando un mensaje nuevo puede activar otra vez el miedo y la urgencia.
        </p>
      </header>
      <QuizTestimonialCarousel stories={previewCopyEs.proof.stories} />
    </section>
  );
}

export function VuelveFooter() {
  return <ReconquistaFooter />;
}
