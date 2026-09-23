-- Import Hueston client accounts from the marketing export.
-- Run once in the Hueston Supabase SQL editor.
-- Existing companies keep their logo, accent color, and web-leads webhook secret.
-- New companies use accent #DE492F.
-- GAR Appraisal had no domain in the export, so the domain is set to a .missing placeholder. Set the real domain in Admin after this runs.

insert into brands (slug, name, nav_abbreviation, domain, accent_color)
values
  ('ida', 'International Dental Arts', 'IDA', 'idasmiles.com', '#DE492F'),
  ('odl', 'ODL Orthodontic Lab', 'ODL', 'odlortho.com', '#DE492F'),
  ('holimont', 'HoliMont', 'HM', 'holimont.com', '#DE492F'),
  ('dr-wax', 'Dr. Wax Orthodontics', 'WAX', 'waxortho.com', '#DE492F'),
  ('tooth-by-tooth', 'Tooth by Tooth', 'TBT', 'toothbytooth.com', '#DE492F'),
  ('limitless', 'Limitless Physical Therapy', 'LPT', 'limitlesspts.com', '#DE492F'),
  ('specialty-appliances', 'Specialty Appliances', 'SA', 'specialtyappliances.com', '#DE492F'),
  ('unyse', 'UNYSE', 'UNYSE', 'unyse.net', '#DE492F'),
  ('eea', 'Environmental Education Associates', 'EEA', 'environmentaleducation.com', '#DE492F'),
  ('exact', 'Exact', 'EXACT', 'getexact.com', '#DE492F'),
  ('elite-multimedia', 'Elite Multimedia', 'EMM', 'elitemultimedia.com', '#DE492F'),
  ('jeffs-attic', 'Jeff''s Attic', 'JA', 'jeffsattic.com', '#DE492F'),
  ('flexpak', 'FlexPak', 'FP', 'flexpakinc.com', '#DE492F'),
  ('nexinite', 'Nexinite', 'NEX', 'nexinite.com', '#DE492F'),
  ('cabin', 'Cabin', 'CABIN', 'cabinco.com', '#DE492F'),
  ('wyrick', 'The Wyrick Outlook', 'WYR', 'thewyrickoutlook.com', '#DE492F'),
  ('sspp', 'SSPP', 'SSPP', 'ssppschool.com', '#DE492F'),
  ('invest-buffalo-niagara', 'Invest Buffalo Niagara', 'IBN', 'buffaloniagara.org', '#DE492F'),
  ('spectrum-health', 'Spectrum Health', 'SHS', 'shswny.org', '#DE492F'),
  ('gar-appraisal', 'GAR Appraisal', 'GAR', 'gar-appraisal.missing', '#DE492F'),
  ('edl', 'Express Dental Laboratory', 'EDL', 'xdentallab.com', '#DE492F'),
  ('boces', 'Boces (WNY Literacy)', 'BOCES', 'wnyliteracy.com', '#DE492F'),
  ('lava', 'Lava', 'LAVA', 'lavalamp.com', '#DE492F'),
  ('schylling', 'Schylling', 'SCH', 'schylling.com', '#DE492F'),
  ('park-place', 'Park Place Installations', 'PPI', 'parkplaceinstallations.com', '#DE492F'),
  ('sonrisas', 'Sonrisas Dental Center', 'SDC', 'sonrisasdentalcenter.com', '#DE492F')
on conflict (slug) do update set
  name = excluded.name,
  nav_abbreviation = excluded.nav_abbreviation,
  domain = excluded.domain,
  is_active = true;

insert into brand_credentials (
  brand_id,
  ga4_property_id,
  gsc_site_url,
  google_ads_customer_id,
  meta_ad_account_id,
  web_leads_webhook_secret,
  updated_at
)
select
  b.id,
  v.ga4_property_id,
  v.gsc_site_url,
  v.google_ads_customer_id,
  v.meta_ad_account_id,
  'wl_' || encode(gen_random_bytes(24), 'hex'),
  now()
from (values
  ('ida', 'properties/383134220', 'sc-domain:idasmiles.com', '665-255-2374', '1084825485820339'),
  ('odl', 'properties/297581130', 'sc-domain:odlortho.com', '254-735-9903', '289837420'),
  ('holimont', 'properties/390940697', 'https://holimont.com/', '409-855-0143', '374113016545624'),
  ('dr-wax', 'properties/300321788', 'sc-domain:waxortho.com', '881-964-1170', '306376863229056'),
  ('tooth-by-tooth', 'properties/368353814', 'sc-domain:toothbytooth.com', '517-918-9154', '1078007726131983'),
  ('limitless', 'properties/393155601', 'sc-domain:limitlesspts.com', '993-337-7099', '324705335078823'),
  ('specialty-appliances', 'properties/326827208', 'sc-domain:specialtyappliances.com', '508-364-8258', '166259563238032'),
  ('unyse', 'properties/487038397', 'https://unyse.net/', '585-781-2678', null),
  ('eea', 'properties/487036591', 'https://environmentaleducation.com/', '817-541-6305', null),
  ('exact', 'properties/486871139', 'sc-domain:getexact.com', '385-533-1554', null),
  ('elite-multimedia', 'properties/349269567', 'sc-domain:elitemultimedia.com', '456-804-2345', null),
  ('jeffs-attic', 'properties/292038054', 'sc-domain:jeffsattic.com', '995-870-0868', null),
  ('flexpak', 'properties/362702197', 'https://flexpakinc.com/', null, null),
  ('nexinite', 'properties/453287762', 'sc-domain:nexinite.com', null, null),
  ('cabin', 'properties/473069896', 'sc-domain:cabinco.com', null, null),
  ('wyrick', 'properties/390269830', 'sc-domain:thewyrickoutlook.com', null, null),
  ('sspp', 'properties/469514647', 'sc-domain:ssppschool.com', null, null),
  ('invest-buffalo-niagara', 'properties/346091792', 'sc-domain:buffaloniagara.org', null, null),
  ('spectrum-health', null, 'https://shswny.org/', null, null),
  ('gar-appraisal', 'properties/365379425', null, null, null),
  ('edl', null, null, null, null),
  ('boces', null, null, '723-677-6903', null),
  ('lava', null, null, '179-988-5995', null),
  ('schylling', null, null, '295-573-4472', null),
  ('park-place', null, null, '313-112-7701', null),
  ('sonrisas', null, null, '556-368-0550', null)
) as v(slug, ga4_property_id, gsc_site_url, google_ads_customer_id, meta_ad_account_id)
join brands b on b.slug = v.slug
on conflict (brand_id) do update set
  ga4_property_id = excluded.ga4_property_id,
  gsc_site_url = excluded.gsc_site_url,
  google_ads_customer_id = excluded.google_ads_customer_id,
  meta_ad_account_id = excluded.meta_ad_account_id,
  web_leads_webhook_secret = coalesce(brand_credentials.web_leads_webhook_secret, excluded.web_leads_webhook_secret),
  updated_at = now();
