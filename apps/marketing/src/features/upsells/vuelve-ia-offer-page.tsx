import Image from "next/image";

import {
  vuelveDetails,
  vuelveOfferSummary,
  vuelveSteps,
} from "@/features/upsells/vuelve-ia-content";
import {
  VuelveActions,
  VuelveBrand,
  VuelveFooter,
  VuelveMasthead,
  VuelveProductMockup,
  VuelveTestimonials,
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
    <section className="r30-hero" id="oferta">
      <div className="r30-hero__copy">
        <span className="r30-status">
          {isDownsell ? "ANTES DE CONTINUAR" : "OFERTA COMPLEMENTARIA DISPONIBLE"}
        </span>
        <h1>
          {isDownsell
            ? "Tu conversación sigue teniendo matices que una guía no puede analizar por ti."
            : "Un PDF te enseña la ruta. VUELVE IA analiza la conversación que estás viviendo ahora."}
        </h1>
        <p>
          {isDownsell
            ? "Mantienes el mismo diagnóstico completo, los mismos 30 días, los mismos formatos aceptados y los mismos límites de uso. No se elimina ninguna función."
            : "Comparte lo que ocurrió y recibe una lectura organizada de los hechos, las señales, lo que todavía no se puede saber y la decisión que tiene más sentido antes de responder."}
        </p>
        <VuelveActions acceptHref={acceptHref} declineHref={declineHref} />
      </div>
      <div className="r30-hero__visual">
        <VuelveProductMockup compact={isDownsell} />
      </div>
    </section>
  );
}

function Bridge() {
  return (
    <section className="r30-prose">
      <span className="r30-eyebrow">UNA FRASE AISLADA NO CUENTA TODA LA HISTORIA</span>
      <h2>“Bien, ¿y tú?” puede ser una puerta, cortesía o una despedida lenta.</h2>
      <p>
        Importa quién inició, qué ocurrió antes, cuánto duró el silencio, si hizo una pregunta propia y si su conducta después coincide con sus palabras.
      </p>
      <p>
        Cuando decides mirando una sola línea, el deseo inventa una apertura y el miedo inventa un cierre. VUELVE IA te ayuda a volver a los hechos antes de actuar.
      </p>
      <strong>Tu conversación entra como contexto. La salida vuelve como una razón para decidir.</strong>
    </section>
  );
}

function Steps() {
  return (
    <section className="r30-weeks vuelve-steps">
      <header>
        <span className="r30-eyebrow">DE LA CONVERSACIÓN A UNA DECISIÓN REVISABLE</span>
        <h2>Tres pasos para dejar de completar los silencios con ansiedad.</h2>
        <p>
          El sistema organiza el contexto sin prometer leer pensamientos ni decidir por ti.
        </p>
      </header>
      <ol>
        {vuelveSteps.map((step) => (
          <li key={step.label}>
            <div className="r30-weeks__copy">
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const productScreens = [
  {
    alt: "Pantalla inicial real de VUELVE IA",
    caption: "El espacio antes de iniciar una conversación",
    height: 1000,
    src: "/images/upsells/vuelve-ia/member-ai-empty-v1.png",
    width: 1384,
  },
  {
    alt: "Conversación sintética dentro de la interfaz real de VUELVE IA",
    caption: "Una pregunta concreta con respuesta contextual",
    height: 1000,
    src: "/images/upsells/vuelve-ia/member-ai-conversation-v1.png",
    width: 1384,
  },
  {
    alt: "Interfaz móvil real de VUELVE IA con una conversación sintética",
    caption: "El mismo contexto disponible desde el celular",
    height: 780,
    src: "/images/upsells/vuelve-ia/member-ai-conversation-mobile-v1.png",
    width: 390,
  },
] as const;

function ProductProof() {
  return (
    <section className="r30-proof vuelve-proof">
      <header>
        <span className="r30-eyebrow">CAPTURAS REALES DE LA ÁREA DE MIEMBROS</span>
        <h2>Esto es lo que vas a abrir, no una interfaz inventada para venderte.</h2>
        <p>
          Las pantallas pertenecen a VUELVE IA dentro de Haz Que Vuelva. La conversación mostrada es sintética y no contiene datos de una compradora.
        </p>
      </header>
      <div className="r30-proof__rail vuelve-proof__rail">
        {productScreens.map((screen) => (
          <figure key={screen.src}>
            <div className="vuelve-proof__shot">
              <Image
                alt={screen.alt}
                height={screen.height}
                loading="lazy"
                sizes="(max-width: 639px) 78vw, 310px"
                src={screen.src}
                width={screen.width}
              />
            </div>
            <figcaption>{screen.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ValueStack() {
  return (
    <section className="r30-value vuelve-value">
      <header>
        <span className="r30-eyebrow">LO QUE UN CONSEJO GENÉRICO NO PUEDE VER</span>
        <h2>Un solo caso, con contexto continuo, durante los próximos 30 días.</h2>
      </header>
      <div className="vuelve-value__grid">
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
      <aside className="vuelve-boundary">
        <strong>Transparencia antes de compartir una conversación</strong>
        <p>
          VUELVE IA no lee pensamientos, no diagnostica personas y no garantiza una reconciliación. Retira datos innecesarios de terceros antes de enviar un archivo.
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
    <section className="r30-offer">
      <header>
        <span className="r30-eyebrow">COMPLETA TU ACCESO</span>
        <h2>Antes de enviar otra respuesta, entiende qué conversación estás viviendo.</h2>
      </header>
      <article className="r30-offer-card">
        <VuelveBrand />
        <h3>Convierte tu conversación en hechos, señales, límites y una decisión explicada.</h3>
        <ul>
          {vuelveOfferSummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <VuelveActions acceptHref={acceptHref} declineHref={declineHref} price="US$20" />
      </article>
    </section>
  );
}

function Guarantee() {
  return (
    <section className="r30-guarantee">
      <Image
        alt="Garantía de 7 días"
        height={640}
        loading="lazy"
        src="/images/quiz/offer/guarantee-seal-transparent-v2.webp"
        width={640}
      />
      <h2>Tienes 7 días para comprobar si esta lectura organizada es para ti.</h2>
      <p>
        Si el acceso no corresponde a lo que esperabas, puedes solicitar el reembolso dentro de los primeros 7 días conforme a los términos de la compra.
      </p>
    </section>
  );
}

export function VuelveIaOfferPage({ acceptHref, declineHref, variant }: VuelveOfferPageProps) {
  const isDownsell = variant === "downsell";

  return (
    <main className={`r30-page r30-page--vuelve${isDownsell ? " r30-page--downsell" : ""}`}>
      <a className="skip-link" href="#oferta">Ir a la oferta</a>
      <VuelveMasthead />
      <Hero acceptHref={acceptHref} declineHref={declineHref} isDownsell={isDownsell} />
      {isDownsell ? null : (
        <>
          <Bridge />
          <Steps />
          <ProductProof />
          <ValueStack />
        </>
      )}
      <VuelveTestimonials compact={isDownsell} />
      {isDownsell ? null : (
        <>
          <OfferCard acceptHref={acceptHref} declineHref={declineHref} />
          <Guarantee />
        </>
      )}
      <VuelveFooter />
    </main>
  );
}
