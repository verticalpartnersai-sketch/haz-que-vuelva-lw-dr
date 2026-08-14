import assert from "node:assert/strict";
import test from "node:test";

import { resendDeliveryEventSchema } from "../src/modules/notifications/domain/resend-delivery-event.ts";

for (const type of ["email.opened", "email.clicked"] as const) {
  test(`Resend ${type} is accepted for checkout-recovery observability`, () => {
    const parsed = resendDeliveryEventSchema.safeParse({
      type,
      created_at: "2026-08-14T10:00:00.000Z",
      data: {
        email_id: "provider-message-id",
        to: ["buyer@example.test"],
      },
    });

    assert.equal(parsed.success, true);
  });
}

test("unknown Resend events remain ignored", () => {
  const parsed = resendDeliveryEventSchema.safeParse({
    type: "email.unknown",
    created_at: "2026-08-14T10:00:00.000Z",
    data: {
      email_id: "provider-message-id",
      to: ["buyer@example.test"],
    },
  });

  assert.equal(parsed.success, false);
});
