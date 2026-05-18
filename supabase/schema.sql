-- Run in Supabase SQL editor for admin inquiry logging
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

create policy "Anon can insert inquiries"
  on public.contact_inquiries
  for insert
  to anon
  with check (true);
