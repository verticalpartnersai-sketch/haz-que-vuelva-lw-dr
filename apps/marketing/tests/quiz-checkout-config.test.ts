import assert from "node:assert/strict";
import test from "node:test";

import { QUIZ_CHECKOUT_URL } from "../src/features/quiz/quiz-checkout-config.ts";

test("opens the PerfectPay FRONT checkout in Spanish without dropping the upsell context", () => {
  const checkoutUrl = new URL(QUIZ_CHECKOUT_URL);

  assert.equal(checkoutUrl.origin, "https://go.centerpag.com");
  assert.equal(checkoutUrl.pathname, "/PPU38CQER3J");
  assert.equal(checkoutUrl.searchParams.get("upsell"), "true");
  assert.equal(checkoutUrl.searchParams.get("lang"), "es");
});
