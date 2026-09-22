import { redirect } from "next/navigation";
import { requireAppUser, canAccessBrand, canLogWeeklyLeads } from "@/lib/auth";
import { getBrandBySlug } from "@/lib/brands";
import { getBrandPeriodMetrics, listRecentLeads } from "@/lib/metrics";
import {
  listWebLeadsPage,
  parseWebLeadPage,
  parseWebLeadPageSize,
} from "@/lib/web-leads";
import {
  clampToToday,
  currentWeekStart,
  formatPeriodCaption,
  getPeriodRange,
  isIsoDate,
  isPeriodKey,
  orderedDateRange,
  type PeriodKey,
} from "@/lib/period";
import { PeriodToggle } from "@/components/period-toggle";
import { WebLeadsSection } from "@/components/web-leads-section";
import {
  Alert,
  Button,
  Field,
  Input,
  MetricCard,
  Page,
  PageHeader,
  Panel,
  Section,
  Table,
  TextMuted,
} from "@/components/ui";
import { saveWeeklyLeadsAction } from "./actions";
import { AI_REFERRAL_PATTERNS } from "@/lib/integrations/ga4";

export const dynamic = "force-dynamic";

export default async function BrandDashboard({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string }>;
  searchParams: Promise<{
    period?: string;
    saved?: string;
    error?: string;
    leads_from?: string;
    leads_to?: string;
    leads_page?: string;
    leads_per?: string;
  }>;
}) {
  const user = await requireAppUser();

  const { brandSlug } = await params;
  const {
    period: periodParam,
    saved,
    error,
    leads_from: leadsFromParam,
    leads_to: leadsToParam,
    leads_page: leadsPageParam,
    leads_per: leadsPerParam,
  } = await searchParams;
  const period: PeriodKey = isPeriodKey(periodParam) ? periodParam : "week";
  const range = getPeriodRange(period);
  const periodLabel = formatPeriodCaption(period, range);
  const leadsPer = parseWebLeadPageSize(leadsPerParam);
  const defaultLeadsRange = orderedDateRange(range.start, clampToToday(range.end));
  const leadsRange = orderedDateRange(
    isIsoDate(leadsFromParam) ? leadsFromParam : defaultLeadsRange.start,
    isIsoDate(leadsToParam) ? leadsToParam : defaultLeadsRange.end,
  );

  const brand = await getBrandBySlug(brandSlug);

  if (!brand) {
    return (
      <Page>
        <PageHeader title="Brand not found" />
      </Page>
    );
  }

  if (!canAccessBrand(user, brand.id)) {
    return (
      <Page>
        <PageHeader title="No access" description="You don't have access to this brand." />
      </Page>
    );
  }

  const sections = brand.visible_sections;
  const [metrics, recentLeads, webLeads] = await Promise.all([
    getBrandPeriodMetrics(brand.id, range, period),
    sections.offline_leads ? listRecentLeads(brand.id) : Promise.resolve([]),
    sections.web_leads
      ? listWebLeadsPage({
          brandId: brand.id,
          start: leadsRange.start,
          end: leadsRange.end,
          page: parseWebLeadPage(leadsPageParam),
          perPage: leadsPer,
        })
      : Promise.resolve(null),
  ]);
  const canEnterLeads = canLogWeeklyLeads(user, brand.id);
  const weekStart = currentWeekStart();
  const thisWeek = recentLeads.find((row) => row.week_start_date === weekStart);

  return (
    <Page brand={brandSlug}>
      <PageHeader
        title={brand.name}
        description={brand.domain}
        actions={
          <PeriodToggle
            current={period}
            basePath={`/brand/${brandSlug}`}
            extraParams={
              leadsFromParam || leadsToParam || leadsPerParam
                ? {
                    leads_from: leadsRange.start,
                    leads_to: leadsRange.end,
                    leads_per: String(leadsPer),
                  }
                : undefined
            }
          />
        }
      />

      {saved ? <Alert tone="ok">{saved}</Alert> : null}
      {error ? <Alert tone="err">{error}</Alert> : null}

      {sections.leads ? <Section title="Leads">
        <TextMuted>{periodLabel}</TextMuted>
        <div className="ds-grid">
          <MetricCard label="Total leads" hint="totalLeads" metric={metrics.totalLeads} />
          <MetricCard label="Web leads" hint="webLeads" metric={metrics.webLeads} />
          <MetricCard label="Offline leads" hint="offlineLeads" metric={metrics.offlineLeads} />
        </div>
      </Section> : null}

      {sections.search ? <Section title="Search">
        <TextMuted>{periodLabel}</TextMuted>
        <div className="ds-grid">
          <MetricCard label="Keywords top 3" hint="keywordsTop3" metric={metrics.keywordsTop3} />
          <MetricCard label="Organic reach" hint="organicReach" metric={metrics.organicReach} />
          <MetricCard label="Organic traffic" hint="organicTraffic" metric={metrics.organicTraffic} />
          <MetricCard label="New users" hint="newUsers" metric={metrics.newUsers} />
          <MetricCard label="Total keywords" hint="totalKeywords" metric={metrics.totalKeywords} />
          <MetricCard label="Clicks" hint="searchClicks" metric={metrics.clicks} />
          <MetricCard label="Impressions" hint="searchImpressions" metric={metrics.impressions} />
          <MetricCard label="CTR" hint="searchCtr" metric={metrics.ctr} digits={1} suffix="%" />
          <MetricCard label="Avg. position" hint="avgPosition" metric={metrics.avgPosition} digits={1} lowerIsBetter />
        </div>
      </Section> : null}

      {sections.google_ads ? <Section title="Google Ads">
        <TextMuted>{periodLabel}</TextMuted>
        <div className="ds-grid">
          <MetricCard label="Ad spend" hint="googleSpend" metric={metrics.googleSpend} digits={2} prefix="$" lowerIsBetter />
          <MetricCard label="Impressions" hint="googleImpressions" metric={metrics.googleImpressions} />
          <MetricCard label="Clicks" hint="googleClicks" metric={metrics.googleClicks} />
          <MetricCard label="CPC" hint="googleCpc" metric={metrics.googleCpc} digits={2} prefix="$" lowerIsBetter />
          <MetricCard label="Conversions" hint="googleConversions" metric={metrics.googleConversions} />
          <MetricCard label="Cost per conversion" hint="googleCostPerConversion" metric={metrics.googleCostPerConversion} digits={2} prefix="$" lowerIsBetter />
        </div>
      </Section> : null}

      {sections.meta_ads ? <Section title="Meta Ads">
        <TextMuted>{periodLabel}</TextMuted>
        <div className="ds-grid">
          <MetricCard label="Ad spend" hint="metaSpend" metric={metrics.metaSpend} digits={2} prefix="$" lowerIsBetter />
          <MetricCard label="Impressions" hint="metaImpressions" metric={metrics.metaImpressions} />
          <MetricCard label="Clicks" hint="metaClicks" metric={metrics.metaClicks} />
          <MetricCard label="CPC" hint="metaCpc" metric={metrics.metaCpc} digits={2} prefix="$" lowerIsBetter />
          <MetricCard label="Leads" hint="metaLeads" metric={metrics.metaLeads} />
          <MetricCard label="CTR" hint="metaCtr" metric={metrics.metaCtr} digits={2} suffix="%" />
          <MetricCard label="Cost per lead" hint="metaCostPerLead" metric={metrics.metaCostPerLead} digits={2} prefix="$" lowerIsBetter />
        </div>
      </Section> : null}

      {sections.ai ? <Section title="AI visibility">
        <TextMuted>{periodLabel}</TextMuted>
        <div className="ds-grid">
          <MetricCard label="Total AI referral traffic" hint="aiTotal" metric={metrics.aiTotal} />
          {AI_REFERRAL_PATTERNS.map((pattern) => (
            <MetricCard
              key={pattern.key}
              label={pattern.label}
              hint={pattern.key}
              metric={metrics.aiReferrals[pattern.key]}
            />
          ))}
        </div>
      </Section> : null}

      {sections.offline_leads ? <Section title="Offline leads">
        {canEnterLeads ? (
          <Panel className="ds-stack">
            <h3 className="ds-heading-sm">Log this week&apos;s offline leads</h3>
            <form action={saveWeeklyLeadsAction} className="ds-stack">
              <input type="hidden" name="brand_id" value={brand.id} />
              <input type="hidden" name="brand_slug" value={brandSlug} />
              <input type="hidden" name="period" value={period} />
              <div className="ds-form-grid">
                <Field label="Week starting">
                  <Input type="date" name="week_start_date" defaultValue={weekStart} required />
                </Field>
                <Field label="Phone call leads">
                  <Input type="number" name="phone_leads" min={0} step={1} required defaultValue={thisWeek?.phone_leads ?? 0} />
                </Field>
                <Field label="Emails">
                  <Input type="number" name="email_leads" min={0} step={1} required defaultValue={thisWeek?.email_leads ?? 0} />
                </Field>
                <Field label="Referrals">
                  <Input type="number" name="referral_leads" min={0} step={1} required defaultValue={thisWeek?.referral_leads ?? 0} />
                </Field>
                <Field label="Trade shows">
                  <Input
                    type="number"
                    name="trade_show_leads"
                    min={0}
                    step={1}
                    required
                    defaultValue={thisWeek?.trade_show_leads ?? 0}
                  />
                </Field>
                <Field label="Social media">
                  <Input
                    type="number"
                    name="social_media_leads"
                    min={0}
                    step={1}
                    required
                    defaultValue={thisWeek?.social_media_leads ?? 0}
                  />
                </Field>
              </div>
              <p>
                <Button>Save leads</Button>
              </p>
            </form>
          </Panel>
        ) : (
          <TextMuted>Lead entry is limited to Super Admins and this company&apos;s manager.</TextMuted>
        )}

        {recentLeads.length ? (
          <Table headers={["Week starting", "Phone", "Emails", "Referrals", "Trade shows", "Social media", "Offline total"]}>
            {recentLeads.map((row) => {
              const total =
                row.phone_leads +
                  row.email_leads +
                  row.referral_leads +
                  row.trade_show_leads +
                  row.social_media_leads || row.lead_count;
              return (
                <tr key={row.id}>
                  <td>{row.week_start_date}</td>
                  <td>{row.phone_leads}</td>
                  <td>{row.email_leads}</td>
                  <td>{row.referral_leads}</td>
                  <td>{row.trade_show_leads}</td>
                  <td>{row.social_media_leads}</td>
                  <td>{total}</td>
                </tr>
              );
            })}
          </Table>
        ) : null}
      </Section> : null}

      {webLeads ? (
        <WebLeadsSection
          brandSlug={brandSlug}
          period={period}
          start={leadsRange.start}
          end={leadsRange.end}
          perPage={leadsPer}
          page={webLeads.page}
          rows={webLeads.rows}
          total={webLeads.total}
        />
      ) : null}
    </Page>
  );
}
