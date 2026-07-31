#!/usr/bin/env bash

set -euo pipefail

base_url="${HQV_BASE_URL:-https://hazquevuelva.site}"
members_url="${HQV_MEMBERS_URL:-https://miembros.hazquevuelva.site}"
agent_public_url="${HQV_AGENT_PUBLIC_URL:-https://haz-que-vuelva-agent.verticalpartnersai.workers.dev}"
checkout_url="${HQV_CHECKOUT_URL:-https://go.centerpag.com/PPU38CQER3J?upsell=true}"
upsell_1_url="${HQV_UPSELL_1_URL:-https://go.centerpag.com/PPU38CQERET}"
upsell_2_url="${HQV_UPSELL_2_URL:-https://go.centerpag.com/PPU38CQERFF}"
http_url="${base_url/https:/http:}"
smoke_dir="$(mktemp -d "${TMPDIR:-/tmp}/hqv-production-smoke.XXXXXX")"

cleanup() {
  rm -rf "$smoke_dir"
}
trap cleanup EXIT

curl_common=(
  --connect-timeout 10
  --max-time 30
  --retry 3
  --retry-all-errors
  --show-error
  --silent
)

fail() {
  echo "Production smoke failed: $1" >&2
  exit 1
}

expect_status() {
  local expected="$1"
  local url="$2"
  local output="$3"
  local status

  status="$(
    curl "${curl_common[@]}" \
      --output "$output" \
      --write-out "%{http_code}" \
      "$url"
  )"

  [[ "$status" == "$expected" ]] ||
    fail "$url returned $status; expected $expected"
}

expect_redirect() {
  local expected_status="$1"
  local expected_location="$2"
  local url="$3"
  local output="$4"
  local status

  status="$(
    curl "${curl_common[@]}" \
      --dump-header "$output" \
      --output /dev/null \
      --write-out "%{http_code}" \
      "$url"
  )"

  [[ "$status" == "$expected_status" ]] ||
    fail "$url returned $status; expected $expected_status"
  tr -d "\r" <"$output" |
    grep -Fqi "location: $expected_location" ||
    fail "$url did not redirect to $expected_location"
}

http_headers="$smoke_dir/http-headers.txt"
http_status="$(
  curl "${curl_common[@]}" \
    --dump-header "$http_headers" \
    --output /dev/null \
    --write-out "%{http_code}" \
    "$http_url/quiz"
)"
[[ "$http_status" == "308" ]] ||
  fail "$http_url/quiz returned $http_status; expected 308"
tr -d "\r" <"$http_headers" |
  grep -Fqi "location: $base_url/quiz" ||
  fail "HTTP redirect does not preserve /quiz"

quiz_headers="$smoke_dir/quiz-headers.txt"
quiz_body="$smoke_dir/quiz.html"
quiz_status="$(
  curl "${curl_common[@]}" \
    --dump-header "$quiz_headers" \
    --output "$quiz_body" \
    --write-out "%{http_code}" \
    "$base_url/quiz"
)"
[[ "$quiz_status" == "200" ]] ||
  fail "$base_url/quiz returned $quiz_status; expected 200"

normalized_headers="$smoke_dir/quiz-headers-normalized.txt"
tr -d "\r" <"$quiz_headers" | tr "[:upper:]" "[:lower:]" >"$normalized_headers"

for required_header in \
  "strict-transport-security: max-age=31536000" \
  "permissions-policy: camera=(), geolocation=(), microphone=()" \
  "referrer-policy: strict-origin-when-cross-origin" \
  "x-content-type-options: nosniff" \
  "x-frame-options: deny"; do
  grep -Fq "$required_header" "$normalized_headers" ||
    fail "missing response header: $required_header"
done

grep -Fq 'lang="es"' "$quiz_body" ||
  fail "Spanish is not the default HTML language"
grep -Fq 'rel="canonical" href="https://hazquevuelva.site/quiz"' "$quiz_body" ||
  fail "canonical URL is missing or incorrect"
grep -Fq 'property="og:image" content="https://hazquevuelva.site/images/social/quiz-og.jpg"' "$quiz_body" ||
  fail "Open Graph image is missing or incorrect"
grep -Fq '/audio/ambient-sound.mp3?v=1' "$quiz_body" ||
  fail "ambient audio is missing from the quiz"
grep -Fq "Él todavía no te olvidó" "$quiz_body" ||
  fail "Spanish quiz headline is missing"

node --input-type=module - "$base_url" "$quiz_body" "$checkout_url" <<'NODE'
import { readFile } from "node:fs/promises";

