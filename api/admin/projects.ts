import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../lib/adminAuth.js";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { projectToApi } from "../lib/serializers.js";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

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
      const rows = await prisma.siteProject.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      return res.status(200).json({ projects: rows.map(projectToApi) });
    }

    if (req.method === "POST") {
      const body = req.body as Record<string, unknown>;
      const slug = slugify(String(body.slug ?? ""));
      if (!slug) return res.status(400).json({ error: "slug required" });

      const row = await prisma.siteProject.create({
        data: {
          slug,
          title: String(body.title ?? slug),
          theme: body.theme === "light" ? "light" : "dark",
          tags: Array.isArray(body.tags) ? body.tags : [],
          description: body.description ? String(body.description) : null,
          thumbnailUrl: body.thumbnail_url ? String(body.thumbnail_url) : null,
          liveUrl: body.live_url ? String(body.live_url) : null,
          sourceUrl: body.source_url ? String(body.source_url) : null,
          videoBorder: Boolean(body.video_border),
          components: Array.isArray(body.components) ? body.components : [],
          sortOrder: Number(body.sort_order) || 0,
          published: body.published !== false,
        },
      });

      return res.status(201).json({ project: projectToApi(row) });
    }

    if (req.method === "PATCH") {
      const id = (req.query.id as string) || (req.body as { id?: string })?.id;
      if (!id) return res.status(400).json({ error: "id required" });

      const body = req.body as Record<string, unknown>;
      const data: Record<string, unknown> = {};

      if (body.title !== undefined) data.title = String(body.title);
      if (body.theme !== undefined) data.theme = body.theme === "light" ? "light" : "dark";
      if (body.tags !== undefined) data.tags = body.tags;
      if (body.description !== undefined) data.description = body.description;
      if (body.thumbnail_url !== undefined) data.thumbnailUrl = body.thumbnail_url;
      if (body.live_url !== undefined) data.liveUrl = body.live_url;
      if (body.source_url !== undefined) data.sourceUrl = body.source_url;
      if (body.video_border !== undefined) data.videoBorder = Boolean(body.video_border);
      if (body.components !== undefined) data.components = body.components;
      if (body.sort_order !== undefined) data.sortOrder = Number(body.sort_order);
      if (body.published !== undefined) data.published = Boolean(body.published);
      if (body.slug !== undefined) data.slug = slugify(String(body.slug));

      const row = await prisma.siteProject.update({
        where: { id },
        data,
      });

      return res.status(200).json({ project: projectToApi(row) });
    }

    if (req.method === "DELETE") {
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: "id required" });

      await prisma.siteProject.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/projects] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
