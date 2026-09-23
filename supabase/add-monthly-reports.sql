-- Run once in the Hueston Supabase SQL editor.
-- One monthly report per company per month. The slug is the path, like august-2026-elite-multimedia.

create table if not exists monthly_reports (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands(id) on delete cascade,
  month date not null,
  slug text not null unique,
  win_of_month text not null,
  work_done text not null,
  created_at timestamptz not null default now(),
  unique (brand_id, month)
);

alter table monthly_reports enable row level security;
