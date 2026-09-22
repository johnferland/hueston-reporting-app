import { Field, Input } from "@/components/ui";
import { DASHBOARD_SECTIONS, type DashboardSections } from "@/lib/dashboard-sections";

export function BrandFormFields({
  brand,
}: {
  brand?: {
    name: string;
    slug: string;
    nav_abbreviation: string | null;
    domain: string;
    accent_color: string;
    logo_url: string | null;
    ga4_property_id: string | null;
    gsc_site_url: string | null;
    google_ads_customer_id: string | null;
    meta_ad_account_id: string | null;
    visible_sections?: DashboardSections;
  };
}) {
  return (
    <div className="ds-form-grid">
      <Field label="Name">
        <Input name="name" defaultValue={brand?.name ?? ""} required />
      </Field>
      <Field label="Nav abbreviation">
        <Input
          name="nav_abbreviation"
          defaultValue={brand?.nav_abbreviation ?? ""}
          placeholder="IDA — shown in the sidebar"
        />
      </Field>
      <Field label="Slug">
        <Input name="slug" defaultValue={brand?.slug ?? ""} placeholder="auto-from-name if left blank on create" />
      </Field>
      <Field label="Domain">
        <Input name="domain" defaultValue={brand?.domain ?? ""} placeholder="example.com" required />
      </Field>
      <Field label="Accent color">
        <Input name="accent_color" defaultValue={brand?.accent_color ?? "#DE492F"} />
      </Field>
      <Field label="Logo URL">
        <Input name="logo_url" type="url" defaultValue={brand?.logo_url ?? ""} />
      </Field>
      <Field label="GA4 property ID">
        <Input name="ga4_property_id" defaultValue={brand?.ga4_property_id ?? ""} placeholder="properties/123456789" />
      </Field>
      <Field label="GSC site URL">
        <Input name="gsc_site_url" defaultValue={brand?.gsc_site_url ?? ""} placeholder="https://example.com/" />
      </Field>
      <Field label="Google Ads customer ID">
        <Input name="google_ads_customer_id" defaultValue={brand?.google_ads_customer_id ?? ""} placeholder="123-456-7890" />
      </Field>
      <Field label="Meta ad account ID">
        <Input name="meta_ad_account_id" defaultValue={brand?.meta_ad_account_id ?? ""} placeholder="123456789" />
      </Field>
      <div className="ds-section-toggles">
        <h3 className="ds-heading-sm">Sections</h3>
        <p className="ds-muted">Unchecked sections stay off this company&apos;s dashboard.</p>
        <div className="ds-check-list">
          {DASHBOARD_SECTIONS.map((section) => (
            <label key={section.key} className="ds-check">
              <input
                type="checkbox"
                name={`section_${section.key}`}
                value="1"
                defaultChecked={brand?.visible_sections?.[section.key] !== false}
              />
              {section.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
