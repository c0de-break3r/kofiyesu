import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { projectToApi } from "../lib/serializers.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isDatabaseConfigured()) {
      return res.status(200).json({ projects: [] });
    }

    const rows = await prisma.siteProject.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return res.status(200).json({ projects: rows.map(projectToApi) });
  } catch (err) {
    console.error("[site/projects] unhandled", err);
    return res.status(200).json({ projects: [] });
  }
}
