import type { SupabaseClient } from "@supabase/supabase-js";

import type { OperationalHealthSnapshot } from "@/modules/audit/domain/operational-health";

type CountResult = {
  count: number | null;
  error: { code?: string } | null;
};

function count(name: string, result: CountResult) {
  if (result.error) {
    throw new Error(
      `Operational health query failed:${name}:${result.error.code ?? "unknown"}`,
    );
  }
  return result.count ?? 0;
}
export class SupabaseOperationalHealth {
  constructor(private readonly client: SupabaseClient) {}

  async snapshot(reference = new Date()): Promise<OperationalHealthSnapshot> {
    const overdueAt = new Date(reference.getTime() - 10 * 60_000).toISOString();
    const staleLockAt = new Date(reference.getTime() - 5 * 60_000).toISOString();
    const [dead, overdue, stale, unprocessed] = await Promise.all([
      this.client
        .from("outbox_jobs")
        .select("id", { count: "exact", head: true })
        .not("failed_at", "is", null),
      this.client
        .from("outbox_jobs")
        .select("id", { count: "exact", head: true })
        .is("completed_at", null)
        .is("failed_at", null)
        .is("locked_at", null)
        .lte("available_at", overdueAt),
      this.client
        .from("outbox_jobs")
        .select("id", { count: "exact", head: true })
        .is("completed_at", null)
        .is("failed_at", null)
        .lte("locked_at", staleLockAt),
      this.client
        .from("incoming_events")
        .select("id", { count: "exact", head: true })
        .is("processed_at", null)
        .lte("received_at", overdueAt),
    ]);
    return {
      deadJobs: count("dead_jobs", dead),
      overdueJobs: count("overdue_jobs", overdue),
      staleLocks: count("stale_locks", stale),
      unprocessedEvents: count("unprocessed_events", unprocessed),
    };
  }
}
