-- Run once in the Hueston Supabase SQL editor.
-- Per-company dashboard sections. Missing keys stay visible.

alter table brands
  add column if not exists visible_sections jsonb not null default '{
    "leads": true,
    "search": true,
    "google_ads": true,
    "meta_ads": true,
    "ai": true,
    "offline_leads": true,
    "web_leads": true
  }'::jsonb;
