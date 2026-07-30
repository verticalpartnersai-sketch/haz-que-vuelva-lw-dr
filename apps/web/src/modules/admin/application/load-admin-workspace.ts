import "server-only";

import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type AdminProduct = {
  active: boolean;
  code: string;
  description: string | null;
  name: string;
  sortOrder: number;
};

export type AdminMember = {
  createdAt: string;
  displayName: string | null;
  email: string;
  id: string;
  invitedAt: string | null;
  role: "admin" | "member";
};

export type AdminPurchase = {
  amountMinor: number;
  currency: string;
  externalSaleCode: string;
  id: string;
  memberId: string | null;
  occurredAt: string;
  status: string;
};

export type AdminGrant = {
  grantedAt: string;
  id: string;
  memberId: string;
  productCode: string;
  reason: string | null;
  revokedAt: string | null;
  source: "manual" | "purchase";
};

export type AdminOffer = {
  active: boolean;
  checkoutUrl: string | null;
  externalPlanCode: string;
  externalProductCode: string;
  id: string;
  productCode: string;
};

export type AdminAuditEntry = {
  action: string;
  actorId: string | null;
  id: number;
  occurredAt: string;
  targetId: string;
  targetType: string;
};

export type AdminPrompt = {
  createdAt: string;
  id: string;
  prompt: string;
  publishedAt: string | null;
  retiredAt: string | null;
  version: number;
};

export type AdminWorkspace = {
  audit: AdminAuditEntry[];
  counts: {
    activeAccess: number;
    events: number;
    members: number;
    purchases: number;
  };
  grants: AdminGrant[];
  members: AdminMember[];
  offers: AdminOffer[];
  prompts: AdminPrompt[];
  products: AdminProduct[];
  purchases: AdminPurchase[];
};

function failIfError(error: { code?: string } | null, operation: string) {
  if (error) {
    throw new Error(`${operation}_failed:${error.code ?? "unknown"}`);
  }
}

export async function loadAdminWorkspace(): Promise<AdminWorkspace> {
  await requireAdmin();
  const client = await createSupabaseServerClient();

  const [
    productsResult,
    membersResult,
    purchasesResult,
    grantsResult,
    revocationsResult,
    offersResult,
    auditResult,
    eventsResult,
    promptsResult,
  ] = await Promise.all([
    client
      .from("products")
      .select("code,name,description,active,sort_order")
      .order("sort_order"),
    client
      .from("profiles")
      .select("id,email,display_name,role,created_at,invited_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .limit(100),
    client
      .from("purchases")
      .select(
        "id,external_sale_code,member_id,status,amount_minor,currency,occurred_at",
        { count: "exact" },
      )
      .order("occurred_at", { ascending: false })
      .limit(100),
    client
      .from("access_grants")
      .select(
        "id,member_id,product_code,source,reason,granted_at",
        { count: "exact" },
      )
      .order("granted_at", { ascending: false })
      .limit(100),
    client
      .from("access_revocations")
      .select("grant_id,revoked_at")
      .order("revoked_at", { ascending: false })
      .limit(100),
    client
      .from("external_offers")
      .select(
        "id,external_product_code,external_plan_code,product_code,checkout_url,active",
      )
      .order("created_at", { ascending: false }),
    client
      .from("audit_log")
      .select("id,actor_id,action,target_type,target_id,occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(50),
    client
      .from("incoming_events")
      .select("id", { count: "exact", head: true }),
    client
      .from("ai_prompt_versions")
      .select("id,version,prompt,created_at,published_at,retired_at")
      .order("version", { ascending: false })
      .limit(20),
  ]);

  for (const [operation, result] of [
    ["admin_products", productsResult],
    ["admin_members", membersResult],
    ["admin_purchases", purchasesResult],
    ["admin_grants", grantsResult],
    ["admin_revocations", revocationsResult],
    ["admin_offers", offersResult],
    ["admin_audit", auditResult],
    ["admin_events", eventsResult],
    ["admin_prompts", promptsResult],
  ] as const) {
    failIfError(result.error, operation);
  }

  const revokedByGrant = new Map(
    (revocationsResult.data ?? []).map((row) => [
      row.grant_id as string,
      row.revoked_at as string,
    ]),
  );
  const grants = (grantsResult.data ?? []).map((row) => ({
    grantedAt: row.granted_at as string,
    id: row.id as string,
    memberId: row.member_id as string,
    productCode: row.product_code as string,
    reason: row.reason as string | null,
    revokedAt: revokedByGrant.get(row.id as string) ?? null,
    source: row.source as "manual" | "purchase",
  }));

  return {
    audit: (auditResult.data ?? []).map((row) => ({
      action: row.action as string,
      actorId: row.actor_id as string | null,
      id: row.id as number,
      occurredAt: row.occurred_at as string,
      targetId: row.target_id as string,
      targetType: row.target_type as string,
    })),
    counts: {
      activeAccess: grants.filter((grant) => !grant.revokedAt).length,
      events: eventsResult.count ?? 0,
      members: membersResult.count ?? 0,
      purchases: purchasesResult.count ?? 0,
    },
    grants,
    members: (membersResult.data ?? []).map((row) => ({
      createdAt: row.created_at as string,
      displayName: row.display_name as string | null,
      email: row.email as string,
      id: row.id as string,
      invitedAt: row.invited_at as string | null,
      role: row.role as "admin" | "member",
    })),
    offers: (offersResult.data ?? []).map((row) => ({
      active: row.active as boolean,
      checkoutUrl: row.checkout_url as string | null,
      externalPlanCode: row.external_plan_code as string,
      externalProductCode: row.external_product_code as string,
      id: row.id as string,
      productCode: row.product_code as string,
    })),
    prompts: (promptsResult.data ?? []).map((row) => ({
      createdAt: row.created_at as string,
      id: row.id as string,
      prompt: row.prompt as string,
      publishedAt: row.published_at as string | null,
      retiredAt: row.retired_at as string | null,
      version: row.version as number,
    })),
    products: (productsResult.data ?? []).map((row) => ({
      active: row.active as boolean,
      code: row.code as string,
      description: row.description as string | null,
      name: row.name as string,
      sortOrder: row.sort_order as number,
    })),
    purchases: (purchasesResult.data ?? []).map((row) => ({
      amountMinor: Number(row.amount_minor),
      currency: row.currency as string,
      externalSaleCode: row.external_sale_code as string,
      id: row.id as string,
      memberId: row.member_id as string | null,
      occurredAt: row.occurred_at as string,
      status: row.status as string,
    })),
  };
}
