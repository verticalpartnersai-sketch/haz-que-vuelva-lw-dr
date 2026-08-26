import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chrome = readFileSync(
  new URL("../src/features/upsells/postpurchase-chrome.tsx", import.meta.url),
  "utf8",
);
const up1 = readFileSync(
  new URL("../content/upsells/up1-reconquista-30.es.part-1.md", import.meta.url),
  "utf8",
);
const up2 = readFileSync(
  new URL("../content/upsells/up2-vuelve-ia.es.md", import.meta.url),
  "utf8",
);

test("public upsell pages use a transaction-neutral masthead", () => {
  assert.match(chrome, /OFERTA COMPLEMENTARIA DISPONIBLE/);
  assert.doesNotMatch(chrome, /COMPRA APROBADA/);
});

test("UP1 conditions access on actual payment approval", () => {
  assert.match(up1, /^# TU SIGUIENTE DECISIÓN YA ESTÁ DISPONIBLE/m);
  assert.match(up1, /Si tu pago fue aprobado/);
  assert.doesNotMatch(up1, /TU COMPRA FUE APROBADA/);
});

test("UP2 does not claim Reconquista 30 was added without transaction proof", () => {
  assert.match(up2, /^# TU SIGUIENTE DECISIÓN YA ESTÁ DISPONIBLE/m);
  assert.match(up2, /Si tu pedido anterior fue aprobado/);
  assert.doesNotMatch(up2, /ACABAS DE AÑADIR RECONQUISTA 30/);
});
