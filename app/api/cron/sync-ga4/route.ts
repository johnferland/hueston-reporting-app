import { NextResponse } from "next/server";
import { listBrandsForSync } from "@/lib/brands";
import { getSupabaseAdmin } from "@/lib/supabase";
import { syncGa4ForBrand } from "@/lib/integrations/ga4";
import { CRON_SYNC_DAYS, syncDateRange } from "@/lib/integrations/sync-window";

export const maxDuration = 300;

async function logFailure(brandId: string, error: unknown) {
  const supabase = getSupabaseAdmin();
  await supabase.from("sync_logs").insert({
    brand_id: brandId,
    source: "ga4",
    status: "error",
    message: error instanceof Error ? error.message : "GA4 cron failed",
  });
}

export async function GET() {
  const brands = await listBrandsForSync();
  const { startDate, endDate } = syncDateRange(CRON_SYNC_DAYS);

  let failures = 0;
  for (const brand of brands) {
    try {
      await syncGa4ForBrand(brand.id, startDate, endDate);
    } catch (error) {
      failures += 1;
      await logFailure(brand.id, error);
    }
  }

  return NextResponse.json({ ok: failures === 0, total: brands.length, failures });
}
