-- Keep only what client + admin need: contact_inquiries for chat logging / dashboard.
-- Remove anonymous inserts (chat requires Clerk sign-in).

drop policy if exists "Anon can insert inquiries" on public.contact_inquiries;

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_needs_admin_idx
  on public.contact_inquiries (needs_admin)
  where needs_admin = true;
