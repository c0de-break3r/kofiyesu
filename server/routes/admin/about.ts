import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../../../api/lib/adminAuth.js";
import { isDatabaseConfigured, prisma } from "../../../api/lib/prisma.js";
import { aboutToApi } from "../../../api/lib/serializers.js";

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
      const row = await prisma.siteAbout.findUnique({ where: { id: "default" } });
      return res.status(200).json({ about: row ? aboutToApi(row) : null });
    }

    if (req.method === "PATCH") {
      const body = req.body as Record<string, unknown>;
      const data: Record<string, unknown> = {};

      if (body.display_name !== undefined) data.displayName = body.display_name;
      if (body.job_title !== undefined) data.jobTitle = body.job_title;
      if (body.about_intro !== undefined) data.aboutIntro = body.about_intro;
      if (body.about_tagline !== undefined) data.aboutTagline = body.about_tagline;
      if (body.location !== undefined) data.location = body.location;

      const row = await prisma.siteAbout.upsert({
        where: { id: "default" },
        create: { id: "default", ...data },
        update: data,
      });

      return res.status(200).json({ about: aboutToApi(row) });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/about] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
