import Link from "next/link";
import type { ReactNode } from "react";
import type { Brand } from "@/lib/brands";
import type { BrandPeriodMetrics, MetricValue } from "@/lib/metrics";
import { formatDelta, formatNumber, PERIOD_LABELS, type PeriodKey } from "@/lib/period";
import { cn } from "@/lib/cn";

type Tone = "up" | "down" | "flat";

function metricTone(metric: MetricValue, lowerIsBetter = false): Tone {
  if (metric.delta == null || Math.abs(metric.delta) < 0.05) return "flat";
  const favorable = lowerIsBetter ? metric.delta < 0 : metric.delta > 0;
  return favorable ? "up" : "down";
}

function toneArrow(tone: Tone) {
  if (tone === "up") return "↑";
  if (tone === "down") return "↓";
  return "→";
}

function RollupMetricCell({
  metric,
  digits = 0,
  prefix = "",
  suffix = "",
  lowerIsBetter = false,
  empty = false,
}: {
  metric?: MetricValue;
  digits?: number;
  prefix?: string;
  suffix?: string;
  lowerIsBetter?: boolean;
  empty?: boolean;
}) {
  if (empty || !metric) {
    return (
      <div className="ds-rollup-metric ds-rollup-metric-empty">
        <p className="ds-rollup-metric-value">—</p>
        <p className="ds-rollup-metric-delta">—</p>
      </div>
    );
  }

  const tone = metricTone(metric, lowerIsBetter);
  return (
    <div className={cn("ds-rollup-metric", `ds-rollup-metric-${tone}`)}>
      <p className="ds-rollup-metric-value">
        {prefix}
        {formatNumber(metric.current, digits)}
        {suffix}
      </p>
      <p className="ds-rollup-metric-delta">
        {toneArrow(tone)} {formatDelta(metric.delta)} vs {prefix}
        {formatNumber(metric.previous, digits)}
        {suffix}
      </p>
    </div>
  );
}

function overallStatus(tones: Tone[]) {
  const improving = tones.filter((tone) => tone === "up").length;
  const declining = tones.filter((tone) => tone === "down").length;
  if (declining > improving) {
    return { label: "Needs attention", tone: "down" as const, detail: `${improving} improving · ${declining} declining` };
  }
  if (improving > declining) {
    return { label: "Improving", tone: "up" as const, detail: `${improving} improving · ${declining} declining` };
  }
  if (improving === 0 && declining === 0) {
    return { label: "Steady", tone: "flat" as const, detail: "No material change" };
  }
  return { label: "Mixed", tone: "flat" as const, detail: `${improving} improving · ${declining} declining` };
}

export function RollupList({
  period,
  rows,
  header,
}: {
  period: PeriodKey;
  rows: Array<{ brand: Brand; metrics: BrandPeriodMetrics }>;
  header?: ReactNode;
}) {
  const periodWord = PERIOD_LABELS[period].toLowerCase();

  return (
    <div className="ds-rollup">
      <div className="ds-rollup-sticky">
        {header}
        <div className="ds-rollup-toolbar">
          <h2 className="ds-heading-sm">Client performance</h2>
          <p className="ds-muted">This {periodWord} vs prior {periodWord}</p>
        </div>

        <div className="ds-rollup-head" aria-hidden="true">
          <span>Client</span>
          <span>Total leads</span>
          <span>Organic traffic</span>
          <span>Top 3 keywords</span>
          <span>Cost / conversion</span>
          <span>Overall</span>
        </div>
      </div>

      <div className="ds-rollup-rows">
        {rows.map(({ brand, metrics }) => {
          const sections = brand.visible_sections;
          const tones: Tone[] = [];
          if (sections.leads) tones.push(metricTone(metrics.totalLeads));
          if (sections.search) {
            tones.push(metricTone(metrics.organicTraffic));
            tones.push(metricTone(metrics.keywordsTop3));
          }
          if (sections.google_ads || sections.meta_ads) {
            tones.push(metricTone(metrics.adsCostPerConversion, true));
          }
          const overall = overallStatus(tones);

          return (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}?period=${period}`}
              className="ds-rollup-row"
            >
              <div className="ds-rollup-client">
                <p className="ds-rollup-client-name">{brand.name}</p>
                <p className="ds-rollup-client-domain">{brand.domain}</p>
              </div>
              <RollupMetricCell metric={metrics.totalLeads} empty={!sections.leads} />
              <RollupMetricCell metric={metrics.organicTraffic} empty={!sections.search} />
              <RollupMetricCell metric={metrics.keywordsTop3} empty={!sections.search} />
              <RollupMetricCell
                metric={metrics.adsCostPerConversion}
                digits={2}
                prefix="$"
                lowerIsBetter
                empty={!sections.google_ads && !sections.meta_ads}
              />
              <div className="ds-rollup-overall">
                <span className={cn("ds-rollup-pill", `ds-rollup-pill-${overall.tone}`)}>{overall.label}</span>
                <p className="ds-muted">{overall.detail}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
