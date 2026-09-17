import { isoDateDaysAgo } from "@/lib/integrations/google-auth";

/** Year (365d) plus the prior year so period-over-period still has data. */
export const DASHBOARD_SYNC_DAYS = 730;
/** Weekly cron (Monday 11:00 UTC in vercel.json = 7:00 AM Eastern during EDT). Refreshes last completed Mon–Sun. */
export const CRON_SYNC_DAYS = 7;

export function syncDateRange(days: number): { startDate: string; endDate: string } {
  return {
    startDate: isoDateDaysAgo(days),
    endDate: isoDateDaysAgo(1),
  };
}
