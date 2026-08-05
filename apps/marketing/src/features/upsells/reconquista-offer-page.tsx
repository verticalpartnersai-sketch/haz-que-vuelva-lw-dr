import Image from "next/image";

import {
  reconquistaDetails,
  reconquistaOfferSummary,
  reconquistaPages,
  reconquistaWeeks,
} from "@/features/upsells/reconquista-content";
import {
  OfferActions,
  ProductMockup,
  ReconquistaBrand,
  ReconquistaFooter,
  ReconquistaMasthead,
  ReconquistaTestimonials,
} from "@/features/upsells/reconquista-parts";

type ReconquistaOfferPageProps = {
  acceptHref: string | null;
  declineHref: string;
  variant: "upsell" | "downsell";
};

function Hero({
  acceptHref,
  declineHref,
  isDownsell,
}: Pick<ReconquistaOfferPageProps, "acceptHref" | "declineHref"> & {
  isDownsell: boolean;
}) {
  return (
    <section className="r30-hero" id="oferta">
      <div className="r30-hero__copy">
        <span className="r30-status">
          {isDownsell ? "TU ÚLTIMA OPORTUNIDAD" : "OFERTA COMPLEMENTARIA DISPONIBLE"}
        </span>
        <h1>
          {isDownsell
            ? "Realmente creo que estarías dejando pasar una gran oportunidad de sostener lo que Haz Que Vuelva puede abrir."
            : "Haz Que Vuelva puede abrir la puerta. Reconquista 30 evita que vuelvas a cerrarla cuando él reaparezca."}
        </h1>
        <p>
          {isDownsell
            ? "Por eso quiero darte una última oportunidad de añadir Reconquista 30 por un valor menor. Recibes la misma ruta completa de 30 días; solo cambia el precio. Después de esta página, la oferta se cierra. La decisión está en tus manos."
            : "El primer mensaje no es una reconciliación. Durante los próximos 30 días necesitas saber cuánto avanzar, qué señal observar y cuándo detenerte antes de cargar otra vez toda la relación sola."}
        </p>
        <OfferActions
          acceptHref={acceptHref}
          declineHref={declineHref}
          originalPrice={isDownsell ? "US$6,90" : undefined}
          price={isDownsell ? "US$4,90" : undefined}
        />
      </div>
      <div className="r30-hero__visual" aria-label="Vista del producto Reconquista 30">
        <ProductMockup compact={isDownsell} />
      </div>
    </section>
  );
}

function Bridge() {
  return (
    <section className="r30-prose">
      <span className="r30-eyebrow">LA APERTURA ES APENAS EL COMIENZO</span>
      <h2>Volver a hablar no significa que la relación ya volvió.</h2>
      <p>
        Él manda un “¿cómo estás?”. Tú llevabas semanas esperando. Respondes rápido, aparece la nostalgia y esa pequeña apertura acaba cargando preguntas, seguridad y futuro de una sola vez.
      </p>
      <p>
        Después vuelve el silencio. No porque responder fuera un error, sino porque intentaste reconstruir antes de comprobar si él también estaba dispuesto a sostener algo.
      </p>
      <strong>
        Reconquista 30 protege el momento que Haz Que Vuelva te ayudó a recuperar.
      </strong>
    </section>
  );
}

function Weeks() {
  return (
    <section className="r30-weeks">
      <header>
        <span className="r30-eyebrow">TU RUTA DESPUÉS DE LOS PRIMEROS 7 DÍAS</span>
        <h2>Treinta días para separar una reapertura real de otra vuelta al mismo ciclo.</h2>
        <p>
          Cada semana responde una pregunta distinta antes de que la emoción convierta una señal en una certeza.
        </p>
      </header>
      <ol>
        {reconquistaWeeks.map((week) => (
          <li key={week.label}>
            <div className="r30-page-shot">
              <Image alt="" fill sizes="(max-width: 639px) 100vw, 330px" src={week.image} />
            </div>
            <div className="r30-weeks__copy">
              <span>{week.label}</span>
              <h3>{week.title}</h3>
              <p>{week.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProductProof() {
  return (
    <section className="r30-proof">
      <header>
        <span className="r30-eyebrow">PÁGINAS REALES DEL PRODUCTO</span>
        <h2>Mira exactamente lo que vas a abrir.</h2>
        <p>
          No es un mockup vacío. Son páginas del protocolo final que transforman cada etapa en observación, acción y límite verificable.
        </p>
      </header>
      <div className="r30-proof__rail">
        {reconquistaPages.map((page) => (
          <figure key={page.src}>
            <div className="r30-page-shot">
              <Image
                alt={page.alt}
                height={1020}
                loading="lazy"
                sizes="(max-width: 639px) 68vw, 230px"
                src={page.src}
                width={719}
              />
            </div>
            <figcaption>{page.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ValueStack() {
  return (
    <section className="r30-value">
      <header>
        <span className="r30-eyebrow">NO RECIBES FRASES PARA MANTENERLO CERCA</span>
        <h2>Recibes un sistema para descubrir si los dos están reconstruyendo.</h2>
      </header>
      <div className="r30-value__items">
        {reconquistaDetails.map((detail) => (
          <article key={detail.title}>
            <div className="r30-page-shot">
              <Image alt="" height={1020} loading="lazy" src={detail.image} width={719} />
            </div>
            <div>
              <h3>{detail.title}</h3>
              <p>{detail.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OfferCard({
  acceptHref,
  declineHref,
}: Pick<ReconquistaOfferPageProps, "acceptHref" | "declineHref">) {
  return (
    <section className="r30-offer">
      <header>
        <span className="r30-eyebrow">COMPLETA TU RUTA</span>
        <h2>La apertura no es la meta. Es el momento en que más necesitas dejar de improvisar.</h2>
      </header>
      <article className="r30-offer-card">
        <ReconquistaBrand />
        <h3>Todo lo que necesitas para navegar los próximos 30 días con claridad.</h3>
        <ul>
          {reconquistaOfferSummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <OfferActions
          acceptHref={acceptHref}
          declineHref={declineHref}
          price="US$6,90"
        />
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
        loading="eager"
        src="/images/quiz/offer/guarantee-seal-transparent-v2.webp"
        width={640}
      />
      <h2>Tienes 7 días para abrir Reconquista 30 y comprobar si esta ruta es para ti.</h2>
      <p>
        Si el acceso no corresponde a lo que esperabas, puedes solicitar el reembolso dentro de los primeros 7 días conforme a los términos de la compra.
      </p>
    </section>
  );
}

export function ReconquistaOfferPage({
  acceptHref,
  declineHref,
  variant,
}: ReconquistaOfferPageProps) {
  const isDownsell = variant === "downsell";

  return (
    <main className={`r30-page${isDownsell ? " r30-page--downsell" : ""}`}>
      <a className="skip-link" href="#oferta">Ir a la oferta</a>
      <ReconquistaMasthead />
      <Hero acceptHref={acceptHref} declineHref={declineHref} isDownsell={isDownsell} />
      {isDownsell ? null : (
        <>
          <Bridge />
          <Weeks />
          <ProductProof />
          <ValueStack />
        </>
      )}
      <ReconquistaTestimonials compact={isDownsell} />
      {isDownsell ? null : (
        <>
          <OfferCard acceptHref={acceptHref} declineHref={declineHref} />
          <Guarantee />
        </>
      )}
      <ReconquistaFooter />
    </main>
  );
}
