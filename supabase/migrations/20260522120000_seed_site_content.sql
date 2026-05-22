-- Phase 1: default about copy + three portfolio projects (idempotent).

update public.site_about
set
  display_name = 'Obed Prince Kofi Yesu',
  job_title = 'Software Engineer & Pentester',
  about_intro = 'I''m a Software Engineer and Cybersecurity Practitioner based in Ghana. I build production backend systems, ship mobile and web products, and design automation for recon and web application security testing.',
  about_tagline = 'Backend APIs, offensive security workflows, and Python/Bash tooling — from grocery ecommerce in Ho to pentest-ready automation.',
  location = 'Ghana',
  services = '[
    {"name": "Backend Development"},
    {"name": "Web Application Pentesting"},
    {"name": "Automation & Recon Tooling"},
    {"name": "Mobile & Web Software"}
  ]'::jsonb,
  updated_at = now()
where id = 'default';

insert into public.site_about (id, display_name, job_title, about_intro, about_tagline, location, services)
select
  'default',
  'Obed Prince Kofi Yesu',
  'Software Engineer & Pentester',
  'I''m a Software Engineer and Cybersecurity Practitioner based in Ghana. I build production backend systems, ship mobile and web products, and design automation for recon and web application security testing.',
  'Backend APIs, offensive security workflows, and Python/Bash tooling — from grocery ecommerce in Ho to pentest-ready automation.',
  'Ghana',
  '[
    {"name": "Backend Development"},
    {"name": "Web Application Pentesting"},
    {"name": "Automation & Recon Tooling"},
    {"name": "Mobile & Web Software"}
  ]'::jsonb
where not exists (select 1 from public.site_about where id = 'default');

insert into public.site_projects (
  slug, title, theme, tags, description, thumbnail_url, live_url, source_url,
  video_border, components, sort_order, published, updated_at
)
values
  (
    'kheliancart',
    'KhelianCart',
    'dark',
    '["node","postgresql","javascript","html","css"]'::jsonb,
    'Grocery ecommerce platform for Ho, Ghana — catalog, cart, checkout, and delivery partner workflows.',
    '/thumbnails/kheliancart.webp',
    'https://kheliancart.com',
    null,
    false,
    '[
      {"type":"media","props":{"type":"image","src":"/thumbnails/kheliancart.webp","alt":"KhelianCart grocery ecommerce","caption":"KhelianCart — grocery delivery in Ho, Ghana"}},
      {"type":"text","props":{"title":"What I built","text":"Full-stack grocery ecommerce: product catalog, cart, checkout, delivery partner flows, and admin-ready backend APIs with validation and secure coding practices."}},
      {"type":"list","props":{"title":"Stack & focus","size":"md","items":["Node.js / Express APIs","PostgreSQL data layer","Web and mobile-friendly storefront","Secure payments and order workflows"]}}
    ]'::jsonb,
    0,
    true,
    now()
  ),
  (
    'security-recon-toolkit',
    'Recon Automation Toolkit',
    'dark',
    '["node","javascript","postgresql"]'::jsonb,
    'Python and Bash tooling for bug bounty recon — asset discovery, scope tracking, and repeatable scan pipelines.',
    '/meta/logo-avatar.png',
    null,
    null,
    false,
    '[
      {"type":"text","props":{"title":"Overview","text":"A modular recon toolkit that chains subdomain enumeration, HTTP probing, and findings export into structured reports for web application assessments."}},
      {"type":"list","props":{"title":"Capabilities","size":"md","items":["Scope-aware asset inventory","Scheduled diffing between runs","JSON export for reporting workflows","CLI-friendly for CI and local hunts"]}}
    ]'::jsonb,
    1,
    true,
    now()
  ),
  (
    'api-pentest-workflows',
    'API Pentest Workflows',
    'light',
    '["node","postgresql","react"]'::jsonb,
    'Methodology and automation for testing REST APIs — auth flows, IDOR checks, and rate-limit validation.',
    '/meta/logo-avatar.png',
    null,
    null,
    false,
    '[
      {"type":"text","props":{"title":"Approach","text":"Structured API reviews combining manual testing with scripted probes for authentication, authorization, input validation, and business-logic edge cases."}},
      {"type":"list","props":{"title":"Deliverables","size":"md","items":["Threat-modeled test cases per endpoint","Evidence-backed finding write-ups","Remediation priorities for dev teams","Optional re-test verification"]}}
    ]'::jsonb,
    2,
    true,
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  theme = excluded.theme,
  tags = excluded.tags,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  live_url = excluded.live_url,
  source_url = excluded.source_url,
  video_border = excluded.video_border,
  components = excluded.components,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
