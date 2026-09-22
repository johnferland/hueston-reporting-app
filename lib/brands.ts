import { getSupabaseAdmin } from "@/lib/supabase";
import { generateWebLeadsWebhookSecret } from "@/lib/web-leads";
import {
  parseVisibleSections,
  type DashboardSections,
} from "@/lib/dashboard-sections";

export type Brand = {
  id: string;
  slug: string;
  name: string;
  nav_abbreviation: string | null;
  domain: string;
  accent_color: string;
  logo_url: string | null;
  is_active?: boolean;
  visible_sections: DashboardSections;
};

export type BrandCredentials = {
  ga4_property_id: string | null;
  gsc_site_url: string | null;
  google_ads_customer_id: string | null;
  meta_ad_account_id: string | null;
  web_leads_webhook_secret?: string | null;
};

export type BrandWithCredentials = Brand & BrandCredentials;

export type BrandInput = {
  name: string;
  slug?: string;
  nav_abbreviation?: string | null;
  domain: string;
  accent_color?: string;
  logo_url?: string | null;
  visible_sections: DashboardSections;
} & BrandCredentials;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function missingColumn(message: string | undefined) {
  return Boolean(message && /does not exist|schema cache/i.test(message));
}

const BRAND_COLUMNS = "id, slug, name, nav_abbreviation, domain, accent_color, logo_url, visible_sections";
const BRAND_COLUMNS_NO_SECTIONS = "id, slug, name, nav_abbreviation, domain, accent_color, logo_url";
const BRAND_COLUMNS_BASIC = "id, slug, name, domain, accent_color, logo_url";

function columnAttempts() {
  return [
    `${BRAND_COLUMNS}, is_active`,
    BRAND_COLUMNS,
    `${BRAND_COLUMNS_NO_SECTIONS}, is_active`,
    BRAND_COLUMNS_NO_SECTIONS,
    `${BRAND_COLUMNS_BASIC}, is_active`,
    BRAND_COLUMNS_BASIC,
  ];
}

export function brandNavLabel(brand: Pick<Brand, "name" | "nav_abbreviation">): string {
  const abbreviation = brand.nav_abbreviation?.trim();
  return abbreviation || brand.name;
}

