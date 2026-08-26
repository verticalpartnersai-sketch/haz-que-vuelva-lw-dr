import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildQuizCheckoutUrl,
  perfectPayAttributionValue,
  QUIZ_CHECKOUT_URL,
} from "../src/features/quiz/quiz-checkout-config.ts";

test("opens the PerfectPay FRONT checkout in Spanish without dropping the upsell context", () => {
  const checkoutUrl = new URL(QUIZ_CHECKOUT_URL);

  assert.equal(checkoutUrl.origin, "https://go.centerpag.com");
  assert.equal(checkoutUrl.pathname, "/PPU38CQER3J");
  assert.equal(checkoutUrl.searchParams.get("upsell"), "true");
  assert.equal(checkoutUrl.searchParams.get("lang"), "es");
});

test("encodes only allowlisted CTA and route values for PerfectPay reconciliation", () => {
  assert.equal(perfectPayAttributionValue("hero", "green"), "hqv~hero~green");
  assert.equal(
    perfectPayAttributionValue("value_stack", "yellow"),
    "hqv~value_stack~yellow",
  );
  assert.equal(
    perfectPayAttributionValue("hero", "logistics"),
    "hqv~hero~logistics",
  );
  assert.equal(
    perfectPayAttributionValue("hero", "third_person"),
    "hqv~hero~third_person",
  );
  assert.equal(perfectPayAttributionValue("tampered", "green"), null);
});

test("builds a checkout URL that preserves ads attribution and adds PerfectPay reconciliation metadata", () => {
  const destination = buildQuizCheckoutUrl({
    attribution: {
      creative_id: "crt-04",
      utm_content: "CRT 04",
      utm_source: "facebook",
    },
    channelState: "contact_open",
    ctaPosition: "hero",
    distanceBand: "medium",
    route: "green",
  });

  assert.equal(destination.searchParams.get("utm_source"), "facebook");
  assert.equal(destination.searchParams.get("utm_content"), "CRT 04");
  assert.equal(destination.searchParams.get("creative_id"), "crt-04");
  assert.equal(destination.searchParams.get("cta_position"), "hero");
  assert.equal(destination.searchParams.get("route"), "green");
  assert.equal(destination.searchParams.get("utm_perfect"), "hqv~hero~green");
});

test("reserved checkout reconciliation fields cannot be overwritten by ad attribution", () => {
  const destination = buildQuizCheckoutUrl({
    attribution: {
      cta_position: "tampered",
      customer_name: "must-not-leave-the-app",
      email: "private@example.invalid",
      route: "red",
      unexpected: "drop-me",
      utm_perfect: "attacker-controlled",
      utm_source: "facebook",
    },
    channelState: "open",
    ctaPosition: "hero",
    distanceBand: "low",
    route: "green",
  });

  assert.equal(destination.searchParams.get("cta_position"), "hero");
  assert.equal(destination.searchParams.get("route"), "green");
  assert.equal(destination.searchParams.get("utm_perfect"), "hqv~hero~green");
  assert.equal(destination.searchParams.get("customer_name"), null);
  assert.equal(destination.searchParams.get("email"), null);
  assert.equal(destination.searchParams.get("unexpected"), null);
});

test("the quiz checkout action uses the tested URL builder", () => {
  const source = readFileSync(
    new URL("../src/features/quiz/quiz-page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /buildQuizCheckoutUrl\(\{/);
  assert.doesNotMatch(source, /new URL\(QUIZ_CHECKOUT_URL\)/);
});
