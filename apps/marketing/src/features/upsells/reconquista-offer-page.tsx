import Image from "next/image";

import {
  reconquistaDetails,
  reconquistaPages,
  reconquistaWeeks,
} from "@/features/upsells/reconquista-content";
import {
  OfferActions,
  ProductMockup,
  ReconquistaBrand,
  ReconquistaFooter,
  ReconquistaMasthead,
  ScenarioStories,
} from "@/features/upsells/reconquista-parts";

type ReconquistaOfferPageProps = {
  acceptHref: string | null;
  declineHref: string;
  variant: "upsell" | "downsell";
};

function UpsellHero({
  acceptHref,
  declineHref,
}: Pick<ReconquistaOfferPageProps, "acceptHref" | "declineHref">) {
  return (
    <section className="r30-hero">
      <div className="r30-hero__copy">
        <ReconquistaBrand priority />
        <span className="r30-kicker">Oferta única poscompra · protocolo completo</span>
        <h1>
          Si él abre la puerta y tú vuelves a correr, puedes perder en 48 horas lo que tardaste semanas en recuperar.
        </h1>
        <p>
          El primer mensaje no es una reconciliación. <strong>Reconquista 30</strong> te da una ruta diaria para medir reciprocidad, reconstruir sin presión y detectar si otra vez eres tú quien está haciendo todo el trabajo.
        </p>
        <OfferActions acceptHref={acceptHref} declineHref={declineHref} />
      </div>
      <div className="r30-hero__visual" aria-label="Vista del producto Reconquista 30">
        <span>50 páginas · 30 días · 4 revisiones</span>
        <ProductMockup />
      </div>
    </section>
  );
}

function PainScene() {
  return (
    <section className="r30-scene">
      <figure>
        <Image
          alt="Mujer observando con calma un mensaje antes de responder"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 50vw"
          src="/images/upsells/reconquista-30/hero-message.webp"
        />
      </figure>
      <div>
        <span className="r30-kicker">La recaída empieza pareciendo esperanza</span>
        <h2>Volver a hablar no significa que la relación ya volvió.</h2>
        <p>
          Él manda un “¿cómo estás?”. Tú llevabas semanas esperando. Respondes rápido, aparece la nostalgia y esa pequeña apertura acaba cargando preguntas, seguridad y futuro de una sola vez.
        </p>
        <p>
          Después vuelve el silencio. No porque responder fuera un error, sino porque intentaste reconstruir antes de comprobar si él también estaba dispuesto a sostener algo.
        </p>
        <strong>Reconquista 30 corta ese ciclo antes de que una señal vuelva a decidir por ti.</strong>
      </div>
    </section>
  );
}

function Weeks() {
  return (
    <section className="r30-weeks">
      <header>
        <span className="r30-kicker">Una pregunta distinta cada semana</span>
        <h2>Treinta días para separar una reapertura real de otra vuelta al mismo ciclo.</h2>
      </header>
      <ol>
        {reconquistaWeeks.map((week) => (
          <li key={week.label}>
            <Image alt="" height={1020} src={week.image} width={719} />
            <div>
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
        <span className="r30-kicker">Páginas reales, no mockups vacíos</span>
        <h2>Mira exactamente lo que vas a abrir.</h2>
        <p>
          Estas son páginas del protocolo final de 50 páginas. El contenido convierte cada etapa en una observación, una acción y un límite verificable.
        </p>
      </header>
      <div className="r30-proof__rail">
        {reconquistaPages.map((page) => (
          <figure key={page.src}>
            <Image
              alt={page.alt}
              height={1020}
              loading="lazy"
              sizes="(max-width: 760px) 66vw, 230px"
              src={page.src}
              width={719}
            />
            <figcaption>{page.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Details() {
  return (
    <section className="r30-details">
      <div className="r30-details__copy">
        <span className="r30-kicker">Lo que protege una reapertura real</span>
        <h2>No recibes frases para mantenerlo cerca a cualquier precio.</h2>
        <p>
          Recibes un sistema para descubrir si los dos están construyendo o si solo tú estás cargando la relación.
        </p>
        <Image
          alt="Mujer observando reciprocidad durante una conversación presencial"
          height={900}
          loading="lazy"
          src="/images/upsells/reconquista-30/reciprocity-meeting.webp"
          width={1600}
        />
      </div>
      <div className="r30-details__list">
        {reconquistaDetails.map((detail) => (
          <article key={detail.number}>
            <span>{detail.number}</span>
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

function Guarantee() {
  return (
    <section className="r30-guarantee">
      <strong>7</strong>
      <div>
        <span className="r30-kicker">Garantía de 7 días</span>
        <h2>Abre el protocolo y comprueba si esta ruta te da la claridad que necesitas.</h2>
        <p>
          Si el acceso no corresponde a lo que esperabas, puedes solicitar el reembolso dentro de los primeros 7 días conforme a los términos de la compra.
        </p>
      </div>
    </section>
  );
}

function FinalOffer({
  acceptHref,
  declineHref,
}: Pick<ReconquistaOfferPageProps, "acceptHref" | "declineHref">) {
  return (
    <section className="r30-final" id="oferta">
      <div className="r30-final__mockup"><ProductMockup compact /></div>
      <div>
        <ReconquistaBrand />
        <span className="r30-kicker">No llegues sin ruta al momento que llevas semanas esperando</span>
        <h2>La apertura es apenas el comienzo.</h2>
        <p>
          Añade el protocolo completo que transforma los próximos 30 días en observación, conversación proporcional, límites y decisiones claras.
        </p>
        <ul>
          <li>Protocolo completo de 50 páginas</li>
          <li>30 acciones diarias y 4 revisiones</li>
          <li>Panel de reciprocidad y hoja final de decisión</li>
        </ul>
        <OfferActions acceptHref={acceptHref} declineHref={declineHref} />
      </div>
    </section>
  );
}

function Downsell({
  acceptHref,
  declineHref,
}: Pick<ReconquistaOfferPageProps, "acceptHref" | "declineHref">) {
  return (
    <>
      <section className="r30-downsell" id="oferta">
        <div className="r30-downsell__copy">
          <ReconquistaBrand priority />
          <span className="r30-kicker">Última oportunidad · mismo protocolo completo</span>
          <h1>Seguir solo con 7 días puede abrir la puerta. El problema es no saber qué hacer si esa puerta realmente se abre.</h1>
          <p>
            No redujimos páginas, acceso ni garantía. Solo redujimos el precio una única vez para que no tengas que improvisar justo cuando una conversación vuelva a aparecer.
          </p>
          <div className="r30-downsell__proofline">
            <span>50 páginas</span><span>30 acciones</span><span>4 revisiones</span>
          </div>
          <OfferActions acceptHref={acceptHref} declineHref={declineHref} downsell />
        </div>
        <div className="r30-downsell__visual"><ProductMockup /></div>
      </section>
      <ScenarioStories compact />
    </>
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
      {isDownsell ? (
        <Downsell acceptHref={acceptHref} declineHref={declineHref} />
      ) : (
        <>
          <UpsellHero acceptHref={acceptHref} declineHref={declineHref} />
          <PainScene />
          <Weeks />
          <ProductProof />
          <Details />
          <ScenarioStories />
          <Guarantee />
          <FinalOffer acceptHref={acceptHref} declineHref={declineHref} />
        </>
      )}
      <ReconquistaFooter />
    </main>
  );
}
