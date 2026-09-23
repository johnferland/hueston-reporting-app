import { BrandFormFields } from "@/components/brand-form-fields";
import { ConfirmForm } from "@/components/confirm-form";
import { SyncNowButton } from "@/components/sync-now-button";
import { Button, Field, Input, Textarea, TextMuted } from "@/components/ui";
import type { BrandWithCredentials } from "@/lib/brands";
import { previousMonthInput, reportPath, type MonthlyReport } from "@/lib/monthly-reports";
import { generateMonthlyReportAction } from "./reports/actions";
import {
  archiveBrandAction,
  deleteBrandAction,
  restoreBrandAction,
  rotateWebLeadsWebhookAction,
  updateBrandAction,
} from "./brands/actions";

function Chevron() {
  return (
    <svg className="ds-accordion-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CompanyPanel({
  brand,
  returnTo,
  defaultOpen = false,
  archived = false,
  reports = [],
}: {
  brand: BrandWithCredentials;
  returnTo: "/admin" | "/admin/archived";
  defaultOpen?: boolean;
  archived?: boolean;
  reports?: MonthlyReport[];
}) {
  const deleteMessage = `Delete ${brand.name} permanently? This removes the company and all of its metrics, leads, and credentials. Assigned people are unlinked. This cannot be undone.`;

  return (
    <details className="ds-accordion ds-panel" open={defaultOpen || undefined}>
      <summary className="ds-accordion-summary">
        <span>{brand.name}</span>
        <Chevron />
      </summary>
      <div className="ds-accordion-body">
        <form action={updateBrandAction} className="ds-stack">
          <input type="hidden" name="brand_id" value={brand.id} />
          <input type="hidden" name="return_to" value={returnTo} />
          <BrandFormFields brand={brand} />
          <div className="ds-company-actions">
            <Button>Save {brand.name}</Button>
            {archived ? null : <SyncNowButton brandId={brand.id} label="Sync now" />}
          </div>
        </form>
        <div className="ds-stack ds-company-webhook">
          <h3 className="ds-heading-sm">Web leads webhook</h3>
          <TextMuted>
            Point the website form (or Zapier) here. POST JSON or form fields: first_name, last_name,
            email, date, attribution, count. Header <code>X-Webhook-Secret</code>.
          </TextMuted>
          <div className="ds-form-grid">
            <Field label="Webhook URL">
              <Input
                readOnly
                defaultValue={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/webhooks/web-leads/${brand.slug}`}
              />
            </Field>
            <Field label="Secret">
              <Input
                readOnly
                defaultValue={brand.web_leads_webhook_secret ?? "Save the company once to generate a secret"}
              />
            </Field>
          </div>
          <form action={rotateWebLeadsWebhookAction}>
            <input type="hidden" name="brand_id" value={brand.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <Button variant="secondary">Generate / rotate secret</Button>
          </form>
        </div>
        <div className="ds-stack ds-company-webhook">
          <h3 className="ds-heading-sm">Monthly report</h3>
          <TextMuted>
            Write the win and the work from last month, then generate. The report uses this company&apos;s live sections and opens from their dashboard.
          </TextMuted>
          <form action={generateMonthlyReportAction} className="ds-stack">
            <input type="hidden" name="brand_id" value={brand.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <Field label="Month">
              <Input name="month" type="month" required defaultValue={previousMonthInput()} />
            </Field>
            <Field label="Win of the month">
              <Textarea name="win_of_month" required placeholder="The result worth leading with." />
            </Field>
            <Field label="Work done last month">
              <Textarea name="work_done" required className="ds-textarea-lg" placeholder="What the team did. This is page 2 of the report." />
            </Field>
            <div className="ds-company-actions">
              <Button>Generate monthly report</Button>
            </div>
          </form>
          {reports.length ? (
            <div className="ds-stack">
              {reports.map((report) => (
                <Button key={report.id} href={reportPath(report.slug)} variant="secondary">
                  {report.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
        <TextMuted>
          {archived
            ? "Restore puts this company back on the dashboard and the weekly sync. Delete removes it and all of its data."
            : "Archive hides this company from the dashboard and stops its sync. Delete removes it and all of its data."}
        </TextMuted>
        <div className="ds-company-actions">
          {archived ? (
            <form action={restoreBrandAction}>
              <input type="hidden" name="brand_id" value={brand.id} />
              <Button variant="secondary">Restore</Button>
            </form>
          ) : (
            <form action={archiveBrandAction}>
              <input type="hidden" name="brand_id" value={brand.id} />
              <Button variant="secondary">Archive</Button>
            </form>
          )}
          <ConfirmForm action={deleteBrandAction} message={deleteMessage}>
            <input type="hidden" name="brand_id" value={brand.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <Button variant="danger">Delete</Button>
          </ConfirmForm>
        </div>
      </div>
    </details>
  );
}
