"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Brand } from "@/lib/brands";

function companyOptionLabel(brand: Brand) {
  return brand.is_active === false ? `${brand.name} (archived)` : brand.name;
}

function summaryLabel(brands: Brand[], selectedIds: string[]) {
  if (!selectedIds.length) return "Select companies";
  if (selectedIds.length === 1) {
    const brand = brands.find((item) => item.id === selectedIds[0]);
    return brand ? companyOptionLabel(brand) : "1 company";
  }
  return `${selectedIds.length} companies selected`;
}

export function CompanyMultiSelect({
  brands,
  selectedIds = [],
  name = "brand_ids",
}: {
  brands: Brand[];
  selectedIds?: string[];
  name?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => [...selectedIds]);

  useEffect(() => {
    setSelected([...selectedIds]);
  }, [selectedIds]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
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
        <span>{summaryLabel(brands, selected)}</span>
      </button>
      {open ? (
        <div className="ds-multi-select-menu" role="listbox" aria-multiselectable="true" aria-labelledby={`${listId}-label`}>
          {brands.map((brand) => {
            const checked = selected.includes(brand.id);
            return (
              <label key={brand.id} className="ds-multi-select-option">
                <input type="checkbox" checked={checked} onChange={() => toggle(brand.id)} />
                <span>{companyOptionLabel(brand)}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
