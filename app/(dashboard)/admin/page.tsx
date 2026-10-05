import { requireSuperAdmin } from "@/lib/auth";
import { listBrandsWithCredentials } from "@/lib/brands";
import { listMonthlyReports } from "@/lib/monthly-reports";
import { listManagedUsers } from "@/lib/users";
import { BrandFormFields } from "@/components/brand-form-fields";
import { SyncNowButton } from "@/components/sync-now-button";
import { Alert, Button, Field, Input, Page, PageHeader, Panel, Section, Select, Table, TextMuted } from "@/components/ui";
import { CompanyMultiSelect } from "./company-multi-select";
import { CompanyPanel } from "./company-panel";
import { createBrandAction } from "./brands/actions";
import { addPersonAction, assignPersonAction } from "./people-actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; open?: string }>;
}) {
  await requireSuperAdmin();
  const { saved, error, open } = await searchParams;
  const [brands, people, reports] = await Promise.all([
    listBrandsWithCredentials(),
    listManagedUsers(),
    listMonthlyReports(),
  ]);
  const activeBrands = brands.filter((brand) => brand.is_active !== false);
  const companyOptions = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    archived: brand.is_active === false,
  }));

  return (
    <Page>
      <PageHeader
        title="Admin"
        description="Manage companies, property IDs, and who can see each company."
        actions={
          <div className="ds-row">
            <Button href="/api/admin/google-oauth/start">Connect Google</Button>
            <SyncNowButton label="Sync all companies" />
          </div>
        }
      />

      {saved ? <Alert tone="ok">{saved}</Alert> : null}
      {error ? <Alert tone="err">{error}</Alert> : null}

      <Section title="People">
        <TextMuted>
          Add an email, then assign it to Exec (all brands, read-only) or Company Manager (one or more companies).
          They sign in with Clerk using that email; until then the row stays unlinked.
        </TextMuted>

        <Panel>
          <h3 className="ds-heading-sm">Add person</h3>
          <form action={addPersonAction} className="ds-stack">
            <div className="ds-row">
              <Field label="Email">
                <Input type="email" name="email" required placeholder="name@company.com" />
              </Field>
              <Field label="Role">
                <Select name="role" defaultValue="lab_manager">
                  <option value="lab_manager">Company manager</option>
                  <option value="exec">Exec</option>
                  <option value="super_admin">Super admin</option>
                </Select>
              </Field>
            </div>
            <CompanyMultiSelect options={companyOptions} />
            <TextMuted>
              For company managers, choose every website they should see. Leave empty for exec or super admin.
            </TextMuted>
            <Button>Add / update by email</Button>
          </form>
        </Panel>

        <Table headers={["Email", "Signed in", "Assign"]}>
          {people.map((person) => (
            <tr key={person.id}>
              <td>
                {person.email}
                <div className="ds-muted">{person.brand_name ?? "All brands"}</div>
              </td>
              <td>{person.clerk_user_id && !person.clerk_user_id.startsWith("pending:") ? "Yes" : "Invited"}</td>
              <td>
                <form action={assignPersonAction} className="ds-stack">
                  <input type="hidden" name="user_id" value={person.id} />
                  <Select name="role" defaultValue={person.role}>
                    <option value="lab_manager">Company manager</option>
                    <option value="exec">Exec</option>
                    <option value="super_admin">Super admin</option>
                  </Select>
                  <CompanyMultiSelect options={companyOptions} selectedIds={person.brand_ids} />
                  <Button>Save</Button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Companies & property IDs">
        <TextMuted>
          Open a company to edit it. Archive moves it to Archived Clients and stops its weekly sync. Delete asks you to
          confirm, then removes it completely.
        </TextMuted>

        <div className="ds-panel-list ds-company-list">
          <Panel>
            <h3 className="ds-heading-sm">Add a company</h3>
            <form action={createBrandAction} className="ds-stack">
              <BrandFormFields />
              <div className="ds-company-actions">
                <Button>Add company</Button>
              </div>
            </form>
          </Panel>

          {activeBrands.map((brand) => (
            <CompanyPanel
              key={brand.id}
              brand={brand}
              returnTo="/admin"
              defaultOpen={open === brand.id}
              reports={reports.filter((report) => report.brand_id === brand.id)}
            />
          ))}
        </div>
      </Section>
    </Page>
  );
}
