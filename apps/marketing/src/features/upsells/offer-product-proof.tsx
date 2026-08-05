import Image from "next/image";

import type { OfferProduct } from "@/features/upsells/offer-page-config";

const reconquistaPages = [
  "/images/upsells/reconquista-30/pages/gate.webp",
  "/images/upsells/reconquista-30/pages/day-7.webp",
  "/images/upsells/reconquista-30/pages/reciprocity-board.webp",
  "/images/upsells/reconquista-30/pages/final-decision.webp",
];

export function OfferBrand({ product }: { product: OfferProduct }) {
  const isReconquista = product === "reconquista";
  return (
    <div className="pp-brand">
      <Image
        alt={isReconquista ? "Reconquista 30™" : "VUELVE IA™"}
        height={300}
        loading="eager"
        sizes="72px"
        src={
          isReconquista
            ? "/images/upsells/reconquista-30/brand-transparent-light-v1.png"
            : "/images/upsells/vuelve-ia/brand-transparent-light-v1.png"
        }
        width={300}
      />
      <span>{isReconquista ? "RECONQUISTA 30™" : "VUELVE IA™"}</span>
    </div>
  );
}

function ReconquistaProof() {
  return (
    <figure className="pp-product pp-product--reconquista">
      <Image
        alt="Libro digital y paneles reales de Reconquista 30"
        className="pp-product__bundle"
        height={916}
        loading="lazy"
        sizes="(max-width: 767px) 92vw, 620px"
        src="/images/upsells/reconquista-30/product-bundle-mockup-v1.png"
        width={1717}
      />
      <div className="pp-product__pages" aria-label="Páginas reales del protocolo">
        {reconquistaPages.map((src) => (
          <Image
            alt=""
            height={1020}
            key={src}
            loading="lazy"
            sizes="(max-width: 767px) 24vw, 130px"
            src={src}
            width={719}
          />
        ))}
      </div>
    </figure>
  );
}

function VuelveProof() {
  return (
    <figure className="pp-product pp-product--vuelve">
      <div className="pp-product__desktop">
        <span aria-hidden="true"><i /><i /><i /></span>
        <Image
          alt="Conversación real organizada por VUELVE IA"
          height={1000}
          loading="lazy"
          sizes="(max-width: 767px) 90vw, 650px"
          src="/images/upsells/vuelve-ia/member-ai-conversation-desktop-v2.png"
          width={1384}
        />
      </div>
      <div className="pp-product__phone">
        <Image
          alt="Vista móvil de VUELVE IA"
          height={780}
          loading="lazy"
          sizes="140px"
          src="/images/upsells/vuelve-ia/member-ai-conversation-mobile-v2.png"
          width={390}
        />
      </div>
    </figure>
  );
}

export function OfferProductProof({ product }: { product: OfferProduct }) {
  return product === "reconquista" ? <ReconquistaProof /> : <VuelveProof />;
}
