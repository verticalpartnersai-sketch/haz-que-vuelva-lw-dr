export type OperationalHealthSnapshot = {
  aiGenerations24h: number;
  aiTokens24h: number;
  aiUsageRowsMissing: number;
  deadJobs: number;
  overdueJobs: number;
  staleLocks: number;
  unprocessedEvents: number;
};

export type OperationalHealthIssue =
  | "aiDailyTokenBudgetExceeded"
  | "aiUsageRowsMissing"
  | "deadJobs"
  | "overdueJobs"
  | "staleLocks"
  | "unprocessedEvents";

export function evaluateOperationalHealth(
  snapshot: OperationalHealthSnapshot,
  aiDailyTokenBudget?: number,
) {
  const issues: OperationalHealthIssue[] = [];
  for (const key of [
    "deadJobs",
    "overdueJobs",
    "staleLocks",
    "unprocessedEvents",
    "aiUsageRowsMissing",
  ] as const) {
    if (snapshot[key] > 0) issues.push(key);
  }
  if (
    aiDailyTokenBudget !== undefined &&
    snapshot.aiTokens24h >= aiDailyTokenBudget
  ) {
    issues.push("aiDailyTokenBudgetExceeded");
  }
  return {
    healthy: issues.length === 0,
    issues,
    snapshot,
  };
}
