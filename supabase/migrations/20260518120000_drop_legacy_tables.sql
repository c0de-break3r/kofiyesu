-- Remove tables from the previous services/marketplace app (not used by this portfolio).

drop table if exists public.service_transactions cascade;
drop table if exists public.service_requests cascade;
drop table if exists public.service_plans cascade;
drop table if exists public.services cascade;
drop table if exists public.projects cascade;
drop table if exists public.about_page cascade;
drop table if exists public.skills cascade;

-- Orphan enum from legacy service schema (if present)
drop type if exists public.pricing_model cascade;
