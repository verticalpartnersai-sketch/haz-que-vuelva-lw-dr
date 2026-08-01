import type { SupabaseClient } from "@supabase/supabase-js";

import type { SupabaseInvitationOutbox } from "@/modules/notifications/adapters/supabase-invitation-outbox";
import type { InvitationSender } from "@/modules/notifications/application/invitation-sender";

type Dependencies = {
  auth: SupabaseClient["auth"];
  outbox: SupabaseInvitationOutbox;
  sender: InvitationSender;
  redirectTo: string;
};

async function generateAccessLink({
  auth,
  email,
  redirectTo,
}: Pick<Dependencies, "auth" | "redirectTo"> & { email: string }) {
  let type: "invite" | "recovery" = "invite";
  let generated = await auth.admin.generateLink({
    type,
    email,
    options: { redirectTo },
  });

  if (generated.error?.code === "email_exists") {
    type = "recovery";
    generated = await auth.admin.generateLink({
      type,
      email,
      options: { redirectTo },
    });
  }

  const tokenHash = generated.data.properties?.hashed_token;
  if (generated.error || !tokenHash) {
    throw new Error(`invitation_link_${generated.error?.code ?? "unavailable"}`);
  }

  const actionUrl = new URL(redirectTo);
  actionUrl.searchParams.set("token_hash", tokenHash);
  actionUrl.searchParams.set("type", type);
  actionUrl.searchParams.set("next", "/auth/definir-contrasena");
  return actionUrl.toString();
}

export async function runInvitationWorker(dependencies: Dependencies) {
  const jobs = await dependencies.outbox.claim();
  let completed = 0;
  let suppressed = 0;

  for (const job of jobs) {
    try {
      const { member_id: memberId, email } = job.payload;
      if (!memberId || !email) throw new Error("invalid_invitation_job");

      if (await dependencies.outbox.isSuppressed(email)) {
        await dependencies.outbox.suppress(job);
        suppressed += 1;
        continue;
      }

      const actionUrl = await generateAccessLink({
        auth: dependencies.auth,
        email,
        redirectTo: dependencies.redirectTo,
      });

      await dependencies.sender.send({
        recipient: email,
        actionUrl,
        idempotencyKey: job.id,
      });
      await dependencies.outbox.complete(job);
      completed += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown_error";
      await dependencies.outbox.retry(job, code);
    }
  }

  return { claimed: jobs.length, completed, suppressed };
}
