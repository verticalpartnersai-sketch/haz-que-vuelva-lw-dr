import "server-only";

import { createSupabaseServerClient } from "@/server/supabase/server-client";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export type MemberAiAccess = {
  accessDaysRemaining: number;
  accessExpiresAt: string | null;
  accessStartedAt: string | null;
  allowedKnowledgeProducts: string[];
  hadAi: boolean;
  hasAi: boolean;
};

function readAccessStatus(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const status = value as Record<string, unknown>;
  return {
    accessDaysRemaining:
      typeof status.access_days_remaining === "number"
        ? status.access_days_remaining
        : 0,
    accessExpiresAt:
      typeof status.access_expires_at === "string"
        ? status.access_expires_at
        : null,
    accessStartedAt:
      typeof status.access_started_at === "string"
        ? status.access_started_at
        : null,
    hadAi: status.has_entitlement === true,
    hasAi: status.access_active === true,
  };
}

export async function memberAiProducts(memberId: string): Promise<MemberAiAccess> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("effective_entitlements")
    .select("product_code")
    .eq("member_id", memberId);
  if (error) throw new Error("entitlement_lookup_failed");
  const codes = (data ?? []).map((item) => item.product_code);
  const fallback: Omit<MemberAiAccess, "allowedKnowledgeProducts"> = {
    accessDaysRemaining: 0,
    accessExpiresAt: null,
    accessStartedAt: null,
    hadAi: false,
    hasAi: false,
  };
  let access = fallback;
  if (codes.includes("vuelve_ia")) {
    const status = await createSupabaseServiceClient().rpc(
      "get_vuelve_ia_access_status",
      { p_member_id: memberId },
    );
    if (status.error) throw new Error("ai_access_status_unavailable");
    access = readAccessStatus(status.data) ?? fallback;
  }
  return {
    ...access,
    allowedKnowledgeProducts: codes.filter((code) => code !== "vuelve_ia"),
  };
}