const [, , baseUrl, quizBodyPath, checkoutUrl] = process.argv;
const html = await readFile(quizBodyPath, "utf8");
const scriptUrls = [
  ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
].map((match) => new URL(match[1], baseUrl).href);

const scripts = await Promise.all(
  scriptUrls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url} returned ${response.status}`);
    }
    return response.text();
  }),
);

if (!scripts.some((script) => script.includes(checkoutUrl))) {
  throw new Error(`checkout URL is missing from deployed JavaScript: ${checkoutUrl}`);
}
NODE

upsell_1_body="$smoke_dir/up1.html"
upsell_2_body="$smoke_dir/up2.html"
thanks_body="$smoke_dir/gracias.html"
expect_status "200" "$base_url/up1?utm_source=hqv-smoke" "$upsell_1_body"
expect_status "200" "$base_url/up2?utm_source=hqv-smoke" "$upsell_2_body"
expect_status "200" "$base_url/gracias" "$thanks_body"

for upsell_body in "$upsell_1_body" "$upsell_2_body"; do
  grep -Fq "Tu siguiente decisión ya está disponible" "$upsell_body" ||
    fail "upsell page is missing the transaction-neutral status"
  if grep -Fq "Tu compra principal está confirmada" "$upsell_body"; then
    fail "upsell page claims a confirmed purchase without transaction proof"
  fi
done

grep -Fq "Si tu pago fue aprobado, tu acceso ya está siendo preparado." "$thanks_body" ||
  fail "thank-you page is missing the conditional payment status"
if grep -Fq "Compra confirmada" "$thanks_body"; then
  fail "thank-you page claims a confirmed purchase without transaction proof"
fi

node --input-type=module - \
  "$base_url" \
  "$upsell_1_body" \
  "$upsell_1_url" \
  "$upsell_2_body" \
  "$upsell_2_url" <<'NODE'
import { readFile } from "node:fs/promises";

const [, , baseUrl, ...pageArguments] = process.argv;

for (let index = 0; index < pageArguments.length; index += 2) {
  const bodyPath = pageArguments[index];
  const expectedCheckout = pageArguments[index + 1];
  const html = await readFile(bodyPath, "utf8");
  const scriptUrls = [
    ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
  ].map((match) => new URL(match[1], baseUrl).href);
  const scripts = await Promise.all(
    scriptUrls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
      }
      return response.text();
    }),
  );

  if (
    !html.includes(expectedCheckout) &&
    !scripts.some((script) => script.includes(expectedCheckout))
  ) {
    throw new Error(
      `upsell checkout URL is missing from deployed page: ${expectedCheckout}`,
    );
  }
}
NODE

checkout_probe_url="${checkout_url}&utm_source=hqv-smoke&utm_medium=quiz&route=canal_fragil&cta_position=hero"
expect_redirect \
  "302" \
  "https://checkout.centerpag.com/pay/PPU38CQER3J?upsell=true&utm_source=hqv-smoke&utm_medium=quiz&route=canal_fragil&cta_position=hero" \
  "$checkout_probe_url" \
  "$smoke_dir/checkout-headers.txt"
expect_redirect \
  "302" \
  "https://checkout.centerpag.com/pay/PPU38CQERET?utm_source=hqv-smoke&utm_medium=upsell" \
  "${upsell_1_url}?utm_source=hqv-smoke&utm_medium=upsell" \
  "$smoke_dir/upsell-1-checkout-headers.txt"
expect_redirect \
  "302" \
  "https://checkout.centerpag.com/pay/PPU38CQERFF?utm_source=hqv-smoke&utm_medium=upsell" \
  "${upsell_2_url}?utm_source=hqv-smoke&utm_medium=upsell" \
  "$smoke_dir/upsell-2-checkout-headers.txt"

expect_status "200" "$base_url/robots.txt" "$smoke_dir/robots.txt"
expect_status "200" "$base_url/sitemap.xml" "$smoke_dir/sitemap.xml"
expect_status "200" "$base_url/manifest.webmanifest" "$smoke_dir/manifest.json"
expect_status "200" "$base_url/images/social/quiz-og.jpg" "$smoke_dir/quiz-og.jpg"
expect_status "200" "$base_url/audio/ambient-sound.mp3?v=1" "$smoke_dir/ambient.mp3"
expect_status "200" "$base_url/images/quiz/hero-mobile.webp" "$smoke_dir/hero-mobile.webp"

grep -Fq "https://hazquevuelva.site/quiz" "$smoke_dir/sitemap.xml" ||
  fail "sitemap does not contain the quiz URL"

audio_size="$(wc -c <"$smoke_dir/ambient.mp3" | tr -d " ")"
[[ "$audio_size" -ge 1900000 && "$audio_size" -le 2200000 ]] ||
  fail "ambient audio has unexpected size: $audio_size bytes"

members_login_body="$smoke_dir/members-login.html"
members_health_body="$smoke_dir/members-health.json"
expect_redirect \
  "307" \
  "/login?next=%2F" \
  "$members_url/" \
  "$smoke_dir/members-root-headers.txt"

for protected_path in productos perfil administracion ia; do
  expect_redirect \
    "307" \
    "/login?next=%2F${protected_path}" \
    "$members_url/$protected_path" \
    "$smoke_dir/members-${protected_path}-headers.txt"
done

expect_status "200" "$members_url/login" "$members_login_body"
expect_status "200" "$members_url/healthz" "$members_health_body"
expect_redirect \
  "307" \
  "$base_url/quiz" \
  "$members_url/quiz" \
  "$smoke_dir/members-quiz-headers.txt"

grep -Fq '"status":"ready"' "$members_health_body" ||
  fail "members health endpoint did not return a ready status"

members_headers="$smoke_dir/members-login-headers.txt"
curl "${curl_common[@]}" \
  --dump-header "$members_headers" \
  --output /dev/null \
  "$members_url/login"
normalized_members_headers="$smoke_dir/members-login-headers-normalized.txt"
tr -d "\r" <"$members_headers" |
  tr "[:upper:]" "[:lower:]" >"$normalized_members_headers"
for required_header in \
  "strict-transport-security: max-age=31536000" \
  "content-security-policy:" \
  "permissions-policy: camera=(), geolocation=(), microphone=()" \
  "x-content-type-options: nosniff" \
  "x-frame-options: deny"; do
  grep -Fq "$required_header" "$normalized_members_headers" ||
    fail "members login is missing response header: $required_header"
done

node --input-type=module - "$members_url" "$agent_public_url" <<'NODE'
const [, , membersUrl, agentPublicUrl] = process.argv;
const webhookEndpoint = `${membersUrl}/api/webhooks/perfect-pay`;
const invalidCredentialPayload = {
  token: `hqv-negative-smoke-${crypto.randomUUID()}`,
  code: "HQV-NEGATIVE-SMOKE",
  sale_amount: 7,
  currency_enum: 2,
  sale_status_enum: 2,
  sale_status_detail: "approved",
  date_created: "2026-07-31 00:00:00",
  date_approved: "2026-07-31 00:00:01",
  product: {
    code: "PPPBF7CC",
    name: "Haz Que Vuelva",
    external_reference: null,
  },
  plan: {
    code: "HQV-NEGATIVE-SMOKE",
    name: "Safe negative smoke",
    quantity: 1,
  },
  plan_itens: [],
  customer: { email: "safe-negative@example.invalid" },
};

const invalidCredential = await fetch(webhookEndpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-hqv-auth-probe": "1",
  },
  body: JSON.stringify(invalidCredentialPayload),
});
if (invalidCredential.status !== 401) {
  throw new Error(
    `Perfect Pay invalid credential returned ${invalidCredential.status}; expected 401`,
  );
}

const encoder = new TextEncoder();
const oversizedChunks = [encoder.encode("{")];
for (let index = 0; index < 70; index += 1) {
  oversizedChunks.push(encoder.encode("x".repeat(1024)));
}
const oversizedBody = new ReadableStream({
  pull(controller) {
    const chunk = oversizedChunks.shift();
    if (chunk) controller.enqueue(chunk);
    else controller.close();
  },
});
const oversized = await fetch(webhookEndpoint, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: oversizedBody,
  duplex: "half",
});
if (oversized.status !== 413) {
  throw new Error(
    `Perfect Pay oversized stream returned ${oversized.status}; expected 413`,
  );
}

const disabledGeneration = await fetch(
  `${membersUrl}/api/ai/generations/stream`,
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
);
if (disabledGeneration.status !== 503) {
  throw new Error(
    `disabled AI generation returned ${disabledGeneration.status}; expected 503`,
  );
}

const operationalHealth = await fetch(
  `${membersUrl}/api/internal/operations/health`,
  { method: "POST" },
);
if (operationalHealth.status !== 401) {
  throw new Error(
    `operational health without credential returned ${operationalHealth.status}; expected 401`,
  );
}

const publicAgent = await fetch(`${agentPublicUrl}/health`, {
  redirect: "manual",
});
if (publicAgent.status !== 404) {
  throw new Error(
    `public agent endpoint returned ${publicAgent.status}; expected 404`,
  );
}
NODE

echo "Production smoke passed for $base_url and $members_url"
