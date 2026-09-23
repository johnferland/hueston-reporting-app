import { notFound, redirect } from "next/navigation";
import { canAccessBrand, requireAppUser } from "@/lib/auth";
import { getBrandById } from "@/lib/brands";
import { metricsForReportMonth, getMonthlyReportBySlug, reportPath } from "@/lib/monthly-reports";
import { AI_REFERRAL_PATTERNS } from "@/lib/integrations/ga4";
import { Button, MetricCard, Page, PageHeader, Panel, ReportMarkdown, Section, TextMuted } from "@/components/ui";

export const dynamic = "force-dynamic";

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

  return (
    <Page brand={brand.slug}>
      <PageHeader
        title={`${brand.name}`}
        description={`${report.label} monthly report`}
        actions={
          <Button href={`/brand/${brand.slug}`} variant="secondary">
            Back to dashboard
          </Button>
        }
      />

      {workPage ? (
        <Section title="Work done last month">
          <Panel>
            <ReportMarkdown source={report.work_done} />
          </Panel>
          <Button href={reportPath(report.slug)} variant="secondary">
            Back to results
          </Button>
        </Section>
      ) : (
        <>
          <Section title="Win of the month">
            <Panel>
              <ReportMarkdown source={report.win_of_month} />
            </Panel>
          </Section>

          {metrics && sections.leads ? (
            <Section title="Leads">
              <TextMuted>Compared with the previous month.</TextMuted>
              <div className="ds-grid">
                <MetricCard label="Total leads" hint="totalLeads" metric={metrics.totalLeads} />
                <MetricCard label="Web leads" hint="webLeads" metric={metrics.webLeads} />
                <MetricCard label="Offline leads" hint="offlineLeads" metric={metrics.offlineLeads} />
              </div>
            </Section>
          ) : null}

          {metrics && sections.search ? (
            <Section title="Search">
              <TextMuted>Compared with the previous month.</TextMuted>
              <div className="ds-grid">
                <MetricCard label="Keywords top 3" hint="keywordsTop3" metric={metrics.keywordsTop3} />
                <MetricCard label="Organic traffic" hint="organicTraffic" metric={metrics.organicTraffic} />
                <MetricCard label="New users" hint="newUsers" metric={metrics.newUsers} />
                <MetricCard label="Total keywords" hint="totalKeywords" metric={metrics.totalKeywords} />
                <MetricCard label="Clicks" hint="searchClicks" metric={metrics.clicks} />
                <MetricCard label="Impressions" hint="searchImpressions" metric={metrics.impressions} />
                <MetricCard label="CTR" hint="searchCtr" metric={metrics.ctr} digits={1} suffix="%" />
                <MetricCard label="Avg. position" hint="avgPosition" metric={metrics.avgPosition} digits={1} lowerIsBetter />
              </div>
            </Section>
          ) : null}

          {metrics && sections.google_ads ? (
            <Section title="Google Ads">
              <div className="ds-grid">
                <MetricCard label="Ad spend" hint="googleSpend" metric={metrics.googleSpend} digits={2} prefix="$" lowerIsBetter />
                <MetricCard label="Impressions" hint="googleImpressions" metric={metrics.googleImpressions} />
                <MetricCard label="Clicks" hint="googleClicks" metric={metrics.googleClicks} />
                <MetricCard label="CPC" hint="googleCpc" metric={metrics.googleCpc} digits={2} prefix="$" lowerIsBetter />
                <MetricCard label="Conversions" hint="googleConversions" metric={metrics.googleConversions} />
                <MetricCard label="Cost per conversion" hint="googleCostPerConversion" metric={metrics.googleCostPerConversion} digits={2} prefix="$" lowerIsBetter />
              </div>
            </Section>
          ) : null}

          {metrics && sections.meta_ads ? (
            <Section title="Meta Ads">
              <div className="ds-grid">
                <MetricCard label="Ad spend" hint="metaSpend" metric={metrics.metaSpend} digits={2} prefix="$" lowerIsBetter />
                <MetricCard label="Impressions" hint="metaImpressions" metric={metrics.metaImpressions} />
                <MetricCard label="Clicks" hint="metaClicks" metric={metrics.metaClicks} />
                <MetricCard label="CPC" hint="metaCpc" metric={metrics.metaCpc} digits={2} prefix="$" lowerIsBetter />
                <MetricCard label="Leads" hint="metaLeads" metric={metrics.metaLeads} />
                <MetricCard label="CTR" hint="metaCtr" metric={metrics.metaCtr} digits={2} suffix="%" />
                <MetricCard label="Cost per lead" hint="metaCostPerLead" metric={metrics.metaCostPerLead} digits={2} prefix="$" lowerIsBetter />
              </div>
            </Section>
          ) : null}

          {metrics && sections.ai ? (
            <Section title="AI visibility">
              <div className="ds-grid">
                <MetricCard label="Total AI referral traffic" hint="aiTotal" metric={metrics.aiTotal} />
                {AI_REFERRAL_PATTERNS.map((pattern) => (
                  <MetricCard key={pattern.key} label={pattern.label} hint={pattern.key} metric={metrics.aiReferrals[pattern.key]} />
                ))}
              </div>
            </Section>
          ) : null}

          <Button href={reportPath(report.slug, "work")}>Work done last month</Button>
        </>
      )}
    </Page>
  );
}
