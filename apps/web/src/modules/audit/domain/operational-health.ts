export type OperationalHealthSnapshot = {
  deadJobs: number;
  overdueJobs: number;
  staleLocks: number;
  unprocessedEvents: number;
};

export type OperationalHealthIssue = keyof OperationalHealthSnapshot;

export function evaluateOperationalHealth(
  snapshot: OperationalHealthSnapshot,
) {
  const issues = (Object.keys(snapshot) as OperationalHealthIssue[]).filter(
    (key) => snapshot[key] > 0,
  );
  return {
    healthy: issues.length === 0,
    issues,
    snapshot,
  };
}
