export interface StoredChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
}

export interface StoredChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: StoredChatAttachment[];
  createdAt?: string;
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
      role,
      content,
      attachments: attachments.length ? attachments : undefined,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : undefined,
    });
  }

  return out.slice(-MAX_MESSAGES);
}

function sanitizeAttachments(raw: unknown): StoredChatAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredChatAttachment[] = [];
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
