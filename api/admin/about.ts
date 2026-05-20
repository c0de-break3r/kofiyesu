import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../lib/adminAuth.js";
import { getServiceSupabase } from "../lib/supabaseServer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
  const adminId = await requireAdminUserId(req);
  if (!adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return res.status(503).json({ error: "Supabase service role not configured" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.from("site_about").select("*").eq("id", "default").maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ about: data });
  }

  if (req.method === "PATCH") {
    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const key of [
      "display_name",
      "job_title",
      "about_intro",
      "about_tagline",
      "location",
      "services",
    ] as const) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    const { data, error } = await supabase
      .from("site_about")
      .update(patch)
      .eq("id", "default")
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ about: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/about] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
