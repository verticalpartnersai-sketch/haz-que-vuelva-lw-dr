import assert from "node:assert/strict";
import test from "node:test";

import { offerSectionIds } from "../src/features/offer/offer-contracts.ts";
import { offerCopyEs } from "../src/features/offer/offer-copy-es.ts";
import { offerCopyPt } from "../src/features/offer/offer-copy-pt.ts";

test("defines the 15 benchmark offer sections in exact order", () => {
  assert.deepEqual(offerSectionIds, [
    "timer",
    "before_after",
    "emotional_diagnosis",
    "probability",
    "urgency",
    "product_reveal",
    "bonus_toggle",
    "pricing",
    "rating",
    "benefits",
    "statistics",
    "testimonials",
    "pricing_repeat",
    "guarantee",
    "faq",
  ]);
});

test("keeps commercial terms and stack fixed", () => {
  assert.equal(offerCopyEs.price, "US$8,49");
  assert.equal(offerCopyEs.compareAt, "US$16,98");
  assert.equal(offerCopyEs.guaranteeDays, 7);
  assert.equal(offerCopyEs.timerSeconds, 600);
  assert.equal(offerCopyEs.bonuses.length, 3);
  assert.equal(offerCopyEs.testimonials.length, 4);
  assert.equal(offerCopyEs.faq.length, 4);
  assert.doesNotMatch(JSON.stringify(offerCopyEs), /Diario de Reconquista/i);
});

test("keeps Spanish and Portuguese offer structures aligned", () => {
  assert.deepEqual(
    offerCopyEs.bonuses.map((item) => item.id),
    offerCopyPt.bonuses.map((item) => item.id),
  );
  assert.deepEqual(
    offerCopyEs.testimonials.map((item) => item.id),
    offerCopyPt.testimonials.map((item) => item.id),
  );
  assert.equal(offerCopyPt.price, offerCopyEs.price);
  assert.equal(offerCopyPt.compareAt, offerCopyEs.compareAt);
  assert.equal(offerCopyPt.guaranteeDays, offerCopyEs.guaranteeDays);
});

test("uses the approved Spanish product names", () => {
  assert.deepEqual(
    offerCopyEs.bonuses.map((item) => item.name),
    [
      "Kit de Emergencia de la Mujer Rechazada",
      "Diccionario de los Mensajes de Él",
      "7 Señuelos Emocionales que Funcionan",
    ],
  );
});

test("preserves the benchmark landing argument instead of rewriting it", () => {
  assert.equal(
    offerCopyEs.probability.label,
    "Probabilidad de Éxito",
  );
  assert.equal(
    offerCopyEs.product.headline,
    "La Técnica Más Científicamente Comprobada Para Tener a Tu Exnovio de Vuelta en Tus Brazos",
  );
  assert.equal(
    offerCopyEs.product.body[0],
    "Solo necesitas seguir el plan con precisión, y te sorprenderá la rapidez con la que él se volverá obsesionado con la idea de estar contigo.",
  );
  assert.equal(
    offerCopyEs.benefits[0],
    "Técnicas extremadamente poderosas y comprobadas para activar su oxitocina, personalizadas según tu perfil de relación.",
  );
  assert.equal(
    offerCopyEs.statisticsHeading,
    "Haz que tu ex ruegue por tu atención con nuestro Plan Personalizado para Reconquistar a Tu Ex",
  );
  assert.equal(offerCopyEs.rating.value, "4,9 de 5");
  assert.deepEqual(
    offerCopyEs.faq.map((item) => item.question),
    [
      "¿Por qué debo elegir este plan?",
      "¿Cómo puedo beneficiarme de este plan?",
      "¿Qué necesito para tener éxito?",
      "¿Y si me cuesta mantener la motivación?",
    ],
  );
  assert.equal("closing" in offerCopyEs, false);
  assert.equal("footerDisclaimer" in offerCopyEs, false);
});
