#!/usr/bin/env bash

set -euo pipefail

base_url="${HQV_BASE_URL:-https://hazquevuelva.site}"
checkout_url="${HQV_CHECKOUT_URL:-https://go.centerpag.com/PPU38CQER3J}"
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

checkout_probe_url="${checkout_url}?utm_source=hqv-smoke&utm_medium=quiz&route=canal_fragil&cta_position=hero"
checkout_headers="$smoke_dir/checkout-headers.txt"
checkout_status="$(
  curl "${curl_common[@]}" \
    --dump-header "$checkout_headers" \
    --output /dev/null \
    --write-out "%{http_code}" \
    "$checkout_probe_url"
)"
[[ "$checkout_status" == "302" ]] ||
  fail "$checkout_probe_url returned $checkout_status; expected 302"
tr -d "\r" <"$checkout_headers" |
  grep -Fqi \
    "location: https://checkout.centerpag.com/pay/PPU38CQER3J?utm_source=hqv-smoke&utm_medium=quiz&route=canal_fragil&cta_position=hero" ||
  fail "checkout redirect did not preserve quiz attribution parameters"

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

echo "Production smoke passed for $base_url"
