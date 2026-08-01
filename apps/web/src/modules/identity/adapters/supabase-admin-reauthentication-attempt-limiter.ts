import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminReauthenticationAttemptLimiter } from "../application/admin-reauthentication.ts";

export class SupabaseAdminReauthenticationAttemptLimiter
  implements AdminReauthenticationAttemptLimiter
{
  constructor(private readonly client: SupabaseClient) {}

  async reserve(actorId: string) {
    const { data, error } = await this.client.rpc(
      "reserve_admin_reauthentication_attempt",
      { p_actor_id: actorId },
    );
    if (error) {
      throw new Error(`admin_reauthentication_rate_limit_failed:${error.code}`);
    }
    if (!Number.isInteger(data) || data < 0 || data > 900) {
      throw new Error("admin_reauthentication_rate_limit_invalid_response");
    }
    return data;
  }
}
