import { requireSuperAdmin } from "@/lib/auth";
import { listBrandsWithCredentials } from "@/lib/brands";
import { listMonthlyReports } from "@/lib/monthly-reports";
import { Alert, Page, PageHeader, Section, TextMuted } from "@/components/ui";
import { CompanyPanel } from "../company-panel";

export default async function ArchivedClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; open?: string }>;
}) {
  await requireSuperAdmin();
  const { saved, error, open } = await searchParams;
  const [brands, reports] = await Promise.all([listBrandsWithCredentials(), listMonthlyReports()]);
  const archived = brands.filter((brand) => brand.is_active === false);

  return (
    <Page>
      <PageHeader
        title="Archived Clients"
        description="Hidden from the dashboard and skipped by the weekly sync. Their records stay here until you restore or delete them."
      />

      {saved ? <Alert tone="ok">{saved}</Alert> : null}
      {error ? <Alert tone="err">{error}</Alert> : null}

      <Section title="Archived companies">
        {archived.length ? (
          <div className="ds-panel-list ds-company-list">
            {archived.map((brand) => (
              <CompanyPanel
                key={brand.id}
                brand={brand}
                returnTo="/admin/archived"
                archived
                defaultOpen={open === brand.id}
                reports={reports.filter((report) => report.brand_id === brand.id)}
              />
            ))}
          </div>
        ) : (
          <TextMuted>No archived companies.</TextMuted>
        )}
      </Section>
    </Page>
  );
}
