import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAnonSupabase } from "../lib/supabaseServer.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    if (_req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = getAnonSupabase();
    if (!supabase) {
      return res.status(200).json({ about: null });
    }

    const { data, error } = await supabase.from("site_about").select("*").eq("id", "default").maybeSingle();

    if (error) {
      console.error("[site/about]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ about: data });
  } catch (err) {
    console.error("[site/about] unhandled", err);
    return res.status(200).json({ about: null });
  }
}
