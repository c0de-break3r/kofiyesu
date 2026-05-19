-- Contact inquiry logging for AI chat + admin dashboard
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

drop policy if exists "Admins can read inquiries" on public.contact_inquiries;
create policy "Admins can read inquiries"
  on public.contact_inquiries
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert inquiries" on public.contact_inquiries;
create policy "Authenticated users can insert inquiries"
  on public.contact_inquiries
  for insert
  to authenticated
  with check (true);

drop policy if exists "Anon can insert inquiries" on public.contact_inquiries;
create policy "Anon can insert inquiries"
  on public.contact_inquiries
  for insert
  to anon
  with check (true);
