"use client";

import { useMemo, useState } from "react";
import { Field, Input, TextMuted } from "@/components/ui";
import type { ManagedUser } from "@/lib/users";
import type { CompanyOption } from "./company-multi-select";
import { PersonPanel } from "./person-panel";

export function PeopleList({
  people,
  companyOptions,
  openId,
}: {
  people: ManagedUser[];
  companyOptions: CompanyOption[];
  openId?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) => {
      const haystack = [
        person.email,
        person.role,
        person.brand_name ?? "",
        person.role === "lab_manager" ? "company manager" : person.role.replace("_", " "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [people, query]);

  return (
    <div className="ds-stack">
      <Field label="Find person">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by email, role, or company"
          autoComplete="off"
        />
      </Field>
      <div className="ds-panel-list ds-people-list">
        {filtered.length ? (
          filtered.map((person) => (
            <PersonPanel
              key={person.id}
              person={person}
              companyOptions={companyOptions}
              defaultOpen={openId === person.id}
            />
          ))
        ) : (
          <TextMuted>No people match that filter.</TextMuted>
        )}
      </div>
    </div>
  );
}
