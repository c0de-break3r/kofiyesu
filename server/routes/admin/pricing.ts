import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../../../api/lib/adminAuth.js";
import { isDatabaseConfigured, prisma } from "../../../api/lib/prisma.js";
import { pricingPackageToApi } from "../../../api/lib/pricingSerializer.js";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function parseHighlights(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).map((s) => s.trim()).filter(Boolean);
}

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
      const rows = await prisma.sitePricingPackage.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return res.status(200).json({ packages: rows.map(pricingPackageToApi) });
    }

    if (req.method === "POST") {
      const body = req.body as Record<string, unknown>;
      const title = String(body.title ?? "").trim();
      if (!title) return res.status(400).json({ error: "title required" });

      const slug = slugify(String(body.slug ?? title));
      if (!slug) return res.status(400).json({ error: "slug required" });

      const amountGhs = Number(body.amount_ghs);
      if (!amountGhs || amountGhs <= 0) {
        return res.status(400).json({ error: "amount_ghs required" });
      }

      const description = String(body.description ?? "").trim();
      if (!description) return res.status(400).json({ error: "description required" });

      if (body.featured === true) {
        await prisma.sitePricingPackage.updateMany({ data: { featured: false } });
      }

      const row = await prisma.sitePricingPackage.create({
        data: {
          slug,
          title,
          amountGhs,
          description,
          highlights: parseHighlights(body.highlights),
          featured: body.featured === true,
          sortOrder: Number(body.sort_order) || 0,
          published: body.published !== false,
        },
      });

      return res.status(201).json({ package: pricingPackageToApi(row) });
    }

    if (req.method === "PATCH") {
      const id = (req.query.id as string) || (req.body as { id?: string })?.id;
      if (!id) return res.status(400).json({ error: "id required" });

      const body = req.body as Record<string, unknown>;
      const data: Record<string, unknown> = {};

      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.slug !== undefined) data.slug = slugify(String(body.slug));
      if (body.amount_ghs !== undefined) data.amountGhs = Number(body.amount_ghs);
      if (body.description !== undefined) data.description = String(body.description).trim();
      if (body.highlights !== undefined) data.highlights = parseHighlights(body.highlights);
      if (body.featured !== undefined) {
        data.featured = Boolean(body.featured);
        if (data.featured) {
          await prisma.sitePricingPackage.updateMany({
            where: { NOT: { id } },
            data: { featured: false },
          });
        }
      }
      if (body.sort_order !== undefined) data.sortOrder = Number(body.sort_order);
      if (body.published !== undefined) data.published = Boolean(body.published);

      const row = await prisma.sitePricingPackage.update({
        where: { id },
        data,
      });

      return res.status(200).json({ package: pricingPackageToApi(row) });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "id required" });

      await prisma.sitePricingPackage.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/pricing] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
