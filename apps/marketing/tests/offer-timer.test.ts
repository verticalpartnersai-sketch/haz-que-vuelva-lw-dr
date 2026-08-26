import assert from "node:assert/strict";
import test from "node:test";

import { formatOfferCountdown } from "../src/features/offer/offer-timer.ts";

test("formats the ten-minute start", () => {
  assert.equal(formatOfferCountdown(600), "10:00");
});

test("pads seconds and minutes", () => {
  assert.equal(formatOfferCountdown(65), "01:05");
});

test("clamps expired timers at zero", () => {
  assert.equal(formatOfferCountdown(0), "00:00");
  assert.equal(formatOfferCountdown(-12), "00:00");
});
