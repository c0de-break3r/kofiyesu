import type { ChatMessage, ChatMessageAttachmentView } from "@/lib/contactAi";

const STORAGE_PREFIX = "kofiyesu-chat-history";
const MAX_LOCAL_MESSAGES = 120;

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function serializeMessagesForStorage(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(-MAX_LOCAL_MESSAGES).map((m) => ({
    role: m.role,
    content: m.content,
    attachments: m.attachments?.map(({ id, name, mimeType, size }) => ({
      id,
      name,
      mimeType,
      size,
    })),
  }));
}

function parseStoredMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.role !== "user" && row.role !== "assistant") continue;
    const content = typeof row.content === "string" ? row.content : "";
    const attachments = parseAttachments(row.attachments);
    if (!content.trim() && !attachments.length) continue;
    out.push({
      role: row.role,
      content,
      attachments: attachments.length ? attachments : undefined,
    });
  }
  return out.slice(-MAX_LOCAL_MESSAGES);
}

function parseAttachments(raw: unknown): ChatMessageAttachmentView[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessageAttachmentView[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name : "";
    const mimeType = typeof row.mimeType === "string" ? row.mimeType : "";
    const id = typeof row.id === "string" ? row.id : crypto.randomUUID();
    if (!name || !mimeType) continue;
    out.push({
      id,
      name,
      mimeType,
      size: typeof row.size === "number" ? row.size : undefined,
    });
  }
  return out;
}

function readLocalHistory(userId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    return parseStoredMessages(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeLocalHistory(userId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(serializeMessagesForStorage(messages)));
  } catch {
    /* quota */
  }
}

function clearLocalHistory(userId: string) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}

async function authFetch(
  getToken: () => Promise<string | null>,
  init: RequestInit,
): Promise<Response | null> {
  const token = await getToken();
  if (!token) return null;

  return fetch("/api/chat/conversation", {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

export async function loadChatHistory(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<ChatMessage[]> {
  try {
    const res = await authFetch(getToken, { method: "GET" });
    if (res?.ok) {
      const data = (await res.json()) as { messages?: unknown };
      const messages = parseStoredMessages(data.messages);
      writeLocalHistory(userId, messages);
      return messages;
    }
  } catch {
    /* fall through */
  }

  return readLocalHistory(userId);
}

export async function saveChatHistory(
  getToken: () => Promise<string | null>,
  userId: string,
  messages: ChatMessage[],
): Promise<void> {
  const payload = serializeMessagesForStorage(messages);
  writeLocalHistory(userId, payload);

  try {
    const res = await authFetch(getToken, {
      method: "PUT",
      body: JSON.stringify({ messages: payload }),
    });
    if (res?.ok) return;
  } catch {
    /* local only */
  }
}

export async function clearChatHistory(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<void> {
  clearLocalHistory(userId);

  try {
    await authFetch(getToken, { method: "DELETE" });
  } catch {
    /* ignore */
  }
}
