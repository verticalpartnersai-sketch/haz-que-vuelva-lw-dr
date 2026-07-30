import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Google OAuth uses the Supabase PKCE callback and preserves a safe next path", () => {
  const loginForm = readFileSync(
    new URL("../src/features/auth/login-form.tsx", import.meta.url),
    "utf8",
  );
  const callback = readFileSync(
    new URL("../src/app/auth/confirm/route.ts", import.meta.url),
    "utf8",
  );

  assert.match(loginForm, /signInWithOAuth/);
  assert.match(loginForm, /provider: "google"/);
  assert.match(loginForm, /new URL\("\/auth\/confirm", window\.location\.origin\)/);
  assert.match(loginForm, /callback\.searchParams\.set\("next", nextPath\)/);
  assert.match(callback, /exchangeCodeForSession/);
  assert.match(callback, /!value\.startsWith\("\/\/"\)/);
});

test("OAuth is explicit, disabled by default and local Google secrets stay outside git", () => {
  const environment = readFileSync(
    new URL("../src/server/config/environment.ts", import.meta.url),
    "utf8",
  );
  const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const config = readFileSync(
    new URL("../../../supabase/config.toml", import.meta.url),
    "utf8",
  );

  assert.match(environment, /NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: booleanString/);
  assert.match(example, /NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false/);
  assert.match(config, /\[auth\.external\.google\]/);
  assert.match(config, /enabled = false/);
  assert.match(
    config,
    /secret = "env\(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET\)"/,
  );
});
