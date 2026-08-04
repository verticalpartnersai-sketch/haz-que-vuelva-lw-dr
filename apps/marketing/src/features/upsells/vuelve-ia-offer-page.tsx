import Image from "next/image";

import {
  vuelveDetails,
  vuelveOfferSummary,
  vuelveSteps,
} from "@/features/upsells/vuelve-ia-content";
import {
  VuelveActions,
  VuelveBrand,
  VuelveExample,
  VuelveFooter,
  VuelveProductMockup,
} from "@/features/upsells/vuelve-ia-parts";

type VuelveOfferPageProps = {
  acceptHref: string | null;
  declineHref: string;
  variant: "upsell" | "downsell";
};

function Hero({
  acceptHref,
  declineHref,
  isDownsell,
}: Pick<VuelveOfferPageProps, "acceptHref" | "declineHref"> & {
  isDownsell: boolean;
}) {
  return (
    <section className="via-hero" id="oferta">
      <div className="via-hero__copy">
        <span className="via-status">
          {isDownsell ? "ANTES DE ENTRAR A TU ACCESO" : "ÚLTIMA OPCIÓN ANTES DE CONTINUAR"}
        </span>
        <h1>
          {isDownsell
            ? "El mismo diagnóstico completo sigue disponible antes de continuar."
            : "Tu conversación tiene matices que un PDF no puede ver."}
        </h1>
        <p>
          {isDownsell
            ? "Mantienes los mismos 30 días, el mismo tipo de análisis, los mismos formatos aceptados y los mismos límites de uso. El producto no pierde ninguna función."
            : "Comparte el texto de tu conversación y recibe una lectura organizada de los hechos, las señales, lo que no se puede saber y la decisión que tiene más sentido ahora."}
        </p>
        <VuelveActions acceptHref={acceptHref} declineHref={declineHref} />
      </div>
      <div className="via-hero__visual">
        <VuelveProductMockup compact={isDownsell} />
      </div>
    </section>
  );
}

function Context() {
  return (
    <section className="via-context">
      <span className="via-eyebrow">UNA FRASE AISLADA NO CUENTA TODA LA HISTORIA</span>
      <h2>“Bien, ¿y tú?” puede ser una puerta, cortesía o una despedida lenta.</h2>
      <p>
        Importa quién inició, qué ocurrió antes, cuánto duró el silencio, si hizo una pregunta propia y si su conducta después coincide con sus palabras.
      </p>
      <p>
        Cuando decides mirando una sola línea, el deseo inventa una apertura y el miedo inventa un cierre. VUELVE IA te obliga a volver a los hechos antes de actuar.
      </p>
    </section>
  );
}

function Steps() {
  return (
    <section className="via-steps">
      <header>
        <span className="via-eyebrow">DE MILES DE MENSAJES A UNA DECISIÓN REVISABLE</span>
        <h2>La conversación entra como contexto. La salida vuelve como una razón para actuar.</h2>
      </header>
      <ol>
        {vuelveSteps.map((step) => (
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
  );
}

function Proof() {
  return (
    <section className="via-proof">
      <header>
        <span className="via-eyebrow">NO RECIBES UNA FRASE MÁGICA</span>
        <h2>Recibes una lectura que muestra de dónde sale cada decisión.</h2>
        <p>
          Este ejemplo es sintético y demuestra la estructura del diagnóstico. No representa el resultado de una compradora real.
        </p>
      </header>
      <VuelveExample />
    </section>
  );
}

function Details() {
  return (
    <section className="via-details">
      <header>
        <span className="via-eyebrow">LO QUE UN CONSEJO GENÉRICO NO PUEDE VER</span>
        <h2>Un solo caso, con contexto continuo, durante los próximos 30 días.</h2>
      </header>
      <div className="via-details__grid">
        {vuelveDetails.map((detail) => (
          <article key={detail.title}>
            <span aria-hidden="true">✓</span>
            <div>
              <h3>{detail.title}</h3>
              <p>{detail.body}</p>
            </div>
          </article>
        ))}
      </div>
      <aside className="via-boundary">
        <strong>Transparencia antes de compartir tu conversación</strong>
        <p>
          VUELVE IA no lee pensamientos, no diagnostica personas y no garantiza reconciliación. Retira datos innecesarios de terceros antes de enviar el archivo.
        </p>
      </aside>
    </section>
  );
}

function OfferCard({
  acceptHref,
  declineHref,
}: Pick<VuelveOfferPageProps, "acceptHref" | "declineHref">) {
  return (
    <section className="via-offer">
      <header>
        <span className="via-eyebrow">COMPLETA TU ACCESO</span>
        <h2>Antes de enviar otra respuesta, entiende qué conversación estás viviendo.</h2>
      </header>
      <article className="via-offer-card">
        <VuelveBrand />
        <h3>Convierte tu conversación en hechos, señales, límites y una decisión explicada.</h3>
        <ul>
          {vuelveOfferSummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="via-price">
          <span>AÑADE 30 DÍAS DE ACCESO POR</span>
          <strong>US$20</strong>
        </div>
        <VuelveActions acceptHref={acceptHref} declineHref={declineHref} />
      </article>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="via-guarantee">
      <Image
        alt="Garantía de 7 días"
        height={640}
        loading="lazy"
        src="/images/quiz/offer/guarantee-seal-transparent-v2.webp"
        width={640}
      />
      <div>
        <h2>Tienes 7 días para comprobar si esta lectura organizada es para ti.</h2>
        <p>
          Si el acceso no corresponde a lo que esperabas, puedes solicitar el reembolso dentro de los primeros 7 días conforme a los términos de la compra.
        </p>
      </div>
    </section>
  );
}

export function VuelveIaOfferPage({
  acceptHref,
  declineHref,
  variant,
}: VuelveOfferPageProps) {
  const isDownsell = variant === "downsell";

  return (
    <main className={`via-page${isDownsell ? " via-page--downsell" : ""}`}>
      <a className="skip-link" href="#oferta">Ir a la oferta</a>
      <header className="via-masthead"><VuelveBrand priority /></header>
      <Hero acceptHref={acceptHref} declineHref={declineHref} isDownsell={isDownsell} />
      {isDownsell ? <Proof /> : (
        <>
          <Context />
          <Steps />
          <Proof />
          <Details />
          <OfferCard acceptHref={acceptHref} declineHref={declineHref} />
          <Guarantee />
        </>
      )}
      <VuelveFooter />
    </main>
  );
}
