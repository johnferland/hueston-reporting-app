"use client";

import { useState } from "react";
import { Button, Field, Select, TextMuted } from "@/components/ui";
import type { ManagedUser } from "@/lib/users";
import { CompanyMultiSelect, type CompanyOption } from "./company-multi-select";
import { assignPersonAction } from "./people-actions";

function Chevron() {
  return (
    <svg className="ds-accordion-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function roleLabel(role: ManagedUser["role"]) {
  if (role === "lab_manager") return "Company manager";
  if (role === "exec") return "Exec";
  return "Super admin";
}

function signedInLabel(person: ManagedUser) {
  return person.clerk_user_id && !person.clerk_user_id.startsWith("pending:") ? "Signed in" : "Invited";
}

function accessLabel(person: ManagedUser) {
  if (person.role === "lab_manager") return person.brand_name || "No companies";
  return "All brands";
}

export function PersonPanel({
  person,
  companyOptions,
  defaultOpen = false,
}: {
  person: ManagedUser;
  companyOptions: CompanyOption[];
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);

  return (
    <details
      className="ds-accordion ds-panel ds-person-panel"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary className="ds-accordion-summary ds-person-summary">
        <span className="ds-person-summary-text">
          <span className="ds-person-email">{person.email}</span>
          <span className="ds-muted">
            {roleLabel(person.role)} · {signedInLabel(person)} · {accessLabel(person)}
          </span>
        </span>
        <Chevron />
      </summary>
      {expanded ? (
        <div className="ds-accordion-body">
          <form action={assignPersonAction} className="ds-stack">
            <input type="hidden" name="user_id" value={person.id} />
            <Field label="Role">
              <Select name="role" defaultValue={person.role}>
                <option value="lab_manager">Company manager</option>
                <option value="exec">Exec</option>
                <option value="super_admin">Super admin</option>
              </Select>
            </Field>
            <CompanyMultiSelect options={companyOptions} selectedIds={person.brand_ids} />
            <TextMuted>
              For company managers, choose every website they should see. Leave empty for exec or super admin.
            </TextMuted>
            <div className="ds-company-actions">
              <Button>Save</Button>
            </div>
          </form>
        </div>
      ) : null}
    </details>
  );
}
