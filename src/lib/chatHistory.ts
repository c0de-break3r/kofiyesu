import type { ChatMessage } from "@/lib/contactAi";

const STORAGE_PREFIX = "kofiyesu-chat-v2";
const MIGRATION_FLAG_PREFIX = "kofiyesu-chat-cloud-migrated";
const MAX_MESSAGES = 120;

export class ChatHistoryError extends Error {
  status?: number;
  /** Expected client/network issues — do not report to error monitoring. */
  readonly reportToMonitoring: boolean;

  constructor(message: string, status?: number, options?: { reportToMonitoring?: boolean }) {
    super(message);
    this.name = "ChatHistoryError";
    this.status = status;
    this.reportToMonitoring =
      options?.reportToMonitoring ?? (status !== 0 && status !== 401);
  }
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  createdAt: string;
  messageCount: number;
}

interface LocalStore {
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

function migrationFlagKey(userId: string) {
  return `${MIGRATION_FLAG_PREFIX}:${userId}`;
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
  return ensureMessageIds(messages.slice(-MAX_MESSAGES)).map((m) => ({
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

export function parseMessages(raw: unknown): ChatMessage[] {
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
    if (!raw) return { conversations: [] };
    const parsed = JSON.parse(raw) as LocalStore & { activeId?: string };
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
    };
  } catch {
    return { conversations: [] };
  }
}

function clearLocalStore(userId: string) {
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* ignore */
  }
}

function markMigrationDone(userId: string) {
  try {
    localStorage.setItem(migrationFlagKey(userId), "1");
  } catch {
    /* ignore */
  }
}

function hasMigrationDone(userId: string): boolean {
  try {
    return localStorage.getItem(migrationFlagKey(userId)) === "1";
  } catch {
    return false;
  }
}

const CHAT_API = "/api/chat/conversation";

function chatApiUrl(path = CHAT_API): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

async function resolveAuthToken(getToken: () => Promise<string | null>): Promise<string> {
  const delays = [0, 150, 300, 500, 800, 1200];
  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
    try {
      const token = await getToken();
      if (token) return token;
    } catch {
      /* Clerk may still be hydrating the session */
    }
  }
  throw new ChatHistoryError("Sign in required", 401, { reportToMonitoring: false });
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

async function fetchChatApi(
  token: string,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  };

  let lastNetworkError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetch(url, requestInit);
    } catch (err) {
      lastNetworkError = err;
      if (isAbortError(err)) {
        throw new ChatHistoryError("Chat sync was cancelled.", 0, { reportToMonitoring: false });
      }
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  }

  console.warn("[chatHistory] network error", lastNetworkError);
  throw new ChatHistoryError(
    "Could not reach chat sync. Check your connection and try again.",
    0,
    { reportToMonitoring: false },
  );
}

async function authFetch(
  getToken: () => Promise<string | null>,
  init: RequestInit & { query?: Record<string, string> },
): Promise<Response> {
  const token = await resolveAuthToken(getToken);

  const qs = init.query ? `?${new URLSearchParams(init.query).toString()}` : "";
  const { query: _q, ...rest } = init;
  const url = `${chatApiUrl()}${qs}`;

  let res = await fetchChatApi(token, url, rest);

  if (res.status >= 500) {
    await new Promise((r) => setTimeout(r, 400));
    res = await fetchChatApi(token, url, rest);
  }

  if (res.status === 503) {
    throw new ChatHistoryError(
      "Chat history is temporarily unavailable. Try again in a moment.",
      503,
      { reportToMonitoring: true },
    );
  }

  return res;
}

async function parseApiError(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) message = data.error;
  } catch {
    /* ignore */
  }
  throw new ChatHistoryError(message, res.status, {
    reportToMonitoring: res.status >= 500,
  });
}

