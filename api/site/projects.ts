import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAnonSupabase } from "../lib/supabaseServer.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = getAnonSupabase();
    if (!supabase) {
      return res.status(200).json({ projects: [] });
    }

    const { data, error } = await supabase
      .from("site_projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[site/projects]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ projects: data ?? [] });
  } catch (err) {
    console.error("[site/projects] unhandled", err);
    return res.status(200).json({ projects: [] });
  }
}
