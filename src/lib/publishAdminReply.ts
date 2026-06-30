import { randomUUID } from "node:crypto";
import { ensureMessageIds, sanitizeMessages, type StoredChatMessage } from "./chatHistory";
import { prisma } from "./prisma";
import { toInputJson } from "./prismaJson";

const ADMIN_REPLY_PREFIX = "**Obed:** ";

export async function appendAdminReplyToChat(options: {
  userId: string;
  conversationId?: string | null;
  replyText: string;
}): Promise<{ ok: boolean; conversationId?: string }> {
  const text = options.replyText.trim();
  if (!text || !options.userId) return { ok: false };

  let conversation =
    options.conversationId &&
    (await prisma.chatConversation.findFirst({
      where: { id: options.conversationId, userId: options.userId },
    }));

  if (!conversation) {
    conversation = await prisma.chatConversation.findFirst({
      where: { userId: options.userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!conversation) return { ok: false };

  const existing = sanitizeMessages(conversation.messages);
  const content = text.startsWith("**Obed") ? text : `${ADMIN_REPLY_PREFIX}${text}`;
  const nextMessage: StoredChatMessage = {
    id: randomUUID(),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
  };

  const messages = ensureMessageIds([...existing, nextMessage]);

  await prisma.chatConversation.update({
    where: { id: conversation.id },
    data: { messages: toInputJson(messages) },
  });

  return { ok: true, conversationId: conversation.id };
}
