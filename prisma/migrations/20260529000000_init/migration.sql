-- Baseline schema (production was originally created via db push; incremental migrations assume these exist)

CREATE TABLE IF NOT EXISTS "site_features" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_features_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "site_features_slug_key" ON "site_features"("slug");
CREATE INDEX IF NOT EXISTS "site_features_sort_order_created_at_idx" ON "site_features"("sort_order", "created_at");

CREATE TABLE IF NOT EXISTS "site_projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "category_id" UUID,
    "description" TEXT,
    "thumbnail_url" TEXT,
    "live_url" TEXT,
    "source_url" TEXT,
    "video_border" BOOLEAN NOT NULL DEFAULT false,
    "components" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_projects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "site_projects_slug_key" ON "site_projects"("slug");
CREATE INDEX IF NOT EXISTS "site_projects_sort_order_created_at_idx" ON "site_projects"("sort_order", "created_at");
CREATE INDEX IF NOT EXISTS "site_projects_category_id_idx" ON "site_projects"("category_id");

DO $$ BEGIN
  ALTER TABLE "site_projects"
    ADD CONSTRAINT "site_projects_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "site_features"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "site_about" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "display_name" TEXT,
    "job_title" TEXT,
    "about_intro" TEXT,
    "about_tagline" TEXT,
    "location" TEXT,
    "services" JSONB NOT NULL DEFAULT '[]',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_about_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "contact_inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "inquiry_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "needs_admin" BOOLEAN NOT NULL DEFAULT false,
    "user_email" TEXT,
    "user_id" TEXT,
    "user_name" TEXT,
    "intake" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contact_inquiries_created_at_idx" ON "contact_inquiries"("created_at" DESC);
