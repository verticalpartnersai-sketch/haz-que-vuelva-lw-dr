import type { OfferRoute } from "@/features/upsells/offer-copy";

export type OfferProduct = "reconquista" | "vuelve";

type OfferPageConfig = {
  product: OfferProduct;
  variant: "upsell" | "downsell";
  brandLabel: string;
  anchors: readonly string[];
};

export const offerPageConfig: Record<OfferRoute, OfferPageConfig> = {
  up1: {
    product: "reconquista",
    variant: "upsell",
    brandLabel: "Reconquista 30™",
    anchors: [
      "LA MAYORÍA DE LAS MUJERES SE PREPARA PARA HACER QUE ÉL REGRESE.",
      "TAL VEZ YA VIVISTE ESTO UNA VEZ.",
      "HAY UNA FORMA DISTINTA DE VIVIR LOS PRÓXIMOS 30 DÍAS",
      "EL MECANISMO QUE EVITA LA SEGUNDA PÉRDIDA",
      "POR ESO “SER NATURAL” NO ES SUFICIENTE AHORA",
      "“¿Y SI IR DESPACIO HACE QUE OTRA MUJER SE ADELANTE?”",
      "PIENSA EN LO QUE REALMENTE ESTÁ EN JUEGO",
      "AHORA PUEDES PROTEGER LOS 30 DÍAS QUE VIENEN DESPUÉS DE LA APERTURA",
      "TODO LO QUE RECIBES AHORA",
      "TIENES 7 DÍAS PARA ABRIRLO, LEERLO Y DECIDIR",
      "ANTES DE DECIDIR, RESPONDE CON SINCERIDAD",
    ],
  },
  d1: {
    product: "reconquista",
    variant: "downsell",
    brandLabel: "Reconquista 30™",
    anchors: [
      "RECIBES LA MISMA VERSIÓN COMPLETA. SOLO CAMBIA EL PRECIO.",
      "EL PROBLEMA NO TERMINA CUANDO ÉL VUELVE A ESCRIBIR",
      "NO NECESITAS IMPROVISAR LOS PRÓXIMOS 30 DÍAS",
      "TODO LO QUE RECIBES POR US$5,00",
      "TIENES 7 DÍAS PARA ABRIRLO, LEERLO Y DECIDIR",
    ],
  },
  up2: {
    product: "vuelve",
    variant: "upsell",
    brandLabel: "VUELVE IA™",
    anchors: [
      "RECONQUISTA 30™ TE ENTREGA LA RUTA. VUELVE IA™ TE AYUDA CUANDO LA VIDA REAL SE SALE DE LA RUTA.",
      "ASÍ FUNCIONA EN TU CASO REAL",
      "IMAGINA TENER ESTA AYUDA CUANDO SU NOMBRE APAREZCA EN TU PANTALLA",
      "ES COMO TENER UNA SEGUNDA CABEZA CUANDO LA TUYA ESTÁ LLENA DE MIEDO",
      "“¿POR QUÉ NO USAR UNA IA GRATUITA?”",
      "“NINGUNA IA PUEDE SABER LO QUE ÉL SIENTE”",
      "TODO LO QUE RECIBES DURANTE 90 DÍAS",
      "AÑADE VUELVE IA™ AHORA POR US$19,90",
      "TIENES 7 DÍAS PARA COMPROBAR SI ESTA AYUDA ES PARA TI",
    ],
  },
  d2: {
    product: "vuelve",
    variant: "downsell",
    brandLabel: "VUELVE IA™",
    anchors: [
      "RECIBES LA MISMA VUELVE IA™ COMPLETA. SOLO CAMBIA EL PRECIO.",
      "PORQUE TENER UNA RUTA NO SIGNIFICA QUE TODAS LAS CONVERSACIONES SERÁN FÁCILES DE ENTENDER",
      "NO RECIBES APENAS UNA RESPUESTA BONITA",
      "“PUEDO USAR UNA IA GRATUITA”",
      "TODO LO QUE RECIBES DURANTE 90 DÍAS",
      "TIENES 7 DÍAS PARA COMPROBAR SI ESTA AYUDA ES PARA TI",
    ],
  },
};

export function sectionTone(anchor: string) {
  if (anchor === "hero") return "hero";
  if (/^TODO LO QUE RECIBES|^AÑADE VUELVE/.test(anchor)) return "offer";
  if (/^TIENES 7 DÍAS/.test(anchor)) return "guarantee";
  if (/^“¿|^“PUEDO|^“NINGUNA/.test(anchor)) return "objection";
  if (/MECANISMO|ASÍ FUNCIONA/.test(anchor)) return "mechanism";
  if (/ANTES DE DECIDIR/.test(anchor)) return "closing";
  return "story";
}
