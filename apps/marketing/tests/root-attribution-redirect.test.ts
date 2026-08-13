import assert from "node:assert/strict";
import test from "node:test";

import { buildQuizRedirect } from "../src/features/analytics/attribution-redirect.ts";

test("preserves approved attribution parameters when redirecting root traffic to the quiz", () => {
  assert.equal(
    buildQuizRedirect({
      ad_id: "120251837761880017",
      campaign_id: "120251837463690017",
      fbclid: "safe-public-click-id",
      utm_campaign: "{{campaign.name}}",
      utm_content: "CRT 01",
      utm_source: "facebook",
    }),
    "/quiz?ad_id=120251837761880017&campaign_id=120251837463690017&fbclid=safe-public-click-id&utm_campaign=%7B%7Bcampaign.name%7D%7D&utm_content=CRT+01&utm_source=facebook",
  );
});

test("drops unknown, private and multi-value parameters from the root redirect", () => {
  assert.equal(
    buildQuizRedirect({
      email: "person@example.invalid",
      token: "secret",
      utm_source: ["facebook", "duplicate"],
      utm_term: "approved-term",
    }),
    "/quiz?utm_term=approved-term",
  );
});
