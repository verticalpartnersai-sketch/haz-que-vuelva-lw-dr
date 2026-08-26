import assert from "node:assert/strict";
import test from "node:test";

import { funnelLocaleForEnvironment } from "../src/features/i18n/funnel-locale.ts";

test("uses Portuguese in development", () => {
  assert.equal(funnelLocaleForEnvironment("development"), "pt");
});

test("uses Spanish in production and test builds", () => {
  assert.equal(funnelLocaleForEnvironment("production"), "es");
  assert.equal(funnelLocaleForEnvironment("test"), "es");
});

test("never exposes English in the new funnel", () => {
  assert.notEqual(funnelLocaleForEnvironment("production"), "en");
  assert.notEqual(funnelLocaleForEnvironment("development"), "en");
});
