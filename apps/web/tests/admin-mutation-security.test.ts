import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { requireReauthenticationTokenHash } from "../src/modules/admin/application/reauthenticated-operation.ts";
import { AdminReauthenticationRequiredError } from "../src/modules/identity/application/admin-reauthentication.ts";

test("as operações administrativas rejeitam hash ausente ou malformado", () => {
  const validHash = "a".repeat(64);
  assert.equal(requireReauthenticationTokenHash(validHash), validHash);
  assert.throws(
    () => requireReauthenticationTokenHash("token-visivel"),
    AdminReauthenticationRequiredError,
  );
});

test("a migration remove escrita direta e exige reautenticação nas cinco RPCs", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202607300017_admin_mutation_lockdown.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /drop policy if exists "admin manages products"/);
  assert.match(migration, /drop policy if exists "admin manages offers"/);
  assert.match(migration, /drop policy if exists "admin manages prompts"/);
  assert.match(
    migration,
    /revoke insert, update, delete on public\.products from authenticated/,
  );
  assert.match(
    migration,
    /revoke insert, update, delete on public\.external_offers from authenticated/,
  );
  assert.match(migration, /create policy "admin reads offers"/);
  assert.match(migration, /create policy "admin reads prompts"/);

  for (const operation of [
    "grant_manual_access",
    "revoke_access_grant",
    "transfer_purchase",
    "create_ai_prompt_draft",
    "publish_ai_prompt",
  ]) {
    assert.match(
      migration,
      new RegExp(
        `revoke all on function public\\.${operation}\\([\\s\\S]*?from public, anon, authenticated`,
      ),
    );
    assert.match(
      migration,
      new RegExp(`${operation}_with_reauthentication`),
    );
  }

  assert.equal(
    migration.match(
      /perform public\.consume_admin_reauthentication\(p_reauth_token_hash\)/g,
    )?.length,
    5,
  );
});

test("os casos de uso chamam somente as RPCs protegidas", () => {
  const sources = [
    "grant-manual-access.ts",
    "revoke-access.ts",
    "transfer-purchase.ts",
    "manage-ai-prompt.ts",
  ].map((file) =>
    readFileSync(
      new URL(`../src/modules/admin/application/${file}`, import.meta.url),
      "utf8",
    ),
  );

  for (const source of sources) {
    assert.match(source, /requireReauthenticationTokenHash/);
    assert.match(source, /_with_reauthentication/);
    assert.match(source, /p_reauth_token_hash/);
  }
});
