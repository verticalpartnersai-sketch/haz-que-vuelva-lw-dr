import Image from "next/image";

import { ContextDecisionFlow, ReciprocitySignal, SecondLossCycle } from "@/features/upsells/offer-diagrams";
import type { OfferRoute } from "@/features/upsells/offer-copy";
import { OfferProductProof } from "@/features/upsells/offer-product-proof";

type EditorialImageProps = {
  alt: string;
  portrait?: boolean;
  preload?: boolean;
  src: string;
};

function EditorialImage({ alt, portrait = false, preload = false, src }: EditorialImageProps) {
  return (
    <figure className={"pp-editorial" + (portrait ? " pp-editorial--portrait" : "")}>
      <Image
        alt={alt}
        fill
        loading={preload ? "eager" : "lazy"}
        preload={preload}
        sizes={portrait ? "(max-width: 767px) 92vw, 430px" : "(max-width: 767px) 100vw, 720px"}
        src={src}
      />
    </figure>
  );
}

function GuaranteeSeal() {
  return (
    <figure className="pp-guarantee-seal">
      <Image
        alt="Sello de garantía de siete días de Haz Que Vuelva"
        height={640}
        loading="lazy"
        sizes="(max-width: 767px) 220px, 280px"
        src="/images/quiz/offer/guarantee-seal-transparent-v2.webp"
        width={640}
      />
    </figure>
  );
}

export function hasOfferSectionVisual(route: OfferRoute, anchor: string) {
  if (anchor === "hero") return true;
  if (anchor.startsWith("TIENES 7 DÍAS")) return true;
  if (route === "up1") {
    return /^(LA MAYORÍA|TAL VEZ|EL MECANISMO|AHORA PUEDES)/.test(anchor);
  }
  if (route === "d1") return /^(EL PROBLEMA|NO NECESITAS)/.test(anchor);
  if (route === "up2") {
    return /^(ASÍ FUNCIONA|IMAGINA|ES COMO|TODO LO QUE RECIBES)/.test(anchor);
  }
  return /^(PORQUE TENER|NO RECIBES|TODO LO QUE RECIBES)/.test(anchor);
}

export function OfferSectionVisual({ route, anchor }: { route: OfferRoute; anchor: string }) {
  if (anchor.startsWith("TIENES 7 DÍAS")) return <GuaranteeSeal />;
  if (route === "up1" && anchor === "hero") {
    return (
      <EditorialImage
        alt="Una mujer observa una puerta entreabierta antes de responder un mensaje"
        preload
        src="/images/upsells/generated/up1-second-loss-v1.webp"
      />
    );
  }
  if (route === "up1" && anchor.startsWith("LA MAYORÍA")) return <SecondLossCycle />;
  if ((route === "up1" && anchor.startsWith("TAL VEZ")) || (route === "d1" && anchor.startsWith("EL PROBLEMA"))) {
    return (
      <EditorialImage
        alt="Una mano sostiene el teléfono antes de abrir un nuevo mensaje"
        portrait
        src="/images/upsells/generated/up1-message-reopens-v1.webp"
      />
    );
  }
  if (route === "up1" && anchor.startsWith("EL MECANISMO")) {
    return (
      <div className="pp-enhancement-stack">
        <EditorialImage
          alt="Dos personas aportan partes iguales a un mismo camino"
          src="/images/upsells/generated/up1-reciprocity-v1.webp"
        />
        <ReciprocitySignal />
      </div>
    );
  }
  if (
    (route === "up1" && anchor.startsWith("AHORA PUEDES")) ||
    (route === "d1" && anchor.startsWith("NO NECESITAS"))
  ) return <OfferProductProof product="reconquista" />;
  if (route === "d1" && anchor === "hero") {
    return <OfferProductProof preload product="reconquista" />;
  }

  if ((route === "up2" || route === "d2") && anchor === "hero") {
    return <OfferProductProof preload product="vuelve" />;
  }
  if ((route === "up2" && anchor.startsWith("ASÍ FUNCIONA")) || (route === "d2" && anchor.startsWith("NO RECIBES"))) {
    return <ContextDecisionFlow />;
  }
  if ((route === "up2" && anchor.startsWith("IMAGINA")) || (route === "d2" && anchor.startsWith("PORQUE TENER"))) {
    return (
      <EditorialImage
        alt="Un nuevo mensaje junto a un cuaderno abierto y una taza de té"
        src="/images/upsells/generated/up2-new-message-v1.webp"
      />
    );
  }
  if (route === "up2" && anchor.startsWith("ES COMO")) {
    return (
      <EditorialImage
        alt="Fragmentos de conversación se organizan en una decisión clara"
        src="/images/upsells/generated/up2-context-decision-v1.webp"
      />
    );
  }
  if ((route === "up2" || route === "d2") && anchor.startsWith("TODO LO QUE RECIBES")) {
    return <OfferProductProof product="vuelve" />;
  }

  return null;
}
