import { NextResponse } from "next/server";
import { listBrandsForSync } from "@/lib/brands";
import { getSupabaseAdmin } from "@/lib/supabase";
import { syncMetaAdsForBrand } from "@/lib/integrations/meta-ads";
import { CRON_SYNC_DAYS, syncDateRange } from "@/lib/integrations/sync-window";

export const maxDuration = 300;

async function logFailure(brandId: string, error: unknown) {
  const supabase = getSupabaseAdmin();
  await supabase.from("sync_logs").insert({
    brand_id: brandId,
    source: "meta_ads",
    status: "error",
    message: error instanceof Error ? error.message : "Meta Ads cron failed",
  });
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  const activeIds = new Set((await listBrandsForSync()).map((brand) => brand.id));
  const { data: creds } = await supabase.from("brand_credentials").select("brand_id, meta_ad_account_id");
  const { startDate, endDate } = syncDateRange(CRON_SYNC_DAYS);

  const brands = (creds ?? []).filter((row) => row.meta_ad_account_id && activeIds.has(row.brand_id as string));
  let failures = 0;
  for (const row of brands) {
    try {
      await syncMetaAdsForBrand(row.brand_id as string, startDate, endDate);
    } catch (error) {
      failures += 1;
      await logFailure(row.brand_id as string, error);
    }
  }

  return NextResponse.json({ ok: failures === 0, total: brands.length, failures });
}
