-- Run once in the Hueston Supabase SQL editor.
-- Removes the four Specialty / SA Group companies copied in from schema.sql.
-- Fails if any of those rows already have people, credentials, or metrics.

delete from brands
where slug in ('sa-appliances', 'odl-ortho', 'ida', 'edl');
