ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'new';
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "reply_draft" TEXT;
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMPTZ(6);
ALTER TABLE "contact_inquiries" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "contact_inquiries_status_created_at_idx"
  ON "contact_inquiries"("status", "created_at" DESC);
