import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140035_checkout_recovery_email.sql",
    import.meta.url,
  ),
  "utf8",
);

const retryMigration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140036_checkout_recovery_retry_reservation.sql",
    import.meta.url,
  ),
  "utf8",
);

const dedupeMigration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140037_checkout_recovery_recipient_dedupe.sql",
    import.meta.url,
  ),
  "utf8",
);

const confirmationMigration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140038_checkout_recovery_final_confirmation.sql",
    import.meta.url,
  ),
  "utf8",
);

const stateMachineMigration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140039_checkout_recovery_state_machine.sql",
    import.meta.url,
  ),
  "utf8",
);

const providerReconciliationMigration = readFileSync(
  new URL(
    "../../../supabase/migrations/202608140040_checkout_recovery_provider_reconciliation.sql",
    import.meta.url,
  ),
  "utf8",
);

test("checkout recovery migration creates isolated sequence and marketing suppression state", () => {
  assert.match(migration, /create table if not exists public\.checkout_recovery_sequences/i);
  assert.match(migration, /purchase_id uuid not null unique/i);
  assert.match(migration, /unsubscribe_token uuid not null unique/i);
  assert.match(migration, /create table if not exists public\.email_marketing_suppressions/i);
  assert.match(migration, /topic text not null/i);
  assert.match(migration, /enable row level security/i);
});

test("checkout recovery migration enqueues three PII-free jobs and stops them on conversion", () => {
  assert.match(migration, /send_checkout_recovery/g);
  assert.match(migration, /interval '30 minutes'/i);
  assert.match(migration, /interval '8 hours'/i);
  assert.match(migration, /interval '24 hours'/i);
  assert.match(
    migration,
    /jsonb_build_object\('sequence_id', v_sequence_id, 'step', 1\)/i,
  );
  const scheduler = migration.match(
    /function public\.schedule_checkout_recovery_from_item\(\)[\s\S]*?\$\$;/i,
  )?.[0];
  assert.ok(scheduler);
  assert.doesNotMatch(scheduler, /jsonb_build_object\([^;]*(recipient|customer_email)/i);
  assert.match(migration, /stop_checkout_recovery_on_purchase_status/i);
  assert.match(migration, /prevent_checkout_recovery_status_regression/i);
  assert.match(
    migration,
    /old\.status in \('approved', 'authorized', 'completed', 'cancelled', 'refunded', 'charged_back'\)[\s\S]*new\.status = 'precheckout'/i,
  );
  assert.match(migration, /new\.status <> 'precheckout'/i);
});

test("checkout recovery migration exposes server-only resolution, completion, unsubscribe and aggregate preview RPCs", () => {
  for (const functionName of [
    "resolve_checkout_recovery_sequence",
    "complete_checkout_recovery_job",
    "unsubscribe_checkout_recovery",
    "preview_checkout_recovery_backfill",
  ]) {
    assert.match(migration, new RegExp(`function public\\.${functionName}`, "i"));
  }
  assert.match(migration, /revoke all on function[\s\S]*from public/i);
  assert.match(migration, /grant execute on function[\s\S]*to service_role/i);
});

test("checkout recovery rollout is fail-closed and reservation excludes existing buyers atomically", () => {
  assert.match(migration, /create table if not exists public\.checkout_recovery_rollout/i);
  assert.match(migration, /enabled boolean not null default false/i);
  assert.match(migration, /reserve_checkout_recovery_job/i);
  assert.match(migration, /status = 'sending'/i);
  assert.match(
    migration,
    /not exists \([\s\S]*purchase_items[\s\S]*buyer_purchase\.status in \('approved', 'authorized', 'completed'\)/i,
  );
  assert.match(migration, /p_outcome = 'converted'[\s\S]*status = 'converted'/i);
  assert.match(migration, /when status = 'clicked' then status/i);
});

test("checkout recovery retry can resume a provider-accepted message", () => {
  assert.match(retryMigration, /message\.status in \('queued', 'sending'\)/i);
  assert.match(retryMigration, /reserve_checkout_recovery_job/i);
});

test("checkout recovery scheduler deduplicates recipients under concurrency", () => {
  assert.match(dedupeMigration, /pg_advisory_xact_lock/i);
  assert.match(dedupeMigration, /lower\(trim\(existing_purchase\.customer_email\)\)/i);
  assert.match(dedupeMigration, /existing_sequence\.status = 'active'/i);
  assert.match(dedupeMigration, /existing_item\.product_code = 'haz_que_vuelva'/i);
});

test("checkout recovery confirms eligibility at the delivery boundary and previews existing buyers", () => {
  assert.match(confirmationMigration, /confirm_checkout_recovery_job/i);
  assert.match(confirmationMigration, /message\.status = 'sending'/i);
  assert.match(confirmationMigration, /job\.completed_at is null/i);
  assert.match(confirmationMigration, /buyer_purchase\.status in \('approved', 'authorized', 'completed'\)/i);
  assert.match(confirmationMigration, /has_paid_purchase/i);
  assert.match(confirmationMigration, /not has_paid_purchase/i);
});

test("checkout recovery state machine finalizes terminal retry and remaining sequence work", () => {
  assert.match(stateMachineMigration, /retry_checkout_recovery_job/i);
  assert.match(stateMachineMigration, /failed_at = case when p_terminal then now\(\) else null end/i);
  assert.match(stateMachineMigration, /if p_terminal then[\s\S]*set status = 'failed'/i);
  assert.match(stateMachineMigration, /status in \('queued', 'sending'\)/i);
  assert.match(stateMachineMigration, /p_outcome in \('converted', 'suppressed', 'ineligible'\)/i);
  assert.match(stateMachineMigration, /last_error = p_outcome/i);
});

test("checkout recovery records a provider-accepted send after concurrent sequence stop", () => {
  assert.match(providerReconciliationMigration, /if job_row\.id is null and p_outcome = 'sent' then/i);
  assert.match(providerReconciliationMigration, /status in \('sending', 'skipped', 'suppressed'\)/i);
  assert.match(providerReconciliationMigration, /provider_message_id = p_provider_message_id/i);
  assert.match(providerReconciliationMigration, /sent_at = coalesce\(sent_at, now\(\)\)/i);
});
