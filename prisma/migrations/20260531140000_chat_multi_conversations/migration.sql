-- Multiple conversations per user + titles
ALTER TABLE "chat_conversations" DROP CONSTRAINT IF EXISTS "chat_conversations_user_id_key";

ALTER TABLE "chat_conversations" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT 'New chat';

CREATE INDEX IF NOT EXISTS "chat_conversations_user_id_updated_at_idx"
  ON "chat_conversations"("user_id", "updated_at" DESC);
