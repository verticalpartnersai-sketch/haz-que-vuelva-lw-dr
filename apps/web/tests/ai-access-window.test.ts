import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608010032_vuelve_ia_conversational_diagnostics.sql",
    import.meta.url,
  ),
  "utf8",
);

test("VUELVE IA expira exactamente 90 días después de la concesión activa más reciente", () => {
  assert.match(migration, /select max\(grant_row\.granted_at\)/);
  assert.match(migration, /access_started_at \+ interval '90 days'/);
  assert.match(migration, /access_days_remaining/);
  assert.match(migration, /now\(\) < access_expires_at/);
});

test("el vencimiento se aplica a conversaciones, respuestas y diagnósticos", () => {
  const guard = /public\.has_current_vuelve_ia_access\(p_member_id\)/g;
  assert.ok((migration.match(guard) ?? []).length >= 5);
  assert.match(migration, /create or replace function public\.start_ai_conversation/);
  assert.match(migration, /create or replace function public\.reserve_ai_generation/);
  assert.match(migration, /create or replace function public\.reserve_ai_diagnostic/);
});

test("las funciones de acceso temporal quedan reservadas al service role", () => {
  assert.match(
    migration,
    /revoke all on function public\.get_vuelve_ia_access_status\(uuid\)[\s\S]*from public, anon, authenticated/,
  );
  assert.match(
    migration,
    /grant execute on function public\.get_vuelve_ia_access_status\(uuid\) to service_role/,
  );
});

test("la interfaz muestra días restantes y un estado vencido sin CTA de compra", () => {
  const modal = readFileSync(
    new URL("../src/features/ai/ai-usage-modal.tsx", import.meta.url),
    "utf8",
  );
  const page = readFileSync(
    new URL("../src/features/ai/ai-page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(modal, /usage\.access_days_remaining/);
  assert.match(modal, /usage\.access_expires_at/);
  assert.match(page, /aiAccess === "expired"/);
  assert.match(page, /El chat y los diagnósticos están bloqueados/);
  assert.doesNotMatch(page, /comprar|checkout|renovar/i);
});

test("el límite de diagnóstico devuelve un contrato 429 estable", () => {
  const route = readFileSync(
    new URL("../src/app/api/ai/diagnostics/route.ts", import.meta.url),
    "utf8",
  );
  const chat = readFileSync(
    new URL("../src/features/ai/ai-chat.tsx", import.meta.url),
    "utf8",
  );

  assert.match(route, /get_ai_usage_status/);
  assert.match(route, /diagnostic_available !== true/);
  assert.match(route, /diagnostic_monthly_limit_reached/);
  assert.match(route, /status: 429/);
  assert.match(chat, /limitReached/);
  assert.match(chat, /kind: limitReached \? "usage-warning"/);
});
