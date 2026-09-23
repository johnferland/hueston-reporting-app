import { notFound, redirect } from "next/navigation";
import { canAccessBrand, requireAppUser } from "@/lib/auth";
import { getBrandById } from "@/lib/brands";
import type { BrandPeriodMetrics } from "@/lib/metrics";
import { metricsForReportMonth, getMonthlyReportBySlug, reportPath } from "@/lib/monthly-reports";
import { AI_REFERRAL_PATTERNS } from "@/lib/integrations/ga4";
import { formatNumber } from "@/lib/period";
import {
  Button,
  ReportActions,
  ReportBand,
  ReportChannel,
  ReportChannels,
  ReportGlance,
  ReportGlanceCard,
  ReportMarkdown,
  ReportPage,
  ReportTile,
  ReportTop,
  ReportWin,
  formatMetric,
  priorNote,
} from "@/components/ui";

export const dynamic = "force-dynamic";

function metaSummary(metrics: BrandPeriodMetrics) {
  return `Meta drove ${formatNumber(metrics.metaLeads.current)} leads on $${formatNumber(metrics.metaSpend.current, 2)} spend at $${formatNumber(metrics.metaCostPerLead.current, 2)} per lead.`;
}

function googleSummary(metrics: BrandPeriodMetrics) {
  return `Google Ads delivered ${formatNumber(metrics.googleConversions.current)} conversions on $${formatNumber(metrics.googleSpend.current, 2)} spend at $${formatNumber(metrics.googleCostPerConversion.current, 2)} per conversion.`;
}

