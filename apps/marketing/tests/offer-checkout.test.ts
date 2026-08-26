import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOfferCheckoutUrl,
  offerPerfectPayAttributionValue,
} from "../src/features/offer/offer-checkout.ts";

test("encodes allowlisted CTA and score band in v2 attribution", () => {
  assert.equal(
    offerPerfectPayAttributionValue("offer_primary", "92_96"),
    "hqv2~offer_primary~92_96",
  );
  assert.equal(
    offerPerfectPayAttributionValue("offer_repeat", "87_91"),
    "hqv2~offer_repeat~87_91",
  );
});

test("rejects unknown positions and score bands", () => {
  assert.equal(offerPerfectPayAttributionValue("tampered", "92_96"), null);
  assert.equal(offerPerfectPayAttributionValue("offer_primary", "99_99"), null);
});

test("builds the existing PerfectPay checkout with only approved attribution", () => {
  const destination = buildOfferCheckoutUrl({
    attribution: {
      utm_source: "meta",
      utm_campaign: "HQV-01",
      fbclid: "fb-123",
      email: "private@example.invalid",
      route: "green",
      utm_perfect: "tampered",
    },
    ctaPosition: "offer_primary",
    scoreBand: "92_96",
  });

  assert.equal(destination.hostname, "go.centerpag.com");
  assert.equal(destination.searchParams.get("lang"), "es");
  assert.equal(destination.searchParams.get("utm_source"), "meta");
  assert.equal(destination.searchParams.get("utm_campaign"), "HQV-01");
  assert.equal(destination.searchParams.get("fbclid"), "fb-123");
  assert.equal(destination.searchParams.get("cta_position"), "offer_primary");
  assert.equal(destination.searchParams.get("score_band"), "92_96");
  assert.equal(destination.searchParams.get("quiz_version"), "hqv_quiz_v2");
  assert.equal(destination.searchParams.get("utm_perfect"), "hqv2~offer_primary~92_96");
  assert.equal(destination.searchParams.get("email"), null);
  assert.equal(destination.searchParams.get("route"), null);
});
