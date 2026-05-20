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
    const { data, error } = await supabase
      .from("site_projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ projects: data ?? [] });
  }

  if (req.method === "POST") {
    const body = req.body as Record<string, unknown>;
    const slug = String(body.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    if (!slug) return res.status(400).json({ error: "slug required" });

    const row = {
      slug,
      title: String(body.title ?? slug),
      theme: body.theme === "light" ? "light" : "dark",
      tags: Array.isArray(body.tags) ? body.tags : [],
      description: body.description ? String(body.description) : null,
      thumbnail_url: body.thumbnail_url ? String(body.thumbnail_url) : null,
      live_url: body.live_url ? String(body.live_url) : null,
      source_url: body.source_url ? String(body.source_url) : null,
      video_border: Boolean(body.video_border),
      components: Array.isArray(body.components) ? body.components : [],
      sort_order: Number(body.sort_order) || 0,
      published: body.published !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("site_projects").insert(row).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ project: data });
  }

  if (req.method === "PATCH") {
    const id = (req.query.id as string) || (req.body as { id?: string })?.id;
    if (!id) return res.status(400).json({ error: "id required" });

    const body = req.body as Record<string, unknown>;
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

    for (const key of [
      "title",
      "theme",
      "tags",
      "description",
      "thumbnail_url",
      "live_url",
      "source_url",
      "video_border",
      "components",
      "sort_order",
      "published",
    ] as const) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    if (body.slug !== undefined) {
      patch.slug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
    }

    const { data, error } = await supabase.from("site_projects").update(patch).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ project: data });
  }

  if (req.method === "DELETE") {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "id required" });

    const { error } = await supabase.from("site_projects").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/projects] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
