import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { test } from "node:test";
import { promisify } from "node:util";

const executeFile = promisify(execFile);
const script = new URL("../../../scripts/configure-cloudflare-rum.mjs", import.meta.url);
const zoneId = "a".repeat(32);
const ruleRef = "hqv_disable_members_rum";

function environment(apiBase: string): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    PATH: process.env.PATH,
    CLOUDFLARE_API_TOKEN: "synthetic-cloudflare-token-for-tests",
    CLOUDFLARE_ZONE_ID: zoneId,
    HQV_CLOUDFLARE_API_BASE: apiBase,
  };
}

async function run(
  arguments_: string[],
  env: NodeJS.ProcessEnv,
) {
  try {
    const result = await executeFile(process.execPath, [script.pathname, ...arguments_], {
      encoding: "utf8",
      env,
    });
    return { status: 0, stderr: result.stderr, stdout: result.stdout };
  } catch (error) {
    const failure = error as { code?: number; stderr?: string; stdout?: string };
    return {
      status: failure.code ?? 1,
      stderr: failure.stderr ?? "",
      stdout: failure.stdout ?? "",
    };
  }
}

test("Cloudflare RUM helper exposes help without credentials", async () => {
  const result = await run(["--help"], { NODE_ENV: "test", PATH: process.env.PATH });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Plan mode is read-only/);
});

test("Cloudflare RUM execution rejects an inexact confirmation before network", async () => {
  const result = await run(["--execute"], {
    ...environment("http://127.0.0.1:1"),
    HQV_CLOUDFLARE_RULE_CONFIRM: "wrong",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /set HQV_CLOUDFLARE_RULE_CONFIRM exactly/);
});

test("Cloudflare RUM plan is read-only and targets only the members host", async () => {
  const methods: string[] = [];
  const server = createServer((request, response) => {
    methods.push(request.method ?? "");
    response.setHeader("Content-Type", "application/json");
    if (request.url === `/zones/${zoneId}`) {
      response.end(JSON.stringify({ success: true, result: { id: zoneId, name: "hazquevuelva.site" } }));
      return;
    }
    response.end(JSON.stringify({ success: true, result: [] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    const result = await run([], environment(`http://127.0.0.1:${address.port}`));
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Plan only\. No Cloudflare state was changed/);
    assert.deepEqual(methods, ["GET", "GET"]);
  } finally {
    server.close();
  }
});

test("Cloudflare RUM execution appends one rule and preserves existing rules", async () => {
  const existingRule = { id: "existing", ref: "keep_me", action: "set_config" };
  const targetRule = {
    id: "target",
    ref: ruleRef,
    action: "set_config",
    action_parameters: { disable_rum: true },
    expression: '(http.host eq "miembros.hazquevuelva.site")',
    enabled: true,
  };
  const requests: Array<{ method?: string; url?: string; body: string }> = [];
  let targetCreated = false;
  const server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => { body += chunk; });
    request.on("end", () => {
      requests.push({ method: request.method, url: request.url, body });
      response.setHeader("Content-Type", "application/json");
      if (request.url === `/zones/${zoneId}`) {
        response.end(JSON.stringify({ success: true, result: { id: zoneId, name: "hazquevuelva.site" } }));
      } else if (request.url === `/zones/${zoneId}/rulesets`) {
        response.end(JSON.stringify({ success: true, result: [{ id: "ruleset", kind: "zone", phase: "http_config_settings" }] }));
      } else if (request.url === `/zones/${zoneId}/rulesets/ruleset`) {
        response.end(JSON.stringify({ success: true, result: { id: "ruleset", rules: targetCreated ? [existingRule, targetRule] : [existingRule] } }));
      } else if (request.url === `/zones/${zoneId}/rulesets/ruleset/rules`) {
        targetCreated = true;
        response.end(JSON.stringify({ success: true, result: { id: "ruleset" } }));
      } else {
        response.statusCode = 404;
        response.end(JSON.stringify({ success: false, errors: [{ message: "unexpected" }] }));
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    const result = await run(["--execute"], {
      ...environment(`http://127.0.0.1:${address.port}`),
      HQV_CLOUDFLARE_RULE_CONFIRM: `DISABLE_RUM:miembros.hazquevuelva.site:${zoneId}`,
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Applied and verified/);
    const write = requests.find((request) => request.method === "POST" && request.url?.endsWith("/rules"));
    assert.ok(write);
    assert.equal(JSON.parse(write.body).ref, ruleRef);
    assert.equal(requests.some((request) => request.method === "PUT"), false);
  } finally {
    server.close();
  }
});

test("Cloudflare RUM helper refuses a different zone", async () => {
  let writeObserved = false;
  const server = createServer((request, response) => {
    if (request.method !== "GET") writeObserved = true;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ success: true, result: { id: zoneId, name: "example.com" } }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    const result = await run([], environment(`http://127.0.0.1:${address.port}`));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /zone must resolve exactly to hazquevuelva\.site/);
    assert.equal(writeObserved, false);
  } finally {
    server.close();
  }
});
