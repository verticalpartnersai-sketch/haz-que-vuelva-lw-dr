import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  ReadingProgressAccessDeniedError,
  ReadingProgressValidationError,
  saveReadingProgress,
  type ReadingProgressGateway,
} from "../src/modules/content/application/save-reading-progress.ts";

class FakeReadingProgress implements ReadingProgressGateway {
  saved: Array<{ productCode: string; progressPercent: number }> = [];
  allowed = true;

  async save(input: {
    productCode:
      | "haz_que_vuelva"
      | "21_mensajes"
      | "la_otra"
      | "reconquista_30"
      | "vuelve_ia";
    progressPercent: number;
  }) {
    this.saved.push(input);
    if (!this.allowed) return null;
    return {
      completedAt:
        input.progressPercent === 100 ? "2026-07-30T00:00:00.000Z" : null,
      progressPercent: input.progressPercent,
      updatedAt: "2026-07-30T00:00:00.000Z",
    };
  }
}

test("guarda un porcentaje válido para un producto canónico", async () => {
  const gateway = new FakeReadingProgress();
  const result = await saveReadingProgress({
    gateway,
    productCode: "haz_que_vuelva",
    progressPercent: 65,
  });

  assert.equal(result.progressPercent, 65);
  assert.deepEqual(gateway.saved, [
    { productCode: "haz_que_vuelva", progressPercent: 65 },
  ]);
});

test("rechaza producto desconocido, decimales y porcentajes fuera del rango", async () => {
  const gateway = new FakeReadingProgress();
  for (const input of [
    { productCode: "inventado", progressPercent: 20 },
    { productCode: "vuelve_ia", progressPercent: 20 },
    { productCode: "haz_que_vuelva", progressPercent: 10.5 },
    { productCode: "haz_que_vuelva", progressPercent: 101 },
  ]) {
    await assert.rejects(
      saveReadingProgress({ gateway, ...input }),
      ReadingProgressValidationError,
    );
  }
  assert.deepEqual(gateway.saved, []);
});

test("no expone si el producto existe cuando falta entitlement", async () => {
  const gateway = new FakeReadingProgress();
  gateway.allowed = false;

  await assert.rejects(
    saveReadingProgress({
      gateway,
      productCode: "haz_que_vuelva",
      progressPercent: 20,
    }),
    ReadingProgressAccessDeniedError,
  );
});

test("la migración sólo permite lectura directa y escritura por RPC con entitlement", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202607300018_member_reading_progress.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /enable row level security/);
  assert.match(migration, /member_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /from public\.effective_entitlements/);
  assert.match(migration, /security definer/);
  assert.match(
    migration,
    /grant execute on function public\.set_member_reading_progress/,
  );
  assert.doesNotMatch(
    migration,
    /grant (?:insert|update|delete)[\s\S]*member_reading_progress[\s\S]*authenticated/,
  );
});

test("la ruta exige origen, límite de cuerpo, identidad y feature flag", () => {
  const route = readFileSync(
    new URL(
      "../src/app/api/products/[productCode]/progress/route.ts",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(route, /FEATURE_CONTENT/);
  assert.match(route, /isSameOriginMutation/);
  assert.match(route, /MAX_BODY_BYTES/);
  assert.match(route, /currentIdentity/);
  assert.match(route, /Cache-Control": "no-store"/);
});
