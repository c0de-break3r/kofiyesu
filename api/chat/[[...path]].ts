import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firstPathSegment } from "../lib/routePath.js";
import chatHandler from "../lib/routes/chat/main.js";
import conversationHandler from "../lib/routes/chat/conversation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segment = firstPathSegment(req);

  if (!segment) {
    return chatHandler(req, res);
  }

  if (segment === "conversation") {
    return conversationHandler(req, res);
  }

  return res.status(404).json({ error: "Not found" });
}
