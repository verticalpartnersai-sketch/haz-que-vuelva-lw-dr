import type { SupabaseClient } from "@supabase/supabase-js";

import type { SupabaseInvitationOutbox } from "@/modules/notifications/adapters/supabase-invitation-outbox";
import type { InvitationSender } from "@/modules/notifications/application/invitation-sender";

type Dependencies = {
  auth: SupabaseClient["auth"];
  outbox: SupabaseInvitationOutbox;
  sender: InvitationSender;
  redirectTo: string;
};

export async function runInvitationWorker(dependencies: Dependencies) {
  const jobs = await dependencies.outbox.claim();
  let completed = 0;

  for (const job of jobs) {
    try {
      const { member_id: memberId, email } = job.payload;
      if (!memberId || !email) throw new Error("invalid_invitation_job");

      const { data, error } = await dependencies.auth.admin.generateLink({
        type: "invite",
        email,
        options: { redirectTo: dependencies.redirectTo },
      });
      if (error || !data.properties?.action_link) {
        throw new Error(`invitation_link_${error?.code ?? "unavailable"}`);
      }

      await dependencies.sender.send({
        recipient: email,
        actionUrl: data.properties.action_link,
        idempotencyKey: job.id,
      });
      await dependencies.outbox.complete(job);
      completed += 1;
    } catch (error) {
      const code = error instanceof Error ? error.message : "unknown_error";
      await dependencies.outbox.retry(job, code);
    }
  }

  return { claimed: jobs.length, completed };
}
