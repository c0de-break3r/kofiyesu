import type { ChatMessage } from "@/lib/contactAi";

const STORAGE_PREFIX = "kofiyesu-chat-v2";
const MAX_LOCAL_MESSAGES = 120;

export interface ChatConversationSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
}

interface LocalStore {
  activeId: string | null;
  conversations: Array<{
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: string;
    createdAt: string;
  }>;
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function ensureMessageIds(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m, i) => ({
    ...m,
    id: m.id ?? `msg-${i}-${m.role}-${Date.now()}`,
  }));
}

export function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser?.content.trim()) return "New chat";
  let text = firstUser.content.trim();
  if (text.startsWith("[Attached:")) text = "File attachment";
  return text.length > 52 ? `${text.slice(0, 52)}…` : text;
}

export function serializeMessagesForStorage(messages: ChatMessage[]): ChatMessage[] {
  return ensureMessageIds(messages.slice(-MAX_LOCAL_MESSAGES)).map((m) => ({
    id: m.id,
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

function parseMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.role !== "user" && row.role !== "assistant") continue;
    const content = typeof row.content === "string" ? row.content : "";
    const attachments = parseAttachments(row.attachments);
    const hasAttachments = attachments && attachments.length > 0;
    if (!content.trim() && !hasAttachments) continue;
    out.push({
      id: typeof row.id === "string" ? row.id : undefined,
      role: row.role,
      content,
      attachments: hasAttachments ? attachments : undefined,
    });
  }
  return ensureMessageIds(out);
}

function parseAttachments(raw: unknown): ChatMessage["attachments"] {
  if (!Array.isArray(raw)) return undefined;
  const out: NonNullable<ChatMessage["attachments"]> = [];
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
  return out.length ? out : undefined;
}

function readLocalStore(userId: string): LocalStore {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { activeId: null, conversations: [] };
    const parsed = JSON.parse(raw) as LocalStore;
    return {
      activeId: parsed.activeId ?? null,
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
    };
  } catch {
    return { activeId: null, conversations: [] };
  }
}

function writeLocalStore(userId: string, store: LocalStore) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function newLocalId() {
  return `local-${crypto.randomUUID()}`;
}

async function authFetch(
  getToken: () => Promise<string | null>,
  init: RequestInit & { query?: Record<string, string> },
): Promise<Response | null> {
  const token = await getToken();
  if (!token) return null;

  const qs = init.query
    ? `?${new URLSearchParams(init.query).toString()}`
    : "";
  const { query: _q, ...rest } = init;

  return fetch(`/api/chat/conversation${qs}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
  });
}

export async function listConversations(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<ChatConversationSummary[]> {
  try {
    const res = await authFetch(getToken, { method: "GET" });
    if (res?.ok) {
      const data = (await res.json()) as { conversations?: ChatConversationSummary[] };
      return data.conversations ?? [];
    }
  } catch {
    /* local */
  }

  const store = readLocalStore(userId);
  return store.conversations
    .map((c) => ({
      id: c.id,
      title: c.title,
      preview:
        [...c.messages].reverse().find((m) => m.content.trim())?.content.slice(0, 64) ?? "No messages yet",
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
      messageCount: c.messages.length,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function loadConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
): Promise<{ id: string; title: string; messages: ChatMessage[] } | null> {
  try {
    const res = await authFetch(getToken, {
      method: "GET",
      query: { id: conversationId },
    });
    if (res?.ok) {
      const data = (await res.json()) as {
        id: string;
        title: string;
        messages?: unknown;
      };
      const messages = parseMessages(data.messages);
      return { id: data.id, title: data.title, messages };
    }
  } catch {
    /* local */
  }

  const store = readLocalStore(userId);
  const found = store.conversations.find((c) => c.id === conversationId);
  if (!found) return null;
  return { id: found.id, title: found.title, messages: parseMessages(found.messages) };
}

export async function createConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  title = "New chat",
): Promise<{ id: string; title: string }> {
  try {
    const res = await authFetch(getToken, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    if (res?.ok) {
      const data = (await res.json()) as { id: string; title: string };
      return data;
    }
  } catch {
    /* local */
  }

  const id = newLocalId();
  const now = new Date().toISOString();
  const store = readLocalStore(userId);
  store.conversations.unshift({
    id,
    title,
    messages: [],
    updatedAt: now,
    createdAt: now,
  });
  store.activeId = id;
  writeLocalStore(userId, store);
  return { id, title };
}

export async function saveConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
  messages: ChatMessage[],
  title?: string,
): Promise<void> {
  const payload = serializeMessagesForStorage(messages);
  const resolvedTitle = title?.trim() || deriveTitle(payload);
  const now = new Date().toISOString();

  const store = readLocalStore(userId);
  const idx = store.conversations.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    store.conversations[idx] = {
      ...store.conversations[idx],
      title: resolvedTitle,
      messages: payload,
      updatedAt: now,
    };
  } else {
    store.conversations.unshift({
      id: conversationId,
      title: resolvedTitle,
      messages: payload,
      updatedAt: now,
      createdAt: now,
    });
  }
  store.activeId = conversationId;
  writeLocalStore(userId, store);

  try {
    await authFetch(getToken, {
      method: "PUT",
      body: JSON.stringify({ id: conversationId, messages: payload, title: resolvedTitle }),
    });
  } catch {
    /* local only */
  }
}

export async function deleteConversation(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
): Promise<void> {
  const store = readLocalStore(userId);
  store.conversations = store.conversations.filter((c) => c.id !== conversationId);
  if (store.activeId === conversationId) {
    store.activeId = store.conversations[0]?.id ?? null;
  }
  writeLocalStore(userId, store);

  try {
    await authFetch(getToken, {
      method: "DELETE",
      query: { id: conversationId },
    });
  } catch {
    /* ignore */
  }
}

export async function clearConversationMessages(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
): Promise<void> {
  await saveConversation(getToken, userId, conversationId, [], "New chat");
}

/** Bootstrap: pick latest conversation or create one. */
export async function ensureActiveConversation(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
  const list = await listConversations(getToken, userId);
  if (list.length > 0) {
    const loaded = await loadConversation(getToken, userId, list[0].id);
    if (loaded) return { ...loaded, messages: parseMessages(loaded.messages) };
  }

  const created = await createConversation(getToken, userId);
  return { id: created.id, title: created.title, messages: [] };
}
