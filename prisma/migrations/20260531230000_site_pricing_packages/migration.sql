CREATE TABLE "site_pricing_packages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount_ghs" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "highlights" JSONB NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_pricing_packages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "site_pricing_packages_slug_key" ON "site_pricing_packages"("slug");
CREATE INDEX "site_pricing_packages_sort_order_created_at_idx" ON "site_pricing_packages"("sort_order", "created_at");
