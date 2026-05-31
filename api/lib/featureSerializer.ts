import type { SiteFeature } from "@prisma/client";

export const featureToApi = (row: SiteFeature) => ({
  id: row.id,
  slug: row.slug,
  label: row.label,
  sort_order: row.sortOrder,
  published: row.published,
  created_at: row.createdAt.toISOString(),
  updated_at: row.updatedAt.toISOString(),
});
