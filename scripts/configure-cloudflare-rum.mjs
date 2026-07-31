#!/usr/bin/env node

const EXPECTED_ZONE = "hazquevuelva.site";
const TARGET_HOST = "miembros.hazquevuelva.site";
const TARGET_PHASE = "http_config_settings";
const TARGET_REF = "hqv_disable_members_rum";
const OFFICIAL_API = "https://api.cloudflare.com/client/v4";

function usage() {
  process.stdout.write(`Usage: npm run cloudflare:rum -- [--execute]\n\n`);
  process.stdout.write("Plan mode is read-only. Execution additionally requires:\n");
  process.stdout.write("  CLOUDFLARE_API_TOKEN\n  CLOUDFLARE_ZONE_ID\n");
  process.stdout.write(
    `  HQV_CLOUDFLARE_RULE_CONFIRM='DISABLE_RUM:${TARGET_HOST}:<zone-id>'\n`,
  );
}

function fail(message) {
  throw new Error(`Cloudflare rule refused: ${message}`);
}

function requireEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is required`);
  return value;
}

function parseMode(arguments_) {
  if (arguments_.includes("--help") || arguments_.includes("-h")) {
    usage();
    process.exit(0);
  }
  if (arguments_.length === 0) return false;
  if (arguments_.length === 1 && arguments_[0] === "--execute") return true;
  fail(`unknown arguments: ${arguments_.join(" ")}`);
}

function apiError(payload, status) {
  const messages = Array.isArray(payload?.errors)
    ? payload.errors
        .map((error) => error?.message)
        .filter((message) => typeof message === "string")
        .slice(0, 3)
    : [];
  return messages.length > 0
    ? `Cloudflare API ${status}: ${messages.join("; ")}`
    : `Cloudflare API returned HTTP ${status}`;
}

function targetRule() {
  return {
    action: "set_config",
    action_parameters: { disable_rum: true },
    description: "Disable automatic Browser Insights on authenticated members",
    enabled: true,
    expression: `(http.host eq "${TARGET_HOST}")`,
    ref: TARGET_REF,
  };
}

function ruleIsExact(rule) {
  return (
    rule?.ref === TARGET_REF &&
    rule?.action === "set_config" &&
    rule?.action_parameters?.disable_rum === true &&
    rule?.expression === `(http.host eq "${TARGET_HOST}")` &&
    rule?.enabled !== false
  );
}

async function main() {
  const execute = parseMode(process.argv.slice(2));
  const zoneId = requireEnvironment("CLOUDFLARE_ZONE_ID");
  if (!/^[a-f0-9]{32}$/.test(zoneId)) {
    fail("CLOUDFLARE_ZONE_ID must be a lowercase 32-character hex ID");
  }

  const expectedConfirmation = `DISABLE_RUM:${TARGET_HOST}:${zoneId}`;
  if (
    execute &&
    process.env.HQV_CLOUDFLARE_RULE_CONFIRM !== expectedConfirmation
  ) {
    fail(`set HQV_CLOUDFLARE_RULE_CONFIRM exactly to ${expectedConfirmation}`);
  }

  const token = requireEnvironment("CLOUDFLARE_API_TOKEN");
  if (token.length < 20) fail("CLOUDFLARE_API_TOKEN is not plausible");

  const apiBase = (process.env.HQV_CLOUDFLARE_API_BASE || OFFICIAL_API).replace(
    /\/$/,
    "",
  );
  if (apiBase !== OFFICIAL_API && process.env.NODE_ENV !== "test") {
    fail("custom API base is allowed only under NODE_ENV=test");
  }

  async function request(method, path, body) {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      signal: AbortSignal.timeout(15_000),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let payload;
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      fail(`Cloudflare API ${response.status} returned invalid JSON`);
    }
    if (!response.ok || payload?.success !== true) {
      fail(apiError(payload, response.status));
    }
    return payload.result;
  }

  const zone = await request("GET", `/zones/${zoneId}`);
  if (zone?.id !== zoneId || zone?.name !== EXPECTED_ZONE) {
    fail(`zone must resolve exactly to ${EXPECTED_ZONE}`);
  }
  process.stdout.write(`Zone verified: ${EXPECTED_ZONE}\n`);

  const rulesets = await request("GET", `/zones/${zoneId}/rulesets`);
  const phaseRulesets = Array.isArray(rulesets)
    ? rulesets.filter(
        (ruleset) =>
          ruleset?.kind === "zone" && ruleset?.phase === TARGET_PHASE,
      )
    : [];
  if (phaseRulesets.length > 1) {
    fail(`multiple zone entry-point rulesets exist for ${TARGET_PHASE}`);
  }

  let ruleset = null;
  if (phaseRulesets.length === 1) {
    ruleset = await request(
      "GET",
      `/zones/${zoneId}/rulesets/${phaseRulesets[0].id}`,
    );
  }
  const matchingRules = (ruleset?.rules || []).filter(
    (rule) => rule?.ref === TARGET_REF,
  );
  if (matchingRules.length > 1) fail(`duplicate rule ref ${TARGET_REF}`);

  const currentRule = matchingRules[0] || null;
  if (ruleIsExact(currentRule)) {
    process.stdout.write(`Already configured: ${TARGET_HOST} disables RUM.\n`);
    return;
  }

  const plan = !ruleset
    ? "create the zone configuration ruleset with the members-only RUM rule"
    : !currentRule
      ? "append the members-only RUM rule without replacing existing rules"
      : "repair only the existing members-only RUM rule";
  process.stdout.write(`Planned change: ${plan}.\n`);

  if (!execute) {
    process.stdout.write("Plan only. No Cloudflare state was changed.\n");
    return;
  }

  if (!ruleset) {
    await request("POST", `/zones/${zoneId}/rulesets`, {
      description: "Per-host Cloudflare configuration for HAZ QUE VUELVA",
      kind: "zone",
      name: "HAZ QUE VUELVA configuration rules",
      phase: TARGET_PHASE,
      rules: [targetRule()],
    });
  } else if (!currentRule) {
    await request(
      "POST",
      `/zones/${zoneId}/rulesets/${ruleset.id}/rules`,
      targetRule(),
    );
  } else {
    if (typeof currentRule.id !== "string" || currentRule.id.length === 0) {
      fail("existing target rule has no stable ID");
    }
    await request(
      "PATCH",
      `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${currentRule.id}`,
      targetRule(),
    );
  }

  const refreshedRulesets = await request("GET", `/zones/${zoneId}/rulesets`);
  if (!Array.isArray(refreshedRulesets)) {
    fail("Cloudflare returned an invalid ruleset inventory");
  }
  const refreshedEntry = refreshedRulesets.find(
    (candidate) =>
      candidate?.kind === "zone" && candidate?.phase === TARGET_PHASE,
  );
  if (!refreshedEntry?.id) fail("configuration ruleset was not created");
  const refreshed = await request(
    "GET",
    `/zones/${zoneId}/rulesets/${refreshedEntry.id}`,
  );
  const verified = (refreshed?.rules || []).filter(
    (rule) => rule?.ref === TARGET_REF,
  );
  if (verified.length !== 1 || !ruleIsExact(verified[0])) {
    fail("post-write verification did not observe the exact RUM rule");
  }
  process.stdout.write(`Applied and verified: RUM disabled on ${TARGET_HOST}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
