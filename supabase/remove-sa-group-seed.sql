-- Run once in the Hueston Supabase SQL editor.
-- Removes leftover SA Group seed companies. ida and edl are real Hueston clients
-- in the marketing export, so they are not included.
-- Fails if any of these rows already have people, credentials, or metrics.

delete from brands
where slug in ('sa-appliances', 'odl-ortho');
