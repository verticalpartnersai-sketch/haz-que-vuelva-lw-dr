import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabasePasswordRecoveryRateLimiter {
  constructor(private readonly client: SupabaseClient) {}

  async claim(email: string, clientHash: string) {
    const { data, error } = await this.client.rpc(
      "claim_password_recovery_request",
      {
        p_client_sha256: clientHash,
        p_recipient_email: email,
      },
    );

    if (error) {
      throw new Error(`Password recovery rate limit failed: ${error.code}`);
    }

    return data === true;
  }
}
