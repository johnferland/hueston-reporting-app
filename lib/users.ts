import { getSupabaseAdmin } from "@/lib/supabase";
import type { AppUser, Role } from "@/lib/auth";

export type ManagedUser = {
  id: string;
  email: string;
  role: Role;
  brand_id: string | null;
  brand_ids: string[];
  clerk_user_id: string | null;
  brand_name: string | null;
};

function missingUserBrandsTable(message: string | undefined) {
  return Boolean(
    message && /could not find the table|relation ["']?(?:\w+\.)?user_brands["']? does not exist|schema cache/i.test(message),
  );
}

async function replaceUserBrands(userId: string, brandIds: string[]) {
  const supabase = getSupabaseAdmin();
  const unique = [...new Set(brandIds.filter(Boolean))];
  const { error: clearError } = await supabase.from("user_brands").delete().eq("user_id", userId);
  if (clearError) {
    if (missingUserBrandsTable(clearError.message)) {
      throw new Error("Run supabase/add-user-brands.sql in the Supabase SQL editor, then try again.");
    }
    throw new Error(clearError.message);
  }
  if (!unique.length) return;
  const { error } = await supabase.from("user_brands").insert(unique.map((brand_id) => ({ user_id: userId, brand_id })));
  if (error) throw new Error(error.message);
}

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, brand_id, clerk_user_id, brands(name)")
    .order("email");
  if (error) throw new Error(error.message);

  const { data: memberships, error: membershipError } = await supabase
    .from("user_brands")
    .select("user_id, brand_id, brands(name)");
  if (membershipError && !missingUserBrandsTable(membershipError.message)) {
    throw new Error(membershipError.message);
  }

  const brandsByUser = new Map<string, Array<{ id: string; name: string }>>();
  for (const row of memberships ?? []) {
    const userId = String(row.user_id);
    const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands;
    const list = brandsByUser.get(userId) ?? [];
    list.push({ id: String(row.brand_id), name: String(brand?.name ?? "Company") });
    brandsByUser.set(userId, list);
  }

  return (data ?? []).map((row) => {
    const legacyBrand = Array.isArray(row.brands) ? row.brands[0] : row.brands;
    const assigned = brandsByUser.get(String(row.id)) ?? [];
    const brandIds = assigned.length
      ? assigned.map((item) => item.id)
      : row.brand_id
        ? [String(row.brand_id)]
        : [];
    const brandNames = assigned.length
      ? assigned.map((item) => item.name).join(", ")
      : ((legacyBrand?.name as string | null) ?? null);
    return {
      id: row.id as string,
      email: row.email as string,
      role: row.role as Role,
      brand_id: (row.brand_id as string | null) ?? null,
      brand_ids: brandIds,
      clerk_user_id: (row.clerk_user_id as string | null) ?? null,
      brand_name: brandNames,
    };
  });
}

export async function addOrAssignUser(input: {
  email: string;
  role: Role;
  brandIds: string[];
}) {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new Error("A valid email is required.");
  const brandIds = input.role === "lab_manager" ? [...new Set(input.brandIds.filter(Boolean))] : [];
  if (input.role === "lab_manager" && !brandIds.length) {
    throw new Error("Company managers must be assigned to at least one company.");
  }

  const brandId = brandIds[0] ?? null;
  const supabase = getSupabaseAdmin();
  const { data: existing, error: lookupError } = await supabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({ role: input.role, brand_id: brandId })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    await replaceUserBrands(String(existing.id), brandIds);
    return;
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      email,
      role: input.role,
      brand_id: brandId,
      clerk_user_id: `pending:${crypto.randomUUID()}`,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  await replaceUserBrands(String(created.id), brandIds);
}

export async function assignExistingUser(input: { userId: string; role: Role; brandIds: string[] }) {
  const brandIds = input.role === "lab_manager" ? [...new Set(input.brandIds.filter(Boolean))] : [];
  if (input.role === "lab_manager" && !brandIds.length) {
    throw new Error("Company managers must be assigned to at least one company.");
  }
  const brandId = brandIds[0] ?? null;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("users")
    .update({ role: input.role, brand_id: brandId })
    .eq("id", input.userId);
  if (error) throw new Error(error.message);
  await replaceUserBrands(input.userId, brandIds);
}

export function homePathForUser(user: AppUser, brandSlug?: string | null): string {
  if (user.role === "lab_manager") {
    return brandSlug ? `/brand/${brandSlug}` : "/";
  }
  return "/";
}
