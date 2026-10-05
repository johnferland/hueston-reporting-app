"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type CompanyOption = {
  id: string;
  name: string;
  archived?: boolean;
};

function optionLabel(option: CompanyOption) {
  return option.archived ? `${option.name} (archived)` : option.name;
}

function summaryLabel(options: CompanyOption[], selectedIds: string[]) {
  if (!selectedIds.length) return "Select companies";
  if (selectedIds.length === 1) {
    const match = options.find((option) => option.id === selectedIds[0]);
    return match ? optionLabel(match) : "1 company";
  }
  return `${selectedIds.length} companies selected`;
}

export function CompanyMultiSelect({
  options,
  selectedIds = [],
  name = "brand_ids",
}: {
  options: CompanyOption[];
  selectedIds?: string[];
  name?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selectedKey = selectedIds.join(",");
  const initialSelected = useMemo(
    () => (selectedKey ? selectedKey.split(",") : []),
    [selectedKey],
  );
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Bubble phase so nav links still receive the activating click.
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle(brandId: string) {
    setSelected((current) =>
      current.includes(brandId) ? current.filter((id) => id !== brandId) : [...current, brandId],
    );
  }

  return (
    <div className="ds-field ds-company-pick" ref={rootRef}>
      <span id={`${listId}-label`}>Companies</span>
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <button
        type="button"
        className="ds-select ds-multi-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{summaryLabel(options, selected)}</span>
      </button>
      {open ? (
        <div
          className="ds-multi-select-menu"
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={`${listId}-label`}
        >
          {options.map((option) => {
            const checked = selected.includes(option.id);
            return (
              <label key={option.id} className="ds-multi-select-option">
                <input type="checkbox" checked={checked} onChange={() => toggle(option.id)} />
                <span>{optionLabel(option)}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
