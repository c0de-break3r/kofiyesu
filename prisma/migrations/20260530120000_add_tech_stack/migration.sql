-- Add tech_stack column for project CMS (safe if already applied via db push)
ALTER TABLE "site_projects" ADD COLUMN IF NOT EXISTS "tech_stack" JSONB NOT NULL DEFAULT '[]';
