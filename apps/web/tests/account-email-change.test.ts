import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("la troca de e-mail exige sessão, senha, mesma origem e payload limitado", () => {
  const route = readFileSync(
    new URL("../src/app/api/account/email/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(route, /FEATURE_AUTH/);
  assert.match(route, /isSameOriginMutation/);
  assert.match(route, /MAX_BODY_BYTES = 2048/);
  assert.match(route, /await currentIdentity\(\)/);
  assert.match(
    route,
    /verifier\.verify\([\s\S]*identity\.email,[\s\S]*parsed\.data\.password/,
  );
  assert.match(route, /client\.auth\.updateUser/);
  assert.match(route, /emailRedirectTo/);
  assert.match(route, /confirmation_required/);
});

test("o perfil só muda depois da confirmação do Auth e registra auditoria sem e-mail", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202607300016_secure_email_change.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(migration, /after update of email on auth\.users/);
  assert.match(migration, /when \(old\.email is distinct from new\.email\)/);
  assert.match(migration, /set[\s\S]*email = lower\(new\.email\)/);
  assert.match(migration, /identity\.email_changed/);
  assert.doesNotMatch(migration, /jsonb_build_object[\s\S]*new\.email/);
  assert.match(
    migration,
    /revoke all on function public\.sync_profile_email_from_auth\(\)[\s\S]*from public, anon, authenticated/,
  );
});

test("o ambiente local exige confirmação dupla e permite o callback do perfil", () => {
  const config = readFileSync(
    new URL("../../../supabase/config.toml", import.meta.url),
    "utf8",
  );

  assert.match(config, /double_confirm_changes = true/);
  assert.match(
    config,
    /auth\/confirm\?next=%2Fperfil%3Femail%3Dconfirmed/,
  );
});
