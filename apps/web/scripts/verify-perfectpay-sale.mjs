import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const PRODUCTION_PROJECT_REF = "euaurfmlxornllntwmmh";
const PRODUCT_CODES = new Set([
  "haz_que_vuelva",
  "21_mensajes",
  "la_otra",
  "reconquista_30",
  "vuelve_ia",
]);

function usage() {
  console.log(
    "Usage: npm run payment:verify -- --sale <code> (--expect <product,...> | --expect-none)",
  );
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

if (process.argv.includes("--help")) {
  usage();
  process.exit(0);
}

const saleCode = argument("--sale");
const expectNone = process.argv.includes("--expect-none");
const expectedArgument = argument("--expect");
if (
  !saleCode ||
  !/^[A-Za-z0-9._:-]{3,128}$/.test(saleCode) ||
  (expectNone === Boolean(expectedArgument))
) {
  usage();
  process.exit(1);
}

const expectedProducts = expectNone
  ? []
  : [...new Set(expectedArgument.split(",").map((value) => value.trim()))].sort();
if (
  (expectedProducts.length === 0 && !expectNone) ||
  expectedProducts.some((code) => !PRODUCT_CODES.has(code))
) {
  console.error("Perfect Pay verification failed: invalid expected product list");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Perfect Pay verification failed: Supabase admin environment is unavailable");
  process.exit(1);
}
if (new URL(url).hostname !== `${PRODUCTION_PROJECT_REF}.supabase.co`) {
  console.error("Perfect Pay verification failed: remote target is not HQV production");
  process.exit(1);
}

const client = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: purchase, error: purchaseError } = await client
  .from("purchases")
  .select("id,member_id,status,amount_minor,currency,occurred_at")
  .eq("provider", "perfect_pay")
  .eq("external_sale_code", saleCode)
  .maybeSingle();
if (purchaseError || !purchase?.member_id) {
  console.error("Perfect Pay verification failed: sale projection was not found");
  process.exit(1);
}

const [
  itemsResult,
  grantsResult,
  eventsResult,
  profileResult,
  invitationResult,
  entitlementsResult,
] = await Promise.all([
    client
      .from("purchase_items")
      .select("product_code,external_product_code,external_plan_code")
      .eq("purchase_id", purchase.id),
    client
      .from("access_grants")
      .select("id,product_code")
      .eq("member_id", purchase.member_id)
      .eq("source", "purchase")
      .eq("source_reference", saleCode),
    client
      .from("incoming_events")
      .select("event_key,processed_at,processing_error")
      .eq("provider", "perfect_pay")
      .eq("sale_code", saleCode),
    client
      .from("profiles")
      .select("invited_at")
      .eq("id", purchase.member_id)
      .maybeSingle(),
    client
      .from("outbox_jobs")
      .select("completed_at,failed_at,last_error,attempts")
      .eq("job_type", "send_member_invitation")
      .eq("aggregate_id", purchase.member_id)
      .maybeSingle(),
    client
      .from("effective_entitlements")
      .select("product_code")
      .eq("member_id", purchase.member_id),
  ]);

for (const result of [
  itemsResult,
  grantsResult,
  eventsResult,
  profileResult,
  invitationResult,
  entitlementsResult,
]) {
  if (result.error) {
    console.error(`Perfect Pay verification failed: ${result.error.code}`);
    process.exit(1);
  }
}

const grants = grantsResult.data ?? [];
const grantIds = grants.map((grant) => grant.id);
const revocationsResult = grantIds.length
  ? await client
      .from("access_revocations")
      .select("grant_id,reason")
      .in("grant_id", grantIds)
  : { data: [], error: null };
if (revocationsResult.error) {
  console.error(`Perfect Pay verification failed: ${revocationsResult.error.code}`);
  process.exit(1);
}

const revokedGrantIds = new Set(
  (revocationsResult.data ?? []).map((revocation) => revocation.grant_id),
);
const purchaseItems = [...new Set(
  (itemsResult.data ?? []).map((item) => item.product_code),
)].sort();
const activeFromSale = [...new Set(
  grants
    .filter((grant) => !revokedGrantIds.has(grant.id))
    .map((grant) => grant.product_code),
)].sort();
const effectiveProducts = [...new Set(
  (entitlementsResult.data ?? []).map((entitlement) => entitlement.product_code),
)].sort();
const sameSet = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index]);
const events = eventsResult.data ?? [];
const invitation = invitationResult.data;
const invitationReady = Boolean(
  profileResult.data?.invited_at || invitation?.completed_at,
);
const failures = [];

if (!sameSet(purchaseItems, expectedProducts)) {
  failures.push("purchase_items_mismatch");
}
if (!sameSet(activeFromSale, expectedProducts)) {
  failures.push("active_grants_mismatch");
}
if (activeFromSale.some((productCode) => !effectiveProducts.includes(productCode))) {
  failures.push("effective_entitlement_missing");
}
if (events.length < Math.max(1, expectedProducts.length)) {
  failures.push("missing_normalized_events");
}
if (events.some((event) => !event.processed_at || event.processing_error)) {
  failures.push("event_processing_incomplete");
}
if (!invitationReady) failures.push("member_invitation_incomplete");
if (invitation?.failed_at) failures.push("member_invitation_failed");

const summary = {
  saleFingerprint: createHash("sha256").update(saleCode).digest("hex").slice(0, 12),
  purchase: {
    amountMinor: purchase.amount_minor,
    currency: purchase.currency,
    occurredAt: purchase.occurred_at,
    status: purchase.status,
  },
  products: {
    activeFromSale,
    effectiveForMember: effectiveProducts,
    expected: expectedProducts,
    purchaseItems,
  },
  events: {
    failed: events.filter((event) => event.processing_error).length,
    processed: events.filter((event) => event.processed_at).length,
    total: events.length,
  },
  invitation: {
    attempts: invitation?.attempts ?? 0,
    completed: invitationReady,
    failed: Boolean(invitation?.failed_at),
  },
  result: failures.length === 0 ? "passed" : "failed",
  failures,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(failures.length === 0 ? 0 : 1);
