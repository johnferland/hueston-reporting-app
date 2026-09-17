import { after, NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { syncGoogleMetrics, syncGoogleMetricsForBrand } from "@/lib/integrations/sync-google";
import { DASHBOARD_SYNC_DAYS } from "@/lib/integrations/sync-window";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }
  if (user.role !== "super_admin") {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const brandId = url.searchParams.get("brandId");
  const days = Math.min(
    DASHBOARD_SYNC_DAYS,
    Math.max(1, Number(url.searchParams.get("days") ?? DASHBOARD_SYNC_DAYS) || DASHBOARD_SYNC_DAYS),
  );

  after(async () => {
    try {
      if (brandId) await syncGoogleMetricsForBrand(brandId, days);
      else await syncGoogleMetrics(days);
    } catch (error) {
      console.error("Background Google sync failed", error);
    }
  });

  return NextResponse.json({
    ok: true,
    started: true,
    message: brandId
      ? "Sync started for this company. Keep using the dashboard; it can take a few minutes."
      : "Sync started for all companies. Keep using the dashboard; it can take a few minutes.",
  });
}
