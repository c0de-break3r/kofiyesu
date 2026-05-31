CREATE TABLE IF NOT EXISTS "payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "inquiry_id" UUID,
  "user_id" TEXT,
  "user_email" TEXT,
  "user_name" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "amount_ghs" DECIMAL(12, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'GHS',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "package_id" TEXT,
  "paystack_reference" TEXT,
  "paystack_access_code" TEXT,
  "paid_at" TIMESTAMPTZ,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payments_paystack_reference_key" ON "payments"("paystack_reference");
CREATE INDEX IF NOT EXISTS "payments_user_id_status_idx" ON "payments"("user_id", "status");
CREATE INDEX IF NOT EXISTS "payments_inquiry_id_idx" ON "payments"("inquiry_id");
CREATE INDEX IF NOT EXISTS "payments_status_created_at_idx" ON "payments"("status", "created_at" DESC);

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_inquiry_id_fkey"
  FOREIGN KEY ("inquiry_id") REFERENCES "contact_inquiries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