export default async function MonthlyReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAppUser();
  const { slug } = await params;
  const { page } = await searchParams;
  const report = await getMonthlyReportBySlug(slug);
  if (!report) notFound();
  const brand = await getBrandById(report.brand_id);
  if (!brand || !canAccessBrand(user, brand.id)) redirect("/");

  const workPage = page === "work";
  const metrics = workPage ? null : await metricsForReportMonth(brand.id, report.month);
  const sections = brand.visible_sections;

  const glance = metrics
    ? [
        sections.leads
          ? {
              label: "Leads",
              value: formatMetric(metrics.totalLeads),
              note: priorNote(metrics.totalLeads),
              featured: true as const,
            }
          : null,
        sections.search
          ? {
              label: "Organic traffic",
              value: formatMetric(metrics.organicTraffic),
              note: priorNote(metrics.organicTraffic),
              featured: !sections.leads,
            }
          : null,
        sections.google_ads
          ? {
              label: "Google Ads",
              value: `${formatNumber(metrics.googleConversions.current)} conversions`,
              note: priorNote(metrics.googleConversions),
              featured: !sections.leads && !sections.search,
            }
          : null,
        sections.meta_ads
          ? {
              label: "Meta Ads",
              value: `${formatNumber(metrics.metaLeads.current)} leads`,
              note: priorNote(metrics.metaLeads),
              featured: !sections.leads && !sections.search && !sections.google_ads,
            }
          : null,
        sections.ai
          ? {
              label: "AI referrals",
              value: formatMetric(metrics.aiTotal),
              note: priorNote(metrics.aiTotal),
              featured: !sections.leads && !sections.search && !sections.google_ads && !sections.meta_ads,
            }
          : null,
      ].filter(Boolean)
    : [];

  return (
    <ReportPage>
      <ReportTop
        brand={brand.name}
        period={`${report.label} monthly report`}
        actions={
          <Button href={`/brand/${brand.slug}`} variant="secondary">
            Back to dashboard
          </Button>
        }
      />

      {workPage ? (
        <>
          <ReportBand tone="dark" eyebrow="Delivery" title="Work done last month">
            <ReportWin>
              <ReportMarkdown source={report.work_done} />
            </ReportWin>
          </ReportBand>
          <ReportActions>
            <Button href={reportPath(report.slug)} variant="secondary">
              Back to results
            </Button>
          </ReportActions>
        </>
      ) : (
        <>
          <ReportBand tone="dark" eyebrow="Highlight" title="Win of the month">
            <ReportWin>
              <ReportMarkdown source={report.win_of_month} />
            </ReportWin>
          </ReportBand>

          {metrics && glance.length ? (
            <ReportBand eyebrow="Performance snapshot" title="Month at a glance">
              <ReportGlance>
                {glance.map((card) =>
                  card ? (
                    <ReportGlanceCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      note={card.note}
                      featured={card.featured}
                    />
                  ) : null,
                )}
              </ReportGlance>
            </ReportBand>
          ) : null}

          {metrics && (sections.meta_ads || sections.google_ads) ? (
            <ReportBand eyebrow="Paid advertising" title="Ads performance">
              <ReportChannels>
                {sections.meta_ads ? (
                  <ReportChannel title="Meta Ads" summary={metaSummary(metrics)}>
                    <ReportTile label="Ad spend" metric={metrics.metaSpend} digits={2} prefix="$" lowerIsBetter />
                    <ReportTile label="Impressions" metric={metrics.metaImpressions} />
                    <ReportTile label="Clicks" metric={metrics.metaClicks} />
                    <ReportTile label="CPC" metric={metrics.metaCpc} digits={2} prefix="$" lowerIsBetter />
                    <ReportTile label="Leads" metric={metrics.metaLeads} />
                    <ReportTile label="Cost per lead" metric={metrics.metaCostPerLead} digits={2} prefix="$" lowerIsBetter />
                  </ReportChannel>
                ) : null}
                {sections.google_ads ? (
                  <ReportChannel title="Google Ads" summary={googleSummary(metrics)}>
                    <ReportTile label="Ad spend" metric={metrics.googleSpend} digits={2} prefix="$" lowerIsBetter />
                    <ReportTile label="Impressions" metric={metrics.googleImpressions} />
                    <ReportTile label="Clicks" metric={metrics.googleClicks} />
                    <ReportTile label="CPC" metric={metrics.googleCpc} digits={2} prefix="$" lowerIsBetter />
                    <ReportTile label="Conversions" metric={metrics.googleConversions} />
                    <ReportTile
                      label="Cost / conversion"
                      metric={metrics.googleCostPerConversion}
                      digits={2}
                      prefix="$"
                      lowerIsBetter
                    />
                  </ReportChannel>
                ) : null}
              </ReportChannels>
            </ReportBand>
          ) : null}

          {metrics && sections.leads ? (
            <ReportBand
              tone="dark"
              eyebrow="Conversions"
              title="Website leads"
              lead="Web and offline inquiries for the month, compared with the month before."
            >
              <ReportChannels>
                <ReportChannel title="Lead mix" summary={priorNote(metrics.totalLeads)}>
                  <ReportTile label="Total leads" metric={metrics.totalLeads} />
                  <ReportTile label="Web leads" metric={metrics.webLeads} />
                  <ReportTile label="Offline leads" metric={metrics.offlineLeads} />
                </ReportChannel>
              </ReportChannels>
            </ReportBand>
          ) : null}

          {metrics && sections.search ? (
            <ReportBand eyebrow="Organic search" title="Search performance">
              <ReportChannels>
                <ReportChannel title="Visibility" summary={priorNote(metrics.organicTraffic)}>
                  <ReportTile label="Keywords top 3" metric={metrics.keywordsTop3} />
                  <ReportTile label="Organic traffic" metric={metrics.organicTraffic} />
                  <ReportTile label="New users" metric={metrics.newUsers} />
                  <ReportTile label="Total keywords" metric={metrics.totalKeywords} />
                  <ReportTile label="Clicks" metric={metrics.clicks} />
                  <ReportTile label="Impressions" metric={metrics.impressions} />
                  <ReportTile label="CTR" metric={metrics.ctr} digits={1} suffix="%" />
                  <ReportTile label="Avg. position" metric={metrics.avgPosition} digits={1} lowerIsBetter />
                </ReportChannel>
              </ReportChannels>
            </ReportBand>
          ) : null}

          {metrics && sections.ai ? (
            <ReportBand eyebrow="AI visibility" title="AI referral traffic">
              <ReportChannels>
                <ReportChannel title="Referrals" summary={priorNote(metrics.aiTotal)}>
                  <ReportTile label="Total AI traffic" metric={metrics.aiTotal} />
                  {AI_REFERRAL_PATTERNS.map((pattern) => (
                    <ReportTile key={pattern.key} label={pattern.label} metric={metrics.aiReferrals[pattern.key]} />
                  ))}
                </ReportChannel>
              </ReportChannels>
            </ReportBand>
          ) : null}

          <ReportActions>
            <Button href={reportPath(report.slug, "work")}>Work done last month</Button>
          </ReportActions>
        </>
      )}
    </ReportPage>
  );
}
