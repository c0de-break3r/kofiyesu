-- Phase 3: structured project intake metadata on inquiries

alter table public.contact_inquiries
  add column if not exists intake jsonb;

comment on column public.contact_inquiries.intake is
  'Structured intake: projectType, timeline, budget, summary, urgent';
