import type { SitePricingPackage } from "../../generated/prisma/client.js";

export const pricingPackageToApi = (row: SitePricingPackage) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  amount_ghs: Number(row.amountGhs),
  description: row.description,
  highlights: Array.isArray(row.highlights)
    ? (row.highlights as unknown[]).map(String).filter(Boolean)
    : [],
  featured: row.featured,
  sort_order: row.sortOrder,
  published: row.published,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});
