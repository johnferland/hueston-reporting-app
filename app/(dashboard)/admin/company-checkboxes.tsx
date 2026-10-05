import type { Brand } from "@/lib/brands";

function companyOptionLabel(brand: Brand) {
  return brand.is_active === false ? `${brand.name} (archived)` : brand.name;
}

export function CompanyCheckboxes({
  brands,
  selectedIds = [],
}: {
  brands: Brand[];
  selectedIds?: string[];
}) {
  const selected = new Set(selectedIds);
  return (
    <fieldset className="ds-field ds-company-pick">
      <legend>Companies</legend>
      <div className="ds-check-list">
        {brands.map((brand) => (
          <label key={brand.id} className="ds-check">
            <input type="checkbox" name="brand_ids" value={brand.id} defaultChecked={selected.has(brand.id)} />
            <span>{companyOptionLabel(brand)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
