-- CMS tables for inline admin (projects + about). Public read; writes via API + service role.

create table if not exists public.site_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  tags jsonb not null default '[]'::jsonb,
  description text,
  thumbnail_url text,
  live_url text,
  source_url text,
  video_border boolean not null default false,
  components jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_about (
  id text primary key default 'default',
  display_name text,
  job_title text,
  about_intro text,
  about_tagline text,
  location text,
  services jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_about (id)
values ('default')
on conflict (id) do nothing;

alter table public.site_projects enable row level security;
alter table public.site_about enable row level security;

drop policy if exists "Public read published projects" on public.site_projects;
create policy "Public read published projects"
  on public.site_projects for select
  using (published = true);

drop policy if exists "Public read about" on public.site_about;
create policy "Public read about"
  on public.site_about for select
  using (true);

create index if not exists site_projects_sort_idx on public.site_projects (sort_order asc, created_at desc);
