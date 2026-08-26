import Image from "next/image";
import type { RefObject } from "react";

import type { OfferCopy } from "./offer-contracts";

export function OfferPricingCard({
  copy,
  onCheckout,
  position,
  sectionRef,
}: {
  copy: OfferCopy;
  onCheckout: (position: string) => void;
  position: "offer_primary" | "offer_repeat";
  sectionRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <section className="offer-v2-pricing" id={position === "offer_primary" ? "pricing-anchor" : undefined} ref={sectionRef}>
      <span className="offer-v2-eyebrow">OFERTA ESPECIAL</span>
      <h2>{copy.locale === "pt" ? "Este é o seu plano personalizado para reconquistar o seu ex" : "Este es tu plan personalizado para reconquistar a tu ex"}</h2>
      <Image
        alt={copy.locale === "pt"
          ? "Haz Que Vuelva e materiais incluídos"
          : "Haz Que Vuelva y materiales incluidos"}
        className="offer-v2-pricing__bundle"
        height={960}
        loading="lazy"
        sizes="(max-width: 700px) calc(100vw - 34px), 700px"
        src="/images/quiz/offer/product-bundle-mockup-transparent-v2.webp"
        width={1440}
      />
      <ul className="offer-v2-pricing__stack">
        <li>
          <span aria-hidden="true">✅</span>
          <span>{copy.locale === "pt" ? "Plano principal" : "Plan principal"}: <strong>Haz Que Vuelva</strong></span>
        </li>
        {copy.bonuses.map((bonus, index) => (
          <li key={bonus.id}>
            <span aria-hidden="true">✅</span>
            <span>{copy.locale === "pt" ? "Bônus" : "Bono"} #{index + 1}: <strong>{bonus.name}</strong></span>
          </li>
        ))}
        <li>
          <span aria-hidden="true">✅</span>
          <span>{copy.access}</span>
        </li>
      </ul>
      <p className="offer-v2-pricing__compare">{copy.locale === "pt" ? "Antes" : "Antes"}: <s>{copy.compareAt}</s></p>
      <p className="offer-v2-pricing__lead">{copy.locale === "pt" ? "POR APENAS" : "POR SOLO"}</p>
      <strong className="offer-v2-pricing__price">{copy.price}</strong>
      <small>{copy.payment}</small>
      <button className="offer-v2-cta" onClick={() => onCheckout(position)} type="button">{copy.cta}</button>
      <p className="offer-v2-secure">🔒 {copy.locale === "pt" ? "Pagamento seguro e protegido" : "Pago seguro y protegido"}</p>
    </section>
  );
}