function mapBrand(row: Record<string, unknown>): Brand {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    nav_abbreviation: String(row.nav_abbreviation ?? "").trim() || null,
    domain: String(row.domain),
    accent_color: String(row.accent_color),
    logo_url: row.logo_url == null ? null : String(row.logo_url),
    is_active: row.is_active === undefined ? undefined : Boolean(row.is_active),
    visible_sections: parseVisibleSections(row.visible_sections),
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Ads Manager shows digits; the Marketing API uses act_{id}. Store digits only. */
function normalizeMetaAdAccountId(value: string | null | undefined): string | null {
  const trimmed = emptyToNull(value);
  if (!trimmed) return null;
  const digits = trimmed.replace(/^act_/i, "").replace(/\D/g, "");
  return digits || null;
}

function normalizeBrandInput(input: BrandInput) {
  const name = input.name.trim();
  const domain = input.domain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const slug = slugify(input.slug?.trim() || name);
  const accent_color = (input.accent_color?.trim() || "#DE492F").toUpperCase();
  const nav_abbreviation = emptyToNull(input.nav_abbreviation);

  if (!name) throw new Error("Name is required.");
  if (!domain) throw new Error("Domain is required.");
  if (!slug) throw new Error("Could not build a slug from that name.");
  if (!/^#[0-9A-F]{6}$/.test(accent_color)) {
    throw new Error("Accent color must be a hex value like #DE492F.");
  }

  return {
    name,
    slug,
    nav_abbreviation,
    domain,
    accent_color,
    logo_url: emptyToNull(input.logo_url),
    ga4_property_id: emptyToNull(input.ga4_property_id),
    gsc_site_url: emptyToNull(input.gsc_site_url),
    google_ads_customer_id: emptyToNull(input.google_ads_customer_id),
    meta_ad_account_id: normalizeMetaAdAccountId(input.meta_ad_account_id),
    visible_sections: input.visible_sections,
  };
}

async function queryBrandRows(columns: string) {
  const supabase = getSupabaseAdmin();
  return supabase.from("brands").select(columns).order("name");
}

async function listBrandRows(): Promise<Brand[]> {
  const attempts = columnAttempts();
  let lastError: string | undefined;
  for (const columns of attempts) {
    const { data, error } = await queryBrandRows(columns);
    if (!error) return (data ?? []).map((row) => mapBrand(row as unknown as Record<string, unknown>));
    lastError = error.message;
    if (!missingColumn(error.message)) throw new Error(error.message);
  }
  throw new Error(lastError ?? "Could not load brands.");
}

export async function listActiveBrands(): Promise<Brand[]> {
  return (await listBrandRows()).filter((brand) => brand.is_active !== false);
}

async function findBrand(filter: { id?: string; slug?: string }): Promise<Brand | null> {
  const supabase = getSupabaseAdmin();
  let lastError: string | undefined;
  for (const columns of columnAttempts()) {
    let query = supabase.from("brands").select(columns);
    if (filter.id) query = query.eq("id", filter.id);
    if (filter.slug) query = query.eq("slug", filter.slug);
    const { data, error } = await query.maybeSingle();
    if (!error) return data ? mapBrand(data as Record<string, unknown>) : null;
    lastError = error.message;
    if (!missingColumn(error.message)) throw new Error(error.message);
  }
  throw new Error(lastError ?? "Could not load brand.");
}

export async function getBrandById(brandId: string): Promise<Brand | null> {
  return findBrand({ id: brandId });
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return findBrand({ slug });
}

export async function listBrandsWithCredentials(): Promise<BrandWithCredentials[]> {
  const supabase = getSupabaseAdmin();
  const brands = await listBrandRows();
  const { data: credentials, error: credError } = await supabase
    .from("brand_credentials")
    .select("brand_id, ga4_property_id, gsc_site_url, google_ads_customer_id, meta_ad_account_id, web_leads_webhook_secret");

  if (credError) throw new Error(credError.message);

  const byBrandId = new Map((credentials ?? []).map((row) => [row.brand_id as string, row]));

  return brands.map((brand) => {
    const creds = byBrandId.get(brand.id);
    return {
      ...brand,
      ga4_property_id: (creds?.ga4_property_id as string | null) ?? null,
      gsc_site_url: (creds?.gsc_site_url as string | null) ?? null,
      google_ads_customer_id: (creds?.google_ads_customer_id as string | null) ?? null,
      meta_ad_account_id: (creds?.meta_ad_account_id as string | null) ?? null,
      web_leads_webhook_secret: (creds?.web_leads_webhook_secret as string | null) ?? null,
    };
  });
}

async function upsertCredentials(brandId: string, input: ReturnType<typeof normalizeBrandInput>) {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("brand_credentials")
    .select("web_leads_webhook_secret")
    .eq("brand_id", brandId)
    .maybeSingle();

  const { error } = await supabase.from("brand_credentials").upsert({
    brand_id: brandId,
    ga4_property_id: input.ga4_property_id,
    gsc_site_url: input.gsc_site_url,
    google_ads_customer_id: input.google_ads_customer_id,
    meta_ad_account_id: input.meta_ad_account_id,
    web_leads_webhook_secret:
      (existing?.web_leads_webhook_secret as string | null) ?? generateWebLeadsWebhookSecret(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

function brandWritePayload(
  normalized: ReturnType<typeof normalizeBrandInput>,
  options: { abbreviation: boolean; sections: boolean },
) {
  return {
    name: normalized.name,
    slug: normalized.slug,
    domain: normalized.domain,
    accent_color: normalized.accent_color,
    logo_url: normalized.logo_url,
    ...(options.abbreviation ? { nav_abbreviation: normalized.nav_abbreviation } : {}),
    ...(options.sections ? { visible_sections: normalized.visible_sections } : {}),
  };
}

async function saveBrandRow(
  mode: "insert" | "update",
  brandId: string | null,
  normalized: ReturnType<typeof normalizeBrandInput>,
) {
  const supabase = getSupabaseAdmin();
  const attempts = [
    { abbreviation: true, sections: true },
    { abbreviation: false, sections: true },
  ];
  let lastError: { message: string; code?: string } | undefined;

  for (const options of attempts) {
    const payload = brandWritePayload(normalized, options);
    const columns = options.sections ? BRAND_COLUMNS : BRAND_COLUMNS_NO_SECTIONS;
    const query =
      mode === "insert"
        ? supabase.from("brands").insert(payload).select(columns).single()
        : supabase.from("brands").update(payload).eq("id", brandId as string).select(columns).single();
    const result = await query;
    if (!result.error) return result.data;
    lastError = result.error;
    if (!missingColumn(result.error.message)) break;
    if (result.error.message.includes("visible_sections")) {
      throw new Error("Run supabase/add-visible-sections.sql in the Supabase SQL editor, then save again.");
    }
  }

  if (lastError?.code === "23505") throw new Error(`A brand with slug "${normalized.slug}" already exists.`);
  throw new Error(lastError?.message ?? "Could not save brand.");
}

export async function createBrand(input: BrandInput): Promise<Brand> {
  const normalized = normalizeBrandInput(input);
  const data = await saveBrandRow("insert", null, normalized);
  await upsertCredentials(data.id as string, normalized);
  return mapBrand(data as Record<string, unknown>);
}

export async function updateBrand(brandId: string, input: BrandInput): Promise<Brand> {
  const normalized = normalizeBrandInput(input);
  const data = await saveBrandRow("update", brandId, normalized);
  await upsertCredentials(brandId, normalized);
  return mapBrand(data as Record<string, unknown>);
}
