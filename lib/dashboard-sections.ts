export const DASHBOARD_SECTIONS = [
  { key: "leads", label: "Leads" },
  { key: "search", label: "Search" },
  { key: "google_ads", label: "Google Ads" },
  { key: "meta_ads", label: "Meta Ads" },
  { key: "ai", label: "AI visibility" },
  { key: "offline_leads", label: "Offline leads" },
  { key: "web_leads", label: "Web leads" },
] as const;

export type DashboardSectionKey = (typeof DASHBOARD_SECTIONS)[number]["key"];
export type DashboardSections = Record<DashboardSectionKey, boolean>;

export const DEFAULT_DASHBOARD_SECTIONS: DashboardSections = {
  leads: true,
  search: true,
  google_ads: true,
  meta_ads: true,
  ai: true,
  offline_leads: true,
  web_leads: true,
};

export function parseVisibleSections(value: unknown): DashboardSections {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    leads: record.leads !== false,
    search: record.search !== false,
    google_ads: record.google_ads !== false,
    meta_ads: record.meta_ads !== false,
    ai: record.ai !== false,
    offline_leads: record.offline_leads !== false,
    web_leads: record.web_leads !== false,
  };
}

export function sectionsFromForm(formData: FormData): DashboardSections {
  return {
    leads: formData.get("section_leads") === "1",
    search: formData.get("section_search") === "1",
    google_ads: formData.get("section_google_ads") === "1",
    meta_ads: formData.get("section_meta_ads") === "1",
    ai: formData.get("section_ai") === "1",
    offline_leads: formData.get("section_offline_leads") === "1",
    web_leads: formData.get("section_web_leads") === "1",
  };
}
