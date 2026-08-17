import assert from "node:assert/strict";
import test from "node:test";

import { buildCheckoutRecoveryEmail } from "../src/modules/notifications/application/checkout-recovery-email.ts";

const checkoutUrl =
  "https://go.centerpag.com/PPU38CQER3J?upsell=true&lang=es&utm_content=email_1";
const unsubscribeUrl =
  "https://miembros.hazquevuelva.site/api/notifications/checkout-recovery/unsubscribe?token=opaque";

test("checkout recovery sequence has three distinct Spanish direct-response emails", () => {
  const first = buildCheckoutRecoveryEmail({ checkoutUrl, step: 1, unsubscribeUrl });
  const second = buildCheckoutRecoveryEmail({ checkoutUrl, step: 2, unsubscribeUrl });
  const third = buildCheckoutRecoveryEmail({ checkoutUrl, step: 3, unsubscribeUrl });

  assert.equal(first.subject, "¿Se quedó a medias?");
  assert.equal(second.subject, "Antes de volver a abrir su chat");
  assert.equal(third.subject, "Seguir improvisando también tiene un costo");

  assert.match(first.text, /escribir, responder o esperar/i);
  assert.match(second.text, /WhatsApp/i);
  assert.match(second.text, /Bucle de Rechazo/i);
  assert.match(third.text, /US\$8\.49/);
  assert.match(third.text, /7 días de garantía/i);

  for (const email of [first, second, third]) {
    assert.match(email.html, /Haz Que Vuelva/);
    assert.match(email.html, /max-width:560px/);
    assert.match(email.html, /Darse de baja/);
    assert.match(email.text, new RegExp(checkoutUrl.replace(/[?.]/g, "\\$&")));
    assert.match(
      email.text,
      new RegExp(unsubscribeUrl.replace(/[?.]/g, "\\$&")),
    );
  }
});

test("checkout recovery email escapes action URLs before rendering HTML", () => {
  const email = buildCheckoutRecoveryEmail({
    checkoutUrl: 'https://checkout.invalid/?next="<script>',
    step: 1,
    unsubscribeUrl: 'https://example.invalid/?token="<script>',
  });

  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&quot;&lt;script&gt;/);
});
