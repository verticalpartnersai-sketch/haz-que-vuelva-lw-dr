import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const PRODUCTION_PROJECT_REF = "euaurfmlxornllntwmmh";
const execute = process.argv.includes("--execute");
const rawEmail = process.argv.find(
  (argument) => !argument.startsWith("--") && argument !== process.argv[0] && argument !== process.argv[1],
);

if (process.argv.includes("--help")) {
  console.log("Usage: npm run admin:bootstrap -- admin@example.com [--execute]");
  process.exit(0);
}

const parsedEmail = z.email().max(254).safeParse(rawEmail?.trim().toLowerCase());
if (!parsedEmail.success) {
  console.error("First-admin bootstrap refused: a valid email is required");
  process.exit(1);
}

const email = parsedEmail.data;
const expectedConfirmation = `BOOTSTRAP_ADMIN:${email}`;
if (execute && process.env.HQV_ADMIN_BOOTSTRAP_CONFIRM !== expectedConfirmation) {
  console.error(
    "First-admin bootstrap refused: HQV_ADMIN_BOOTSTRAP_CONFIRM does not match the target",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("First-admin bootstrap refused: Supabase admin environment is unavailable");
  process.exit(1);
}

let projectHost;
try {
  projectHost = new URL(url).hostname;
} catch {
  console.error("First-admin bootstrap refused: Supabase URL is invalid");
  process.exit(1);
}
if (projectHost !== `${PRODUCTION_PROJECT_REF}.supabase.co`) {
  console.error("First-admin bootstrap refused: target is not the HQV production project");
  process.exit(1);
}

const fingerprint = createHash("sha256").update(email).digest("hex").slice(0, 12);
const client = createClient(url, secret, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: admins, error: adminsError } = await client
  .from("profiles")
  .select("id")
  .eq("role", "admin")
  .limit(2);
if (adminsError) {
  console.error(`First-admin bootstrap failed: admin lookup ${adminsError.code}`);
  process.exit(1);
}

const { data: existing, error: profileError } = await client
  .from("profiles")
  .select("id,role,invited_at")
  .eq("email", email)
  .maybeSingle();
if (profileError) {
  console.error(`First-admin bootstrap failed: profile lookup ${profileError.code}`);
  process.exit(1);
}

const targetIsExistingAdmin = existing?.role === "admin";
if ((admins?.length ?? 0) > 0 && !targetIsExistingAdmin) {
  console.error("First-admin bootstrap refused: an administrator already exists");
  process.exit(1);
}

console.log(
  JSON.stringify({
    execute,
    targetFingerprint: fingerprint,
    targetState: existing?.role ?? "missing",
    existingAdminCount: admins?.length ?? 0,
  }),
);
if (!execute) {
  console.log("Plan only. Re-run with --execute and the exact confirmation value.");
  process.exit(0);
}

let memberId = existing?.id;
let created = false;
if (!memberId) {
  const { data, error } = await client.auth.admin.createUser({
    email,
    email_confirm: false,
  });
  if (error || !data.user) {
    console.error(`First-admin bootstrap failed: user creation ${error?.code ?? "unknown"}`);
    process.exit(1);
  }
  memberId = data.user.id;
  created = true;
}

const { data: promotedId, error: promotionError } = await client.rpc(
  "promote_admin_by_email",
  { p_email: email },
);
if (promotionError || promotedId !== memberId) {
  if (created) await client.auth.admin.deleteUser(memberId, false);
  console.error(
    `First-admin bootstrap failed: promotion ${promotionError?.code ?? "identity_mismatch"}`,
  );
  process.exit(1);
}

if (!existing?.invited_at) {
  const idempotencyKey = `member-invite/${memberId}`;
  const invitation = {
    job_type: "send_member_invitation",
    aggregate_type: "profile",
    aggregate_id: memberId,
    idempotency_key: idempotencyKey,
    payload: { member_id: memberId, email },
  };
  const { error: queueError } = await client.from("outbox_jobs").insert(invitation);
  if (queueError?.code === "23505") {
    const { error: retryError } = await client
      .from("outbox_jobs")
      .update({
        available_at: new Date().toISOString(),
        failed_at: null,
        last_error: null,
        locked_at: null,
      })
      .eq("idempotency_key", idempotencyKey)
      .is("completed_at", null);
    if (retryError) {
      console.error(`First-admin bootstrap failed: invitation repair ${retryError.code}`);
      process.exit(1);
    }
  } else if (queueError) {
    console.error(`First-admin bootstrap failed: invitation queue ${queueError.code}`);
    process.exit(1);
  }
}

console.log(
  JSON.stringify({
    completed: true,
    invitationQueued: !existing?.invited_at,
    targetFingerprint: fingerprint,
  }),
);