/** One-time upload of legacy browser-only chats after sign-in. */
async function migrateLocalConversationsToCloud(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<void> {
  if (hasMigrationDone(userId)) return;

  const store = readLocalStore(userId);
  if (store.conversations.length === 0) {
    markMigrationDone(userId);
    return;
  }

  const listRes = await authFetch(getToken, { method: "GET" });
  if (!listRes.ok) {
    await parseApiError(listRes, "Could not sync chat history");
  }

  const listData = (await listRes.json()) as { conversations?: ChatConversationSummary[] };
  if ((listData.conversations?.length ?? 0) > 0) {
    clearLocalStore(userId);
    markMigrationDone(userId);
    return;
  }

  const sorted = [...store.conversations].sort((a, b) =>
    a.updatedAt.localeCompare(b.updatedAt),
  );

  for (const conv of sorted) {
    const messages = serializeMessagesForStorage(parseMessages(conv.messages));
    const title = conv.title?.trim() || deriveTitle(messages);

    const createRes = await authFetch(getToken, {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    if (!createRes.ok) {
      await parseApiError(createRes, "Could not migrate a conversation");
    }

    const created = (await createRes.json()) as { id: string };
    const saveRes = await authFetch(getToken, {
      method: "PUT",
      body: JSON.stringify({ id: created.id, messages, title }),
    });
    if (!saveRes.ok) {
      await parseApiError(saveRes, "Could not migrate messages");
    }
  }

  clearLocalStore(userId);
  markMigrationDone(userId);
}

export async function listConversations(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<ChatConversationSummary[]> {
  await migrateLocalConversationsToCloud(getToken, userId);

  const res = await authFetch(getToken, { method: "GET" });
  if (!res.ok) {
    await parseApiError(res, "Could not load chat history");
  }

  const data = (await res.json()) as { conversations?: ChatConversationSummary[] };
  return data.conversations ?? [];
}

export async function loadConversation(
  getToken: () => Promise<string | null>,
  _userId: string,
  conversationId: string,
): Promise<{ id: string; title: string; messages: ChatMessage[] } | null> {
  if (conversationId.startsWith("local-")) return null;

  const res = await authFetch(getToken, {
    method: "GET",
    query: { id: conversationId },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    await parseApiError(res, "Could not load conversation");
  }

  const data = (await res.json()) as {
    id: string;
    title: string;
    messages?: unknown;
  };

  return {
    id: data.id,
    title: data.title,
    messages: parseMessages(data.messages),
  };
}

export async function createConversation(
  getToken: () => Promise<string | null>,
  _userId: string,
  title = "New chat",
): Promise<{ id: string; title: string }> {
  const res = await authFetch(getToken, {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    await parseApiError(res, "Could not create conversation");
  }

  const data = (await res.json()) as { id: string; title: string };
  return { id: data.id, title: data.title };
}

export async function saveConversation(
  getToken: () => Promise<string | null>,
  _userId: string,
  conversationId: string,
  messages: ChatMessage[],
  title?: string,
): Promise<void> {
  if (conversationId.startsWith("local-")) {
    throw new ChatHistoryError("Invalid conversation. Start a new chat.", undefined, {
      reportToMonitoring: false,
    });
  }

  const payload = serializeMessagesForStorage(messages);
  const resolvedTitle = title?.trim() || deriveTitle(payload);

  const res = await authFetch(getToken, {
    method: "PUT",
    body: JSON.stringify({ id: conversationId, messages: payload, title: resolvedTitle }),
  });

  if (!res.ok) {
    await parseApiError(res, "Could not save chat");
  }
}

export async function deleteConversation(
  getToken: () => Promise<string | null>,
  _userId: string,
  conversationId: string,
): Promise<void> {
  if (conversationId.startsWith("local-")) return;

  const res = await authFetch(getToken, {
    method: "DELETE",
    query: { id: conversationId },
  });

  if (res.status === 404) return;
  if (!res.ok) {
    await parseApiError(res, "Could not delete conversation");
  }
}

export async function clearConversationMessages(
  getToken: () => Promise<string | null>,
  userId: string,
  conversationId: string,
): Promise<void> {
  await saveConversation(getToken, userId, conversationId, [], "New chat");
}

/** Load the most recent cloud conversation or create one. */
export async function ensureActiveConversation(
  getToken: () => Promise<string | null>,
  userId: string,
): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
  const list = await listConversations(getToken, userId);
  if (list.length > 0) {
    const loaded = await loadConversation(getToken, userId, list[0].id);
    if (loaded) {
      return { ...loaded, messages: parseMessages(loaded.messages) };
    }
  }

  const created = await createConversation(getToken, userId);
  return { id: created.id, title: created.title, messages: [] };
}
