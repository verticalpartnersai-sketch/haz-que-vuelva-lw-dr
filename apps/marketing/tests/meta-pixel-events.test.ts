import assert from "node:assert/strict";
import test from "node:test";

import {
  FRONT_PRICE_USD,
  dispatchMetaEvent,
  isMetaPixelId,
  metaEventForAnalytics,
  metaPageEvents,
  metaPixelBootstrap,
} from "../src/features/analytics/meta-pixel-events.ts";

test("validates Meta dataset IDs without accepting arbitrary script input", () => {
  assert.equal(isMetaPixelId("1877609922941109"), true);
  assert.equal(isMetaPixelId(" 1877609922941109 "), true);
  assert.equal(isMetaPixelId("pixel-1877609922941109"), false);
  assert.equal(isMetaPixelId(""), false);
});

test("builds a constrained bootstrap without firing a duplicate PageView", () => {
  const bootstrap = metaPixelBootstrap("1877609922941109");
  assert.match(bootstrap, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(bootstrap, /fbq\('init','1877609922941109'\)/);
  assert.doesNotMatch(bootstrap, /PageView/);
});

test("maps quiz start to a custom Meta event and preserves attribution fields", () => {
  assert.deepEqual(
    metaEventForAnalytics("quiz_start", {
      ad_id: "ad-01",
      adset_id: "set-01",
      creative_id: "crt-01",
      fbclid: "click-01",
      utm_campaign: "launch",
    }),
    {
      kind: "custom",
      name: "QuizStart",
      parameters: {
        ad_id: "ad-01",
        adset_id: "set-01",
        creative_id: "crt-01",
        fbclid: "click-01",
        utm_campaign: "launch",
      },
    },
  );
});

test("drops non-allowlisted and potentially sensitive quiz fields", () => {
  assert.deepEqual(
    metaEventForAnalytics("quiz_start", {
      creative_id: "crt-01",
      email: "person@example.invalid",
      free_text: "private relationship detail",
      token: "not-for-meta",
      utm_campaign: "launch",
    }),
    {
      kind: "custom",
      name: "QuizStart",
      parameters: {
        creative_id: "crt-01",
        utm_campaign: "launch",
      },
    },
  );

  assert.deepEqual(
    metaEventForAnalytics("quiz_result_view", {
      distance_band: "medium",
      first_action: "private answer",
      route: "green",
      token: "not-for-meta",
    }),
    {
      kind: "custom",
      name: "QuizComplete",
      parameters: {
        distance_band: "medium",
        route: "green",
      },
    },
  );
});

test("maps the result view to one quiz completion event", () => {
  assert.deepEqual(
    metaEventForAnalytics("quiz_result_view", {
      distance_band: "medium",
      route: "green",
    }),
    {
      kind: "custom",
      name: "QuizComplete",
      parameters: {
        distance_band: "medium",
        route: "green",
      },
    },
  );
});

test("keeps the live front price in the public analytics contract", () => {
  assert.equal(FRONT_PRICE_USD, 7.9);
});

test("maps the front CTA to a custom click with the live price instead of duplicating PerfectPay InitiateCheckout", () => {
  assert.deepEqual(
    metaEventForAnalytics("checkout_start", {
      cta_position: "result",
      price: 7.9,
      route: "green",
    }),
    {
      kind: "custom",
      name: "FrontCheckoutClick",
      parameters: {
        content_name: "Haz Que Vuelva",
        currency: "USD",
        cta_position: "result",
        route: "green",
        value: 7.9,
      },
    },
  );
});

test("ignores internal events that are not part of the Meta event contract", () => {
  assert.equal(metaEventForAnalytics("quiz_answer", { question_id: "q1" }), null);
});

test("dispatches standard and custom events to only the configured dataset", () => {
  const calls: unknown[][] = [];
  const fbq = (...args: unknown[]) => calls.push(args);

  dispatchMetaEvent("1877609922941109", {
    kind: "standard",
    name: "PageView",
    parameters: {},
  }, fbq);
  dispatchMetaEvent("1877609922941109", {
    kind: "custom",
    name: "QuizStart",
    parameters: { creative_id: "crt-01" },
  }, fbq);

  assert.deepEqual(calls, [
    ["trackSingle", "1877609922941109", "PageView", {}],
    [
      "trackSingleCustom",
      "1877609922941109",
      "QuizStart",
      { creative_id: "crt-01" },
    ],
  ]);
});

test("emits PageView and route-specific ViewContent without inventing Purchase", () => {
  assert.deepEqual(metaPageEvents("/quiz"), [
    { kind: "standard", name: "PageView", parameters: {} },
    {
      kind: "standard",
      name: "ViewContent",
      parameters: {
        content_category: "front",
        content_name: "Haz Que Vuelva Quiz",
      },
    },
  ]);
  assert.deepEqual(metaPageEvents("/up1"), [
    { kind: "standard", name: "PageView", parameters: {} },
    {
      kind: "standard",
      name: "ViewContent",
      parameters: {
        content_category: "upsell",
        content_name: "Reconquista 30",
      },
    },
  ]);
  assert.deepEqual(metaPageEvents("/gracias"), [
    { kind: "standard", name: "PageView", parameters: {} },
  ]);
});
