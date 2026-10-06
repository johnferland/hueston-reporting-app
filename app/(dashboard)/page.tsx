import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/auth";
import { getBrandById, listActiveBrands } from "@/lib/brands";
import { getBrandPeriodMetrics } from "@/lib/metrics";
import { formatPeriodCaption, getPeriodRange, isPeriodKey, type PeriodKey } from "@/lib/period";
import { PeriodToggle } from "@/components/period-toggle";
import { RollupList } from "@/components/rollup-list";
import { Page, PageHeader } from "@/components/ui";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await requireAppUser();

  if (user.role === "lab_manager") {
    if (!user.brand_ids.length) {
      return (
        <Page>
          <PageHeader title="No company assigned" description="Ask a Super Admin to assign your email to one or more companies." />
        </Page>
      );
    }
    const homeId =
      user.brand_id && user.brand_ids.includes(user.brand_id) ? user.brand_id : user.brand_ids[0];
    const brand = await getBrandById(homeId);
    redirect(brand ? `/brand/${brand.slug}` : "/sign-in");
  }

  const { period: periodParam } = await searchParams;
  const period: PeriodKey = isPeriodKey(periodParam) ? periodParam : "month";
  const range = getPeriodRange(period);
  const brands = await listActiveBrands();
  const rows = await Promise.all(
    brands.map(async (brand) => ({
      brand,
      metrics: await getBrandPeriodMetrics(brand.id, range, period),
    })),
  );

  return (
    <Page className="ds-page-rollup">
      <RollupList
        period={period}
        rows={rows}
        header={
          <PageHeader
            title="Executive rollup"
            description={`${formatPeriodCaption(period, range)}. Open a brand for the full dashboard.`}
            actions={<PeriodToggle current={period} basePath="/" />}
          />
        }
      />
    </Page>
  );
}
