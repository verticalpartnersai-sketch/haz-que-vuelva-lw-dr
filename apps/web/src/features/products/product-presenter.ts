import type { Product, ProductKind } from "../../mocks/types.ts";
import type { MemberCatalogItem } from "../../modules/catalog/application/list-member-catalog.ts";
import type { ProductCode } from "../../modules/catalog/domain/product.ts";

type ProductPresentation = {
  slug: string;
  eyebrow: string;
  description: string;
  kind: ProductKind;
  coverImage: string;
};

export const productPresentation: Record<ProductCode, ProductPresentation> = {
  haz_que_vuelva: {
    slug: "haz-que-vuelva",
    eyebrow: "Producto principal",
    description:
      "Guía principal en español para acompañar el proceso de reconexión, entregada en PDF.",
    kind: "principal",
    coverImage: "/images/products/haz-que-vuelva.webp",
  },
  "21_mensajes": {
    slug: "21-mensajes-de-reconexion",
    eyebrow: "Complemento",
    description:
      "Complemento editorial en español con 21 mensajes de reconexión, entregado en PDF.",
    kind: "complemento",
    coverImage: "/images/products/21-mensajes-de-reconexion.webp",
  },
  la_otra: {
    slug: "la-otra",
    eyebrow: "Complemento",
    description:
      "Complemento editorial en español para profundizar el contenido principal, entregado en PDF.",
    kind: "complemento",
    coverImage: "/images/products/la-otra.webp",
  },
  reconquista_30: {
    slug: "reconquista-30",
    eyebrow: "Producto adicional",
    description:
      "Producto editorial adicional en español, entregado en PDF.",
    kind: "adicional",
    coverImage: "/images/products/reconquista-30.webp",
  },
  vuelve_ia: {
    slug: "vuelve-ia",
    eyebrow: "Producto adicional",
    description:
      "Acompañamiento conversacional durante 90 días, con 10 respuestas cada 24 horas y un diagnóstico de WhatsApp cada 30 días.",
    kind: "adicional",
    coverImage: "/images/products/vuelve-ia.webp",
  },
};

export function presentMemberCatalog(items: MemberCatalogItem[]): Product[] {
  return items.map((item) => {
    const presentation = productPresentation[item.code];
    return {
      id: item.code,
      slug: presentation.slug,
      name: item.name,
      eyebrow: presentation.eyebrow,
      description: item.description ?? presentation.description,
      accessState: item.entitled ? "available" : "locked",
      kind: presentation.kind,
      coverImage: presentation.coverImage,
      progress: item.entitled ? item.progressPercent : undefined,
    };
  });
}
