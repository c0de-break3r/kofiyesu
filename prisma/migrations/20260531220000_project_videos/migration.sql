ALTER TABLE "site_projects" ADD COLUMN IF NOT EXISTS "preview_video_url" TEXT;
ALTER TABLE "site_projects" ADD COLUMN IF NOT EXISTS "showcase_video_url" TEXT;
ALTER TABLE "site_projects" ADD COLUMN IF NOT EXISTS "showcase_video_caption" TEXT;
