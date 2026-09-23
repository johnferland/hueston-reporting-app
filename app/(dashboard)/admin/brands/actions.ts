"use server";

import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { createBrand, deleteBrand, setBrandActive, updateBrand, type Brand } from "@/lib/brands";
import { sectionsFromForm } from "@/lib/dashboard-sections";
import { rotateWebLeadsWebhookSecret } from "@/lib/web-leads";

function formValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function destination(formData: FormData): "/admin" | "/admin/archived" {
  return formValue(formData, "return_to") === "/admin/archived" ? "/admin/archived" : "/admin";
}

function redirectWith(path: string, params: Record<string, string | undefined>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  redirect(query ? `${path}?${query}` : path);
}

function inputFromForm(formData: FormData) {
  return {
    name: formValue(formData, "name"),
    slug: formValue(formData, "slug"),
    nav_abbreviation: formValue(formData, "nav_abbreviation"),
    domain: formValue(formData, "domain"),
    accent_color: formValue(formData, "accent_color"),
    logo_url: formValue(formData, "logo_url"),
    ga4_property_id: formValue(formData, "ga4_property_id"),
    gsc_site_url: formValue(formData, "gsc_site_url"),
    google_ads_customer_id: formValue(formData, "google_ads_customer_id"),
    meta_ad_account_id: formValue(formData, "meta_ad_account_id"),
    visible_sections: sectionsFromForm(formData),
  };
}

export async function createBrandAction(formData: FormData) {
  await requireSuperAdmin();
  let brand: Brand;
  try {
    brand = await createBrand(inputFromForm(formData));
  } catch (error) {
    redirectWith("/admin", { error: error instanceof Error ? error.message : "Could not add brand." });
  }
  redirectWith("/admin", { saved: `Added ${brand.name}`, open: brand.id });
}

export async function updateBrandAction(formData: FormData) {
  await requireSuperAdmin();
  const brandId = formValue(formData, "brand_id");
  const path = destination(formData);
  if (!brandId) redirectWith(path, { error: "Missing brand id." });
  let brand: Brand;
  try {
    brand = await updateBrand(brandId, inputFromForm(formData));
  } catch (error) {
    redirectWith(path, {
      error: error instanceof Error ? error.message : "Could not save brand.",
      open: brandId,
    });
  }
  redirectWith(path, { saved: `Saved ${brand.name}`, open: brand.id });
}

export async function rotateWebLeadsWebhookAction(formData: FormData) {
  await requireSuperAdmin();
  const brandId = formValue(formData, "brand_id");
  const path = destination(formData);
  if (!brandId) redirectWith(path, { error: "Missing brand id." });
  try {
    await rotateWebLeadsWebhookSecret(brandId);
  } catch (error) {
    redirectWith(path, {
      error: error instanceof Error ? error.message : "Could not update webhook secret.",
      open: brandId,
    });
  }
  redirectWith(path, { saved: "Web leads webhook secret updated.", open: brandId });
}

export async function archiveBrandAction(formData: FormData) {
  await requireSuperAdmin();
  const brandId = formValue(formData, "brand_id");
  if (!brandId) redirectWith("/admin", { error: "Missing brand id." });
  let brand: Brand;
  try {
    brand = await setBrandActive(brandId, false);
  } catch (error) {
    redirectWith("/admin", {
      error: error instanceof Error ? error.message : "Could not archive company.",
      open: brandId,
    });
  }
  redirectWith("/admin", { saved: `Archived ${brand.name}` });
}

export async function restoreBrandAction(formData: FormData) {
  await requireSuperAdmin();
  const brandId = formValue(formData, "brand_id");
  if (!brandId) redirectWith("/admin/archived", { error: "Missing brand id." });
  let brand: Brand;
  try {
    brand = await setBrandActive(brandId, true);
  } catch (error) {
    redirectWith("/admin/archived", {
      error: error instanceof Error ? error.message : "Could not restore company.",
      open: brandId,
    });
  }
  redirectWith("/admin", { saved: `Restored ${brand.name}`, open: brand.id });
}

export async function deleteBrandAction(formData: FormData) {
  await requireSuperAdmin();
  const brandId = formValue(formData, "brand_id");
  const path = destination(formData);
  if (!brandId) redirectWith(path, { error: "Missing brand id." });
  let name: string;
  try {
    name = await deleteBrand(brandId);
  } catch (error) {
    redirectWith(path, {
      error: error instanceof Error ? error.message : "Could not delete company.",
      open: brandId,
    });
  }
  redirectWith(path, { saved: `Deleted ${name}` });
}
