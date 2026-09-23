"use server";

import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { getBrandById } from "@/lib/brands";
import { saveMonthlyReport } from "@/lib/monthly-reports";

function formValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function destination(formData: FormData): "/admin" | "/admin/archived" {
  return formValue(formData, "return_to") === "/admin/archived" ? "/admin/archived" : "/admin";
}

export async function generateMonthlyReportAction(formData: FormData) {
  await requireSuperAdmin();
  const path = destination(formData);
  const brandId = formValue(formData, "brand_id");
  if (!brandId) redirect(`${path}?error=${encodeURIComponent("Missing brand id.")}`);
  const brand = await getBrandById(brandId);
  if (!brand) redirect(`${path}?error=${encodeURIComponent("Company not found.")}`);

  let report;
  try {
    report = await saveMonthlyReport({
      brandId,
      brandSlug: brand.slug,
      month: formValue(formData, "month"),
      winOfMonth: formValue(formData, "win_of_month"),
      workDone: formValue(formData, "work_done"),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not generate the monthly report.";
    redirect(`${path}?error=${encodeURIComponent(message)}&open=${encodeURIComponent(brandId)}`);
  }
  redirect(
    `${path}?saved=${encodeURIComponent(`Monthly report ready for ${brand.name}: ${report.label}`)}&open=${encodeURIComponent(brandId)}`,
  );
}
