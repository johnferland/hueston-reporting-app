import { endOfMonth, format, parse, startOfMonth, subMonths } from "date-fns";
import { getBrandPeriodMetrics, type BrandPeriodMetrics } from "@/lib/metrics";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { DateRange } from "@/lib/aggregation";

export type MonthlyReport = {
  id: string;
  brand_id: string;
  month: string;
  slug: string;
  win_of_month: string;
  work_done: string;
  label: string;
};

const MONTH_INPUT = /^\d{4}-(0[1-9]|1[0-2])$/;

function missingTable(message: string | undefined) {
  return Boolean(
    message && /could not find the table|relation ["']?(?:\w+\.)?monthly_reports["']? does not exist|schema cache/i.test(message),
  );
}

export function reportPath(slug: string, page?: "work") {
  return page ? `/reports/${slug}?page=work` : `/reports/${slug}`;
}

export function previousMonthInput(now = new Date()): string {
  return format(subMonths(now, 1), "yyyy-MM");
}

export function monthWindow(month: string): {
  current: DateRange;
  previous: DateRange;
  label: string;
  slugMonth: string;
  year: string;
} {
  if (!MONTH_INPUT.test(month)) throw new Error("Choose a month like 2026-08.");
  const start = startOfMonth(parse(month, "yyyy-MM", new Date()));
  const previousStart = startOfMonth(subMonths(start, 1));
  return {
    current: { start: format(start, "yyyy-MM-dd"), end: format(endOfMonth(start), "yyyy-MM-dd") },
    previous: {
      start: format(previousStart, "yyyy-MM-dd"),
      end: format(endOfMonth(previousStart), "yyyy-MM-dd"),
    },
    label: format(start, "MMMM yyyy"),
    slugMonth: format(start, "MMMM").toLowerCase(),
    year: format(start, "yyyy"),
  };
}

export function reportSlug(month: string, brandSlug: string): string {
  const window = monthWindow(month);
  return `${window.slugMonth}-${window.year}-${brandSlug}`;
}

function mapReport(row: Record<string, unknown>): MonthlyReport {
  const month = String(row.month).slice(0, 7);
  return {
    id: String(row.id),
    brand_id: String(row.brand_id),
    month,
    slug: String(row.slug),
    win_of_month: String(row.win_of_month),
    work_done: String(row.work_done),
    label: monthWindow(month).label,
  };
}

export async function listMonthlyReports(): Promise<MonthlyReport[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("monthly_reports").select("*").order("month", { ascending: false });
  if (error) {
    if (missingTable(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((row) => mapReport(row as Record<string, unknown>));
}

export async function latestReportForBrand(brandId: string): Promise<MonthlyReport | null> {
  const reports = await listMonthlyReports();
  return reports.find((report) => report.brand_id === brandId) ?? null;
}

export async function getMonthlyReportBySlug(slug: string): Promise<MonthlyReport | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("monthly_reports").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    if (missingTable(error.message)) return null;
    throw new Error(error.message);
  }
  return data ? mapReport(data as Record<string, unknown>) : null;
}

export async function saveMonthlyReport(input: {
  brandId: string;
  brandSlug: string;
  month: string;
  winOfMonth: string;
  workDone: string;
}): Promise<MonthlyReport> {
  const winOfMonth = input.winOfMonth.trim();
  const workDone = input.workDone.trim();
  if (!winOfMonth) throw new Error("Win of the month is required.");
  if (!workDone) throw new Error("Work done last month is required.");
  const window = monthWindow(input.month);
  const slug = reportSlug(input.month, input.brandSlug);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("monthly_reports")
    .upsert(
      {
        brand_id: input.brandId,
        month: window.current.start,
        slug,
        win_of_month: winOfMonth,
        work_done: workDone,
      },
      { onConflict: "brand_id,month" },
    )
    .select("*")
    .single();
  if (error) {
    if (missingTable(error.message)) {
      throw new Error("Run supabase/add-monthly-reports.sql in the Supabase SQL editor, then generate the report again.");
    }
    throw new Error(error.message);
  }
  return mapReport(data as Record<string, unknown>);
}

export async function metricsForReportMonth(brandId: string, month: string): Promise<BrandPeriodMetrics> {
  const window = monthWindow(month);
  return getBrandPeriodMetrics(brandId, window.current, "month", {
    previous: window.previous,
    asOf: { current: window.current.end, previous: window.previous.end },
  });
}
