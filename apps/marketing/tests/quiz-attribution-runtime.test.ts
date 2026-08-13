import assert from "node:assert/strict";
import test from "node:test";

import { utmParameters } from "../src/features/quiz/quiz-runtime.ts";

test("extracts the approved attribution contract for quiz analytics and checkout forwarding", () => {
  const previousWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        search:
          "?ad_id=ad-1&adset_id=set-1&campaign_id=campaign-1&creative_id=creative-1&fbclid=click-1&utm_source=facebook&utm_campaign=launch&utm_medium=paid&utm_content=CRT+01&utm_term=reconquista&utm_adset=wave-1&utm_ad=crt-01&email=private%40example.invalid&token=secret",
      },
    },
  });

  try {
    assert.deepEqual(utmParameters(), {
      ad_id: "ad-1",
      adset_id: "set-1",
      campaign_id: "campaign-1",
      creative_id: "creative-1",
      fbclid: "click-1",
      utm_ad: "crt-01",
      utm_adset: "wave-1",
      utm_campaign: "launch",
      utm_content: "CRT 01",
      utm_medium: "paid",
      utm_source: "facebook",
      utm_term: "reconquista",
    });
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
  }
});
