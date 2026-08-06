import Image from "next/image";
import Link from "next/link";

import type { OfferProduct } from "@/features/upsells/offer-page-config";
import { OfferBrand } from "@/features/upsells/offer-product-proof";

type PostPurchaseHeaderProps = { product: OfferProduct };

export function PostPurchaseHeader({
  product,
}: PostPurchaseHeaderProps) {
  return (
    <header className="pp-masthead">
      <div className="pp-masthead__brands">
        <Image
          alt="Haz Que Vuelva"
          className="pp-site-logo"
          height={392}
          priority
          src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
          width={1451}
        />
        <OfferBrand product={product} />
      </div>
      <span className="pp-masthead__context">COMPRA APROBADA</span>
    </header>
  );
}

export function PostPurchaseFooter() {
  const legalRegistration =
    process.env.NEXT_PUBLIC_VERTICAL_PARTNERS_CNPJ?.trim();

  return (
    <footer
      className="quiz-sales-footer pp-site-footer"
      data-legal-footer
    >
      <Image
        alt="Haz Que Vuelva"
        className="quiz-logo quiz-logo--step"
        height={392}
        loading="lazy"
        src="/images/brand/haz-que-vuelva-logo-heart-primary-v1.webp"
        width={1451}
      />
      <nav aria-label="Información legal">
        <Link href="/politica-de-privacidad">Política de privacidad</Link>
        <Link href="/terminos-de-uso">Términos de uso</Link>
      </nav>
      {legalRegistration ? <p>CNPJ {legalRegistration}</p> : null}
      <small>
        © {new Date().getFullYear()} Haz Que Vuelva. Todos los derechos
        reservados.
      </small>
    </footer>
  );
}
