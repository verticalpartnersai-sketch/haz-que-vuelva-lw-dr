import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

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

const aiUsageSchema = z.object({
  completed_generations: z.number().int().nonnegative(),
  missing_usage: z.number().int().nonnegative(),
  total_tokens: z.number().int().nonnegative(),
});

export class SupabaseOperationalHealth {
  constructor(private readonly client: SupabaseClient) {}

  async snapshot(
    reference = new Date(),
    includeAiUsage = false,
  ): Promise<OperationalHealthSnapshot> {
    const overdueAt = new Date(reference.getTime() - 10 * 60_000).toISOString();
    const staleLockAt = new Date(reference.getTime() - 5 * 60_000).toISOString();
    const usageSince = new Date(
      reference.getTime() - 24 * 60 * 60_000,
    ).toISOString();
    const usagePromise = includeAiUsage
      ? this.client.rpc("get_ai_usage_health", { p_since: usageSince })
      : Promise.resolve({
          data: {
            completed_generations: 0,
            missing_usage: 0,
            total_tokens: 0,
          },
          error: null,
        });
    const [dead, overdue, stale, unprocessed, usageResult] = await Promise.all([
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
      usagePromise,
    ]);
    if (usageResult.error) {
      throw new Error(
        `Operational health query failed:ai_usage:${usageResult.error.code ?? "unknown"}`,
      );
    }
    const usage = aiUsageSchema.parse(usageResult.data);
    return {
      aiGenerations24h: usage.completed_generations,
      aiTokens24h: usage.total_tokens,
      aiUsageRowsMissing: usage.missing_usage,
      deadJobs: count("dead_jobs", dead),
      overdueJobs: count("overdue_jobs", overdue),
      staleLocks: count("stale_locks", stale),
      unprocessedEvents: count("unprocessed_events", unprocessed),
    };
  }
}
