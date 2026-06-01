import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "../../../api/lib/clerkAuth.js";
import {
  conversationPreview,
  deriveConversationTitle,
  sanitizeMessages,
} from "../../../api/lib/chatHistory.js";
import { isDatabaseConfigured, prisma } from "../../../api/lib/prisma.js";
import { toInputJson } from "../../../api/lib/prismaJson.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleConversation(req, res);
  } catch (err) {
    console.error("[chat/conversation]", err);
    return res.status(500).json({ error: "Chat sync failed" });
  }
}

async function handleConversation(req: VercelRequest, res: VercelResponse) {
  const userId = await requireSignedInUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const conversationId = typeof req.query.id === "string" ? req.query.id : undefined;

  if (req.method === "GET") {
    if (conversationId) {
      const row = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (!row) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = sanitizeMessages(row.messages);
      return res.status(200).json({
        id: row.id,
        title: row.title,
        messages,
        updatedAt: row.updatedAt.toISOString(),
      });
    }

    const rows = await prisma.chatConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        messages: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      conversations: rows.map((row) => {
        const messages = sanitizeMessages(row.messages);
        return {
          id: row.id,
          title: row.title || deriveConversationTitle(messages),
          preview: conversationPreview(messages),
          updatedAt: row.updatedAt.toISOString(),
          createdAt: row.createdAt.toISOString(),
          messageCount: messages.length,
        };
      }),
    });
  }

  if (req.method === "POST") {
    const body = (req.body ?? {}) as { title?: string };
    const row = await prisma.chatConversation.create({
      data: {
        userId,
        title: body.title?.trim() || "New chat",
        messages: toInputJson([]),
      },
    });

    return res.status(201).json({
      id: row.id,
      title: row.title,
      messages: [],
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  if (req.method === "PUT") {
    const body = req.body as { id?: string; messages?: unknown; title?: string };
    if (!body.id) {
      return res.status(400).json({ error: "Conversation id required" });
    }

    const existing = await prisma.chatConversation.findFirst({
      where: { id: body.id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = sanitizeMessages(body.messages);
    const title =
      body.title?.trim() ||
      (messages.length > 0 ? deriveConversationTitle(messages) : existing.title);

    const row = await prisma.chatConversation.update({
      where: { id: body.id },
      data: {
        messages: toInputJson(messages),
        title,
      },
    });

    return res.status(200).json({
      ok: true,
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt.toISOString(),
      count: messages.length,
    });
  }

  if (req.method === "DELETE") {
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation id required" });
    }

    const deleted = await prisma.chatConversation.deleteMany({
      where: { id: conversationId, userId },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
