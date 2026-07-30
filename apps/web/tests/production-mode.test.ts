import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

test("production mode rejects mock auth and catalog configuration", () => {
  const environment = read("../src/server/config/environment.ts");

  assert.match(environment, /MEMBER_APP_MODE: runtimeMode/);
  assert.match(
    environment,
    /environment\.MEMBER_APP_MODE === "production"/,
  );
  assert.match(
    environment,
    /!environment\.FEATURE_AUTH \|\| !environment\.FEATURE_CONTENT/,
  );
  assert.match(environment, /mock member data is forbidden/);
});

test("the edge and worker layers fail closed before rendering mock data", () => {
  const middleware = read("../src/middleware.ts");
  const worker = read("../worker.ts");

  assert.match(middleware, /productionMode/);
  assert.match(middleware, /pathname === "\/"/);
  assert.match(middleware, /isProtectedPath\(request\.nextUrl\.pathname\)/);
  assert.match(middleware, /member_app_not_configured/);
  assert.match(worker, /productionConfigurationReady/);
  assert.match(worker, /requestUrl\.pathname === "\/healthz"/);
  assert.match(worker, /"X-Request-Id": currentRequestId/);
  assert.match(worker, /"Content-Security-Policy": contentSecurityPolicy/);
  assert.match(worker, /frame-ancestors 'none'/);
  assert.match(worker, /connectSources\.push\(supabaseUrl\.origin\)/);
  assert.match(worker, /member_app_not_configured/);
});

test("local environment templates declare preview mode explicitly", () => {
  assert.match(read("../.env.example"), /^MEMBER_APP_MODE=preview/m);
  assert.match(read("../.dev.vars.example"), /^MEMBER_APP_MODE=preview/m);
});

test("the production Worker owns only the member subdomain and declares required secrets", () => {
  const wrangler = read("../wrangler.jsonc");
  const packageManifest = read("../package.json");

  assert.match(wrangler, /"pattern": "miembros\.hazquevuelva\.site"/);
  assert.match(wrangler, /"custom_domain": true/);
  assert.match(wrangler, /"MEMBER_APP_MODE": "production"/);
  assert.match(wrangler, /"MEMBER_APP_URL": "https:\/\/miembros\.hazquevuelva\.site"/);
  assert.doesNotMatch(wrangler, /"pattern": "hazquevuelva\.site"/);
  assert.match(wrangler, /"SUPABASE_SECRET_KEY"/);
  assert.match(wrangler, /"PERFECT_PAY_WEBHOOK_TOKEN"/);
  assert.match(wrangler, /"WORKER_INTERNAL_SECRET"/);
  assert.match(
    packageManifest,
    /"deploy": "opennextjs-cloudflare build && wrangler deploy --env production"/,
  );
  assert.match(
    packageManifest,
    /"upload": "opennextjs-cloudflare build && wrangler versions upload --env production"/,
  );
  assert.match(
    packageManifest,
    /"check:cloudflare": "opennextjs-cloudflare build && wrangler deploy --dry-run --env production"/,
  );
});

test("Supabase browser settings come from the runtime server instead of build-time substitution", () => {
  const browserClient = read("../src/server/supabase/browser-client.ts");
  const loginPage = read("../src/app/login/page.tsx");

  assert.doesNotMatch(browserClient, /process\.env\.NEXT_PUBLIC_SUPABASE/);
  assert.match(browserClient, /SupabaseBrowserConfiguration/);
  assert.match(loginPage, /supabaseBrowserConfiguration\(config\)/);
  assert.match(loginPage, /supabase=\{/);
});
