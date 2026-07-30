import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

import { requireReauthenticationTokenHash } from "./reauthenticated-operation";

export async function revokeAccess(input: {
  grantId: string;
  reason: string;
  reauthenticationTokenHash: string;
}) {
  await requireAdmin();
  if (input.reason.trim().length < 8) {
    throw new Error("A reason with at least 8 characters is required");
  }

  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc(
    "revoke_access_grant_with_reauthentication",
    {
      p_grant_id: input.grantId,
      p_reason: input.reason.trim(),
      p_reauth_token_hash: requireReauthenticationTokenHash(
        input.reauthenticationTokenHash,
      ),
    },
  );
  if (error) throw new Error(`Manual revocation failed: ${error.code}`);
  return data as string;
}
