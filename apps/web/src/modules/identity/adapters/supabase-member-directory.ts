import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { MemberDirectory } from "@/modules/payments/application/project-payment-event";

export class SupabaseMemberDirectory implements MemberDirectory {
  constructor(private readonly client: SupabaseClient) {}

  private async enqueueInvitation(memberId: string, email: string) {
    const { error } = await this.client.from("outbox_jobs").insert({
      job_type: "send_member_invitation",
      aggregate_type: "profile",
      aggregate_id: memberId,
      idempotency_key: `member-invite/${memberId}`,
      payload: { member_id: memberId, email },
    });
    if (error && error.code !== "23505") {
      throw new Error(`Member invitation enqueue failed: ${error.code}`);
    }
  }

  async resolve(email: string, createIfMissing: boolean) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existing } = await this.client
      .from("profiles")
      .select("id,invited_at")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (existing) {
      if (!existing.invited_at) {
        await this.enqueueInvitation(existing.id, normalizedEmail);
      }
      return existing.id as string;
    }
    if (!createIfMissing) return null;

    const { data, error } = await this.client.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: false,
    });
    if (error || !data.user) {
      throw new Error(`Member provisioning failed: ${error?.code ?? "unknown"}`);
    }

    await this.enqueueInvitation(data.user.id, normalizedEmail);
    return data.user.id;
  }
}
