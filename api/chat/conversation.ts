import type { VercelRequest, VercelResponse } from "@vercel/node";
import { parseJsonBody } from "../lib/parseJsonBody.js";
import conversationHandler from "../../server/routes/chat/conversation.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "POST" || req.method === "PUT") {
      await parseJsonBody(req);
    }
    return await conversationHandler(req, res);
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid JSON body") {
      return res.status(400).json({ error: err.message });
    }
    console.error("[api/chat/conversation]", err);
    return res.status(500).json({ error: "Chat sync failed" });
  }
};
