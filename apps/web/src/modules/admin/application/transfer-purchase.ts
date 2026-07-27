import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function transferPurchase(input: {
  purchaseId: string;
  targetMemberId: string;
  reason: string;
}) {
  await requireAdmin();
  if (input.reason.trim().length < 8) {
    throw new Error("A reason with at least 8 characters is required");
  }

  const client = await createSupabaseServerClient();
  const { error } = await client.rpc("transfer_purchase", {
    p_purchase_id: input.purchaseId,
    p_target_member_id: input.targetMemberId,
    p_reason: input.reason.trim(),
  });
  if (error) throw new Error(`Purchase transfer failed: ${error.code}`);
}
