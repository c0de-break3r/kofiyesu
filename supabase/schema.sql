-- Single table for client chat logging + admin dashboard
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_type text not null,
  message text not null,
  needs_admin boolean not null default false,
  user_email text,
  user_id text,
  user_name text,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

create policy "Admins can read inquiries"
  on public.contact_inquiries
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert inquiries"
  on public.contact_inquiries
  for insert
  to authenticated
  with check (true);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_needs_admin_idx
  on public.contact_inquiries (needs_admin)
  where needs_admin = true;
