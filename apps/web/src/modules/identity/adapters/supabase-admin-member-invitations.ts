import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { throwIfAdminReauthenticationError } from "@/modules/admin/application/reauthenticated-operation";
import type { AdminMemberInvitationDirectory } from "@/modules/identity/application/invite-member";

export class SupabaseAdminMemberInvitations
  implements AdminMemberInvitationDirectory
{
  constructor(
    private readonly memberClient: SupabaseClient,
    private readonly serviceClient: SupabaseClient,
  ) {}

  async find(email: string) {
    const { data, error } = await this.memberClient
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (error) throw new Error(`Member lookup failed: ${error.code}`);
    return (data?.id as string | undefined) ?? null;
  }

  async create(email: string) {
    const { data, error } = await this.serviceClient.auth.admin.createUser({
      email,
      email_confirm: false,
    });
    if (error || !data.user) {
      throw new Error(`Member creation failed: ${error?.code ?? "unknown"}`);
    }
    return data.user.id;
  }

  async queue(input: {
    displayName: string;
    memberId: string;
    reauthenticationTokenHash: string;
    requestId: string;
  }) {
    const { error } = await this.memberClient.rpc(
      "queue_member_invitation_with_reauthentication",
      {
        p_display_name: input.displayName,
        p_member_id: input.memberId,
        p_reauth_token_hash: input.reauthenticationTokenHash,
        p_request_id: input.requestId,
      },
    );
    throwIfAdminReauthenticationError(error);
    if (error) throw new Error(`Invitation queue failed: ${error.code}`);
  }

  async remove(memberId: string) {
    const { error } =
      await this.serviceClient.auth.admin.deleteUser(memberId, false);
    if (error) {
      throw new Error(`Member cleanup failed: ${error.code}`);
    }
  }
}
