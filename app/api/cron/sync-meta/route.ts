import { NextResponse } from "next/server";
import { listBrandsForSync } from "@/lib/brands";
import { getSupabaseAdmin } from "@/lib/supabase";
import { syncMetaAdsForBrand } from "@/lib/integrations/meta-ads";
import { CRON_SYNC_DAYS, syncDateRange } from "@/lib/integrations/sync-window";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const activeIds = new Set((await listBrandsForSync()).map((brand) => brand.id));
  const { data: creds } = await supabase.from("brand_credentials").select("brand_id, meta_ad_account_id");
  const { startDate, endDate } = syncDateRange(CRON_SYNC_DAYS);

  const brands = (creds ?? []).filter((row) => row.meta_ad_account_id && activeIds.has(row.brand_id as string));
  const results = await Promise.allSettled(
    brands.map((row) => syncMetaAdsForBrand(row.brand_id as string, startDate, endDate)),
  );

  const failures = results.filter((result) => result.status === "rejected").length;
  return NextResponse.json({ ok: failures === 0, total: results.length, failures });
}
