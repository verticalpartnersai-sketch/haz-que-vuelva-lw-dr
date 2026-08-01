import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { PasswordRecoverySender } from "@/modules/notifications/application/password-recovery-sender";

type Dependencies = {
  auth: SupabaseClient["auth"];
  callbackUrl: string;
  rateLimiter: {
    claim(email: string, clientHash: string): Promise<boolean>;
  };
  sender: PasswordRecoverySender;
  suppressionStore: {
    isSuppressed(email: string): Promise<boolean>;
  };
};

export async function requestPasswordRecovery(
  input: { clientHash: string; email: string },
  dependencies: Dependencies,
) {
  const email = input.email.trim().toLowerCase();

  if (!(await dependencies.rateLimiter.claim(email, input.clientHash))) {
    return { accepted: true, sent: false };
  }

  if (await dependencies.suppressionStore.isSuppressed(email)) {
    return { accepted: true, sent: false };
  }

  const generated = await dependencies.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: dependencies.callbackUrl },
  });
  const tokenHash = generated.data.properties?.hashed_token;

  // A generic result keeps the account-existence contract identical.
  if (generated.error || !tokenHash) {
    return { accepted: true, sent: false };
  }

  const actionUrl = new URL(dependencies.callbackUrl);
  actionUrl.searchParams.set("token_hash", tokenHash);
  actionUrl.searchParams.set("type", "recovery");
  actionUrl.searchParams.set("next", "/auth/restablecer");

  await dependencies.sender.send({
    actionUrl: actionUrl.toString(),
    idempotencyKey: `password-recovery/${randomUUID()}`,
    recipient: email,
  });

  return { accepted: true, sent: true };
}
