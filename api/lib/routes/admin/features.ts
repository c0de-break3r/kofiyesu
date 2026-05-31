import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../../adminAuth.js";
import { isDatabaseConfigured, prisma } from "../../prisma.js";
import { featureToApi } from "../../serializers.js";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const adminId = await requireAdminUserId(req);
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isDatabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    if (req.method === "GET") {
      const rows = await prisma.siteFeature.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return res.status(200).json({ features: rows.map(featureToApi) });
    }

    if (req.method === "POST") {
      const body = req.body as Record<string, unknown>;
      const label = String(body.label ?? "").trim();
      if (!label) return res.status(400).json({ error: "label required" });

      const slug = slugify(String(body.slug ?? label));
      if (!slug) return res.status(400).json({ error: "slug required" });

      const row = await prisma.siteFeature.create({
        data: {
          slug,
          label,
          sortOrder: Number(body.sort_order) || 0,
          published: body.published !== false,
        },
      });

      return res.status(201).json({ feature: featureToApi(row) });
    }

    if (req.method === "PATCH") {
      const id = (req.query.id as string) || (req.body as { id?: string })?.id;
      if (!id) return res.status(400).json({ error: "id required" });

      const body = req.body as Record<string, unknown>;
      const data: Record<string, unknown> = {};

      if (body.label !== undefined) data.label = String(body.label).trim();
      if (body.slug !== undefined) data.slug = slugify(String(body.slug));
      if (body.sort_order !== undefined) data.sortOrder = Number(body.sort_order);
      if (body.published !== undefined) data.published = Boolean(body.published);

      const row = await prisma.siteFeature.update({
        where: { id },
        data,
      });

      return res.status(200).json({ feature: featureToApi(row) });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "id required" });

      await prisma.siteProject.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
      await prisma.siteFeature.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/features] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
