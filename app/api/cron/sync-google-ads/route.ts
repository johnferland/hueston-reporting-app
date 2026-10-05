import { NextResponse } from "next/server";
import { listBrandsForSync } from "@/lib/brands";
import { getSupabaseAdmin } from "@/lib/supabase";
import { syncGoogleAdsForBrand } from "@/lib/integrations/google-ads";
import { CRON_SYNC_DAYS, syncDateRange } from "@/lib/integrations/sync-window";

export const maxDuration = 300;

async function logFailure(brandId: string, error: unknown) {
  const supabase = getSupabaseAdmin();
  await supabase.from("sync_logs").insert({
    brand_id: brandId,
    source: "google_ads",
    status: "error",
    message: error instanceof Error ? error.message : "Google Ads cron failed",
  });
}

export async function GET() {
  const brands = await listBrandsForSync();
  const { startDate, endDate } = syncDateRange(CRON_SYNC_DAYS);

  let failures = 0;
  for (const brand of brands) {
    try {
      await syncGoogleAdsForBrand(brand.id, startDate, endDate);
    } catch (error) {
      failures += 1;
      await logFailure(brand.id, error);
    }
  }

  return NextResponse.json({ ok: failures === 0, total: brands.length, failures });
}
