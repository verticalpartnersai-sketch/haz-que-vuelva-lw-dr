import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseEmailSuppressionStore {
  constructor(private readonly client: SupabaseClient) {}

  async isSuppressed(email: string) {
    const recipientHash = createHash("sha256")
      .update(email.trim().toLowerCase())
      .digest("hex");
    const { data, error } = await this.client
      .from("email_suppressions")
      .select("recipient_sha256")
      .eq("recipient_sha256", recipientHash)
      .is("lifted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(`Email suppression lookup failed: ${error.code}`);
    }

    return data !== null;
  }
}
