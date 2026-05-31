ALTER TABLE "contact_inquiries"
  ADD COLUMN IF NOT EXISTS "conversation_id" UUID,
  ADD COLUMN IF NOT EXISTS "admin_reply" TEXT,
  ADD COLUMN IF NOT EXISTS "admin_reply_at" TIMESTAMPTZ;
