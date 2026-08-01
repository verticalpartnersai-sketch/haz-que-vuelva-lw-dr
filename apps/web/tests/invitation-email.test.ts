import assert from "node:assert/strict";
import test from "node:test";

import { buildInvitationEmail } from "../src/modules/notifications/application/invitation-email.ts";

test("invitation email is branded, responsive and keeps a plain-text fallback", () => {
  const actionUrl =
    "https://miembros.hazquevuelva.site/auth/confirm?token_hash=secret&type=invite";
  const email = buildInvitationEmail(actionUrl);

  assert.equal(email.subject, "Tu acceso a Haz Que Vuelva está listo");
  assert.match(email.html, /haz-que-vuelva-logo-heart-primary-v1\.png/);
  assert.match(email.html, /CREAR MI CONTRASEÑA/);
  assert.match(email.html, /max-width:560px/);
  assert.match(email.html, /Acceso privado/);
  assert.match(email.text, /Este enlace es personal/);
  assert.match(email.text, new RegExp(actionUrl.replace(/[?]/g, "\\?")));
});

test("invitation email escapes the action URL before rendering HTML", () => {
  const email = buildInvitationEmail(
    'https://miembros.hazquevuelva.site/auth/confirm?next="<script>',
  );
  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&quot;&lt;script&gt;/);
});
