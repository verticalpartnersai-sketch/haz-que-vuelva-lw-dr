import Image from "next/image";
import Link from "next/link";

import { vuelveExample } from "@/features/upsells/vuelve-ia-content";

export function VuelveBrand({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      alt="Diagnóstico VUELVE IA"
      height={300}
      priority={priority}
      src="/images/upsells/vuelve-ia/brand-v2.png"
      width={300}
    />
  );
}

export function VuelveActions({
  acceptHref,
  declineHref,
}: {
  acceptHref: string | null;
  declineHref: string;
}) {
  return (
    <div className="via-actions">
      {acceptHref ? (
        <a className="via-action via-action--accept" href={acceptHref} rel="noopener noreferrer">
          SÍ, QUIERO AÑADIR VUELVE IA
        </a>
      ) : (
        <span
          aria-disabled="true"
          className="via-action via-action--accept via-action--disabled"
          role="link"
        >
          SÍ, QUIERO AÑADIR VUELVE IA
        </span>
      )}
      <Link className="via-action via-action--decline" href={declineHref}>
        NO, GRACIAS. PREFIERO CONTINUAR SIN VUELVE IA
      </Link>
    </div>
  );
}

function AnalysisRows({ compact = false }: { compact?: boolean }) {
  const rows = [
    ["Hecho observable", vuelveExample.fact],
    ["Lo que no sabemos", vuelveExample.unknown],
    ["Señal", vuelveExample.signal],
    ["Decisión ahora", vuelveExample.decision],
  ] as const;

  return (
    <div className="via-ui__rows">
      {rows.slice(0, compact ? 2 : rows.length).map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
}

export function VuelveProductMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-label="Vista del diagnóstico VUELVE IA en notebook, tablet y celular"
      className={`via-mockup${compact ? " via-mockup--compact" : ""}`}
      role="img"
    >
      <div className="via-laptop" aria-hidden="true">
        <div className="via-device-bar"><i /><i /><i /><span>VUELVE IA</span></div>
        <div className="via-ui">
          <aside>
            <b>CASO ACTIVO</b>
            <span>Conversación principal</span>
            <span>Nuevos mensajes</span>
            <span>Plan de acción</span>
          </aside>
          <section>
            <small>LECTURA DE LA CONVERSACIÓN</small>
            <h3>Tu próxima decisión, organizada</h3>
            <AnalysisRows compact={compact} />
          </section>
        </div>
      </div>
      <div className="via-laptop__base" aria-hidden="true" />
      <div className="via-tablet" aria-hidden="true">
        <small>SEÑAL ACTUAL</small>
        <strong>Apertura cautelosa</strong>
        <p>La respuesta permite continuar, pero todavía no prueba intención de volver.</p>
        <span>Ver justificación</span>
      </div>
      <div className="via-phone" aria-hidden="true">
        <i />
        <small>DECISIÓN AHORA</small>
        <strong>Responder con la misma intensidad</strong>
        <p>Observa quién sostiene el próximo intercambio.</p>
        <span>Plan de 24 horas</span>
      </div>
    </div>
  );
}

export function VuelveExample() {
  return (
    <article className="via-example" aria-label="Ejemplo sintético de análisis">
      <div className="via-example__topline">
        <span>EJEMPLO SINTÉTICO DE SALIDA</span>
        <small>No corresponde a una compradora real</small>
      </div>
      <AnalysisRows />
    </article>
  );
}

export function VuelveFooter() {
  const legalRegistration = process.env.NEXT_PUBLIC_VERTICAL_PARTNERS_CNPJ?.trim();

  return (
    <footer className="via-footer">
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
