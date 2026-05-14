export const FREE_PLAN_LIMITS = {
  projects: 3,
  monthlyMessages: 50,
  historyDays: 7,
} as const;

export function getFreePlanHistoryCutoff(now = new Date()) {
  return new Date(now.getTime() - FREE_PLAN_LIMITS.historyDays * 24 * 60 * 60 * 1000);
}
