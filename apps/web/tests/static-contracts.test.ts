import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { navigationForRole } from "../src/features/shell/navigation.ts";
import {
  featureFlags,
  getProductBySlug,
  products,
} from "../src/mocks/data.ts";
import type { Product } from "../src/mocks/types.ts";

test("la navegación administrativa solo existe para el escenario admin", () => {
  assert.equal(
    navigationForRole("member").some((item) => item.href === "/administracion"),
    false,
  );
  assert.equal(
    navigationForRole("admin").some((item) => item.href === "/administracion"),
    true,
  );
});

test("el catálogo mock cubre acceso disponible y bloqueado", () => {
  assert.ok(products.some((product) => product.accessState === "available"));
  assert.ok(products.some((product) => product.accessState === "locked"));
  assert.ok(products.every((product) => product.isMock));
});

test("el contrato de producto admite acceso todavía no resuelto", () => {
  const product: Product = {
    ...products[0],
    accessState: "unknown",
  };
  assert.equal(product.accessState, "unknown");
});

test("la IA no trata acceso desconocido como disponible", () => {
  const aiSource = readFileSync(
    new URL("../src/features/ai/ai-page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(aiSource, /aiAccess === "unknown"/);
  assert.match(aiSource, /<UnknownAi \/>/);
});

test("cada slug público resuelve un producto mock", () => {
  for (const product of products) {
    assert.equal(getProductBySlug(product.slug)?.id, product.id);
  }
});

test("comentarios permanecen ocultos en Gate 3", () => {
  assert.equal(featureFlags.comments, false);
  const detailSource = readFileSync(
    new URL("../src/features/products/product-detail.tsx", import.meta.url),
    "utf8",
  );
  assert.match(detailSource, /featureFlags\.comments/);
});
