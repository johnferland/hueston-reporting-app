-- Run once in the Hueston Supabase SQL editor.
-- Lets a company manager be assigned to more than one website.

create table if not exists user_brands (
  user_id uuid not null references users(id) on delete cascade,
  brand_id uuid not null references brands(id) on delete cascade,
  primary key (user_id, brand_id)
);

create index if not exists user_brands_brand_id_idx on user_brands (brand_id);

insert into user_brands (user_id, brand_id)
select id, brand_id
from users
where brand_id is not null
on conflict do nothing;

alter table user_brands enable row level security;
