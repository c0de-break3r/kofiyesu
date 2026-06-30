import { toInputJson } from "@/lib/prismaJson";

export interface StoredChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface StoredChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachments?: StoredChatAttachment[];
  createdAt?: string;
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

const MAX_MESSAGES = 120;

export function sanitizeMessages(raw: unknown): StoredChatMessage[] {
  if (!Array.isArray(raw)) return [];

  const out: StoredChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const role = row.role;
    const content = typeof row.content === "string" ? row.content : "";
    if (role !== "user" && role !== "assistant") continue;

    const hasAttachments = Array.isArray(row.attachments) && row.attachments.length > 0;
    if (!content.trim() && !hasAttachments) continue;

    const attachments = sanitizeAttachments(row.attachments);
    out.push({
      id: typeof row.id === "string" ? row.id : undefined,
      role,
      content,
      attachments: attachments.length ? attachments : undefined,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
    });
  }

  return ensureMessageIds(out.slice(-MAX_MESSAGES));
}

function sanitizeAttachments(raw: unknown): StoredChatAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredChatAttachment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name : "";
    const mimeType = typeof row.mimeType === "string" ? row.mimeType : "";
    const id = typeof row.id === "string" ? row.id : `att-${out.length}`;
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

export function ensureMessageIds(messages: StoredChatMessage[]): StoredChatMessage[] {
  return messages.map((m, i) => ({
    ...m,
    id: m.id ?? `msg-${i}-${m.role}`,
  }));
}

export function deriveConversationTitle(messages: StoredChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser?.content.trim()) return "New chat";
  let text = firstUser.content.trim();
  if (text.startsWith("[Attached:")) text = "File attachment";
  return text.length > 52 ? `${text.slice(0, 52)}…` : text;
}

export function conversationPreview(messages: StoredChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.content.trim());
  if (!last) return "No messages yet";
  const text = last.content.trim();
  return text.length > 64 ? `${text.slice(0, 64)}…` : text;
}

// HTTP helper
async function fetchWithToken(path: string, getToken: () => Promise<string | null>, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (token === null) {
    throw new Error("Unable to get authentication token");
  }
  return fetch(path, {
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
    ...options,
  });
}

// Exported functions
export async function listConversations(
  getToken: () => Promise<string | null>,
  userId: string
): Promise<ChatConversationSummary[]> {
  const res = await fetchWithToken(`/api/chat/conversation`, getToken);
  if (!res.ok) {
    throw new Error(`Failed to list conversations: ${res.status}`);
  }
  const data = await res.json();
  return data.conversations.map((conv: any) => ({
    id: conv.id,
    title: conv.title,
    preview: conv.preview,
    updatedAt: conv.updatedAt,
  }));
}

export async function loadConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string
): Promise<{ id: string; messages: StoredChatMessage[] } | null> {
  const res = await fetchWithToken(`/api/chat/conversation?id=${conversationId}`, getToken);
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error(`Failed to load conversation: ${res.status}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    messages: sanitizeMessages(data.messages),
  };
}

export async function saveConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
  messages: StoredChatMessage[]
): Promise<void> {
  const res = await fetchWithToken(`/api/chat/conversation`, getToken, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: conversationId,
      messages: toInputJson(messages),
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to save conversation: ${res.status}`);
  }
}

export async function clearConversationMessages(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string
): Promise<void> {
  await saveConversation(getToken, userId, conversationId, []);
}

export async function createConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  title: string = "New chat"
): Promise<{ id: string }> {
  const res = await fetchWithToken(`/api/chat/conversation`, getToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create conversation: ${res.status}`);
  }
  const data = await res.json();
  return { id: data.id };
}

export async function deleteConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string
): Promise<void> {
  const res = await fetchWithToken(`/api/chat/conversation?id=${conversationId}`, getToken, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete conversation: ${res.status}`);
  }
}

export async function ensureActiveConversation(
  getToken: () => Promise<string | null>,
  userId: string
): Promise<{ id: string; messages: StoredChatMessage[] }> {
  const conversations = await listConversations(getToken, userId);
  if (conversations.length > 0) {
    const firstId = conversations[0].id;
    const loaded = await loadConversation(getToken, userId, firstId);
    if (loaded !== null) {
      return loaded;
    }
    // If loading fails, fall through to create a new one.
  }
  const created = await createConversation(getToken, userId);
  const loaded = await loadConversation(getToken, userId, created.id);
  if (loaded === null) {
    throw new Error("Failed to load newly created conversation");
  }
  return loaded;
}

// ChatHistoryError class
export class ChatHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatHistoryError";
  }
}
