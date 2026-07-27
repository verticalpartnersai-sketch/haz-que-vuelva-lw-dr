import type { SupabaseClient } from "@supabase/supabase-js";

export type InvitationJob = {
  id: string;
  attempts: number;
  payload: { member_id?: string; email?: string };
};

export class SupabaseInvitationOutbox {
  constructor(private readonly client: SupabaseClient) {}

  async claim(limit = 10): Promise<InvitationJob[]> {
    const { data, error } = await this.client.rpc("claim_outbox_jobs", {
      p_job_type: "send_member_invitation",
      p_limit: limit,
    });
    if (error) throw new Error(`Invitation claim failed: ${error.code}`);
    return (data ?? []) as InvitationJob[];
  }

  async complete(job: InvitationJob) {
    const memberId = job.payload.member_id;
    if (!memberId) throw new Error("missing_member_id");

    const { error: profileError } = await this.client
      .from("profiles")
      .update({ invited_at: new Date().toISOString() })
      .eq("id", memberId);
    if (profileError) {
      throw new Error(`Invitation profile update failed: ${profileError.code}`);
    }

    const { error } = await this.client
      .from("outbox_jobs")
      .update({ completed_at: new Date().toISOString(), locked_at: null })
      .eq("id", job.id);
    if (error) throw new Error(`Invitation completion failed: ${error.code}`);
  }

  async retry(job: InvitationJob, errorCode: string) {
    const terminal = job.attempts >= 8;
    const delayMinutes = Math.min(2 ** job.attempts, 360);
    const { error } = await this.client
      .from("outbox_jobs")
      .update({
        locked_at: null,
        last_error: errorCode.slice(0, 160),
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        failed_at: terminal ? new Date().toISOString() : null,
      })
      .eq("id", job.id);
    if (error) throw new Error(`Invitation retry failed: ${error.code}`);
  }
}
