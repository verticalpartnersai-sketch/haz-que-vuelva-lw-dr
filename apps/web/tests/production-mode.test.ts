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

test("the Perfect Pay authentication probe cannot project payment state", () => {
  const route = read("../src/app/api/webhooks/perfect-pay/route.ts");

  assert.match(route, /AUTH_PROBE_HEADER = "x-hqv-auth-probe"/);
  assert.match(
    route,
    /secureTokenMatches[\s\S]*request\.headers\.get\(AUTH_PROBE_HEADER\)[\s\S]*status: 204[\s\S]*normalizePerfectPayPayloads/,
  );
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
  assert.match(wrangler, /"FEATURE_PAYMENTS": "true"/);
  assert.match(wrangler, /"FEATURE_VUELVE_IA": "false"/);
  assert.match(wrangler, /"AGENT_SERVICE_BINDING": "true"/);
  assert.match(wrangler, /"binding": "VUELVE_AGENT_SERVICE"/);
  assert.match(wrangler, /"service": "haz-que-vuelva-agent"/);
  assert.doesNotMatch(wrangler, /haz-que-vuelva-agent\.verticalpartnersai\.workers\.dev/);
  assert.match(wrangler, /"PERFECT_PAY_WEBHOOK_TOKEN"/);
  assert.match(wrangler, /"RESEND_API_KEY"/);
  assert.match(wrangler, /"AGENT_INTERNAL_SECRET"/);
  assert.match(wrangler, /acceso@mail\.hazquevuelva\.site/);
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

test("VUELVE IA uses a private service binding and limits request bodies", () => {
  const route = read("../src/app/api/ai/generations/stream/route.ts");
  const agentWorker = read("../../agent/worker/index.ts");
  const agentWrangler = read("../../agent/wrangler.jsonc");

  assert.match(route, /getCloudflareContext/);
  assert.match(route, /VUELVE_AGENT_SERVICE/);
  assert.match(route, /MAX_BODY_BYTES = 128 \* 1024/);
  assert.match(route, /request_too_large/);
  assert.ok(
    route.indexOf("currentIdentity()") <
      route.indexOf("readBoundedJsonBody(request"),
    "authentication must happen before the request body is parsed",
  );
  assert.match(agentWrangler, /"FEATURE_GENERATION": "false"/);
  assert.match(agentWrangler, /"workers_dev": false/);
  assert.match(agentWrangler, /"preview_urls": false/);
  assert.ok(
    agentWorker.indexOf("hasValidCredential") <
      agentWorker.indexOf('getContainer(env.VUELVE_AGENT, "primary")'),
    "the edge credential must be checked before the container is invoked",
  );
});

test("the PerfectPay webhook incrementally limits request bodies", () => {
  const route = read("../src/app/api/webhooks/perfect-pay/route.ts");

  assert.match(route, /MAX_BODY_BYTES = 64 \* 1024/);
  assert.match(route, /readBoundedJsonBody\(request, MAX_BODY_BYTES\)/);
  assert.match(route, /body\.reason === "too_large"/);
  assert.doesNotMatch(route, /request\.text\(\)/);
});
