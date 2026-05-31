import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "../lib/clerkAuth.js";
import { sanitizeMessages, type StoredChatMessage } from "../lib/chatHistory.js";
import { isDatabaseConfigured, prisma } from "../lib/prisma.js";
import { toInputJson } from "../lib/prismaJson.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await requireSignedInUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  if (req.method === "GET") {
    const row = await prisma.chatConversation.findUnique({
      where: { userId },
    });

    const messages = sanitizeMessages(row?.messages);
    return res.status(200).json({
      messages,
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    });
  }

  if (req.method === "PUT") {
    const body = req.body as { messages?: unknown };
    const messages = sanitizeMessages(body.messages);

    const row = await prisma.chatConversation.upsert({
      where: { userId },
      create: {
        userId,
        messages: toInputJson(messages),
      },
      update: {
        messages: toInputJson(messages),
      },
    });

    return res.status(200).json({
      ok: true,
      updatedAt: row.updatedAt.toISOString(),
      count: messages.length,
    });
  }

  if (req.method === "DELETE") {
    await prisma.chatConversation.deleteMany({ where: { userId } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
