-- Drop pricing packages table
DROP TABLE IF EXISTS "site_pricing_packages";

-- Remove services column from site_about
ALTER TABLE "site_about" DROP COLUMN IF EXISTS "services";
