import type { ReactNode } from "react";
import { requireAppUser } from "@/lib/auth";
import { listActiveBrands, listActiveBrandsByIds } from "@/lib/brands";
import { AppNav } from "@/components/app-nav";
import { Shell, ShellMain } from "@/components/ui";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAppUser();

  const brands =
    user.role === "lab_manager" ? await listActiveBrandsByIds(user.brand_ids) : await listActiveBrands();
  const homeId =
    user.brand_id && brands.some((brand) => brand.id === user.brand_id)
      ? user.brand_id
      : brands[0]?.id;
  const labBrandSlug = brands.find((brand) => brand.id === homeId)?.slug ?? brands[0]?.slug;

  return (
    <Shell>
      <AppNav user={user} brands={brands} labBrandSlug={labBrandSlug} />
      <ShellMain>{children}</ShellMain>
    </Shell>
  );
}
