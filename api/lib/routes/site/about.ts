import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isDatabaseConfigured, prisma } from "../../prisma.js";
import { aboutToApi } from "../../serializers.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    if (!isDatabaseConfigured()) {
      return res.status(200).json({ about: null });
    }

    const row = await prisma.siteAbout.findUnique({ where: { id: "default" } });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).json({ about: row ? aboutToApi(row) : null });
  } catch (err) {
    console.error("[site/about] unhandled", err);
    return res.status(200).json({ about: null });
  }
}
