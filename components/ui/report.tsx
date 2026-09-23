import type { ReactNode } from "react";
import { formatDelta, formatNumber } from "@/lib/period";
import type { MetricValue } from "@/lib/metrics";
import { cn } from "@/lib/cn";

export function ReportPage({ children }: { children: ReactNode }) {
  return <main className="ds-page ds-report">{children}</main>;
}

export function ReportTop({
  brand,
  period,
  actions,
}: {
  brand: string;
  period: string;
  actions?: ReactNode;
}) {
  return (
    <header className="ds-report-top">
      <div>
        <p className="ds-report-kicker">Monthly report</p>
        <h1 className="ds-report-title">{brand}</h1>
        <p className="ds-report-period">{period}</p>
      </div>
      {actions}
    </header>
  );
}

export function ReportBand({
  tone = "light",
  eyebrow,
  title,
  children,
  lead,
}: {
  tone?: "light" | "dark";
  eyebrow: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("ds-report-band", tone === "dark" && "ds-report-band-dark")}>
      <p className="ds-report-eyebrow">{eyebrow}</p>
      <h2 className="ds-report-heading">{title}</h2>
      {lead ? <p className="ds-report-lead">{lead}</p> : null}
      {children}
    </section>
  );
}

export function ReportWin({ children }: { children: ReactNode }) {
  return <div className="ds-report-win">{children}</div>;
}

export function ReportGlance({ children }: { children: ReactNode }) {
  return <div className="ds-report-glance">{children}</div>;
}

export function ReportGlanceCard({
  label,
  value,
  note,
  featured = false,
}: {
  label: string;
  value: string;
  note: string;
  featured?: boolean;
}) {
  return (
    <article className={cn("ds-report-glance-card", featured && "ds-report-glance-card-featured")}>
      <p className="ds-report-glance-label">{label}</p>
      <p className="ds-report-glance-value">{value}</p>
      <p className="ds-report-glance-note">{note}</p>
    </article>
  );
}

export function ReportChannels({ children }: { children: ReactNode }) {
  return <div className="ds-report-channels">{children}</div>;
}

export function ReportChannel({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <article className="ds-report-channel">
      <h3 className="ds-report-channel-title">{title}</h3>
      <p className="ds-report-channel-summary">{summary}</p>
      <div className="ds-report-tiles">{children}</div>
    </article>
  );
}

export function ReportTile({
  label,
  metric,
  digits = 0,
  prefix = "",
  suffix = "",
  lowerIsBetter = false,
}: {
  label: string;
  metric: MetricValue;
  digits?: number;
  prefix?: string;
  suffix?: string;
  lowerIsBetter?: boolean;
}) {
  const favorable = lowerIsBetter ? metric.delta != null && metric.delta < 0 : metric.delta != null && metric.delta > 0;
  const unfavorable = lowerIsBetter ? metric.delta != null && metric.delta > 0 : metric.delta != null && metric.delta < 0;
  const pillClass = favorable
    ? "ds-report-pill ds-report-pill-up"
    : unfavorable
      ? "ds-report-pill ds-report-pill-down"
      : "ds-report-pill";

  return (
    <div className="ds-report-tile">
      <p className="ds-report-tile-label">{label}</p>
      <div className="ds-report-tile-row">
        <p className="ds-report-tile-value">
          {prefix}
          {formatNumber(metric.current, digits)}
          {suffix}
        </p>
        <span className={pillClass}>{formatDelta(metric.delta)}</span>
      </div>
    </div>
  );
}

export function ReportActions({ children }: { children: ReactNode }) {
  return <div className="ds-report-actions">{children}</div>;
}

export function formatMetric(metric: MetricValue, digits = 0, prefix = "", suffix = "") {
  return `${prefix}${formatNumber(metric.current, digits)}${suffix}`;
}

export function priorNote(metric: MetricValue, digits = 0, prefix = "", suffix = "") {
  return `${formatMetric(metric, digits, prefix, suffix)} vs ${prefix}${formatNumber(metric.previous, digits)}${suffix} last month`;
}
