import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../lib/adminAuth.js";
import { getServiceSupabase } from "../lib/supabaseServer.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const adminId = await requireAdminUserId(req);
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const supabase = getServiceSupabase();
    if (!supabase) {
      return res.status(503).json({ error: "Supabase service role not configured" });
    }

    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("id, inquiry_type, message, needs_admin, user_email, user_name, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[admin/inquiries]", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ inquiries: data ?? [] });
  } catch (err) {
    console.error("[admin/inquiries] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
