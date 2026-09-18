import { formatDelta, formatNumber } from "@/lib/period";
import type { MetricValue } from "@/lib/metrics";
import { METRIC_HINTS, type MetricHintId } from "@/lib/metric-hints";
import { cn } from "@/lib/cn";
import { Card } from "./card";

function MetricHint({ id }: { id: MetricHintId }) {
  return (
    <span className="ds-hint">
      <span className="ds-hint-mark" tabIndex={0} aria-label="About this metric">
        i
      </span>
      <span className="ds-hint-pop" role="tooltip">
        {METRIC_HINTS[id]}
      </span>
    </span>
  );
}

export function MetricCard({
  label,
  hint,
  metric,
  digits = 0,
  prefix = "",
  suffix = "",
  lowerIsBetter = false,
}: {
  label: string;
  hint: MetricHintId;
  metric: MetricValue;
  digits?: number;
  prefix?: string;
  suffix?: string;
  /** When true, a decrease is green and an increase is red. */
  lowerIsBetter?: boolean;
}) {
  const favorable = lowerIsBetter ? metric.delta != null && metric.delta < 0 : metric.delta != null && metric.delta > 0;
  const unfavorable = lowerIsBetter ? metric.delta != null && metric.delta > 0 : metric.delta != null && metric.delta < 0;
  const deltaClass = favorable
    ? "ds-delta ds-delta-up"
    : unfavorable
      ? "ds-delta ds-delta-down"
      : "ds-delta";

  return (
    <Card className="ds-metric">
      <MetricHint id={hint} />
      <p className="ds-metric-label">{label}</p>
      <p className="ds-metric-value">
        {prefix}
        {formatNumber(metric.current, digits)}
        {suffix}
      </p>
      <p className={deltaClass}>
        {formatDelta(metric.delta)} vs {prefix}{formatNumber(metric.previous, digits)}{suffix} prior
      </p>
    </Card>
  );
}

export function EmptyCard({ label, note, value = "—" }: { label: string; note: string; value?: string }) {
  return (
    <Card>
      <p className="ds-metric-label">{label}</p>
      <p className={cn("ds-metric-value", value === "—" && "ds-muted")}>{value}</p>
      <p className="ds-delta">{note}</p>
    </Card>
  );
}
