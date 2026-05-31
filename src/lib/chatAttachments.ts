export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Raw base64 without data-URL prefix (for API). */
  base64: string;
  /** Object URL or data URL for UI preview. */
  previewUrl: string;
}

export const CHAT_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,text/csv,text/markdown";

export const CHAT_MAX_FILE_BYTES = 4 * 1024 * 1024;
export const CHAT_MAX_FILES = 4;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
]);

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isPdfMime(mime: string): boolean {
  return mime === "application/pdf";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readFileAsAttachment(file: File): Promise<ChatAttachment> {
  if (file.size > CHAT_MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large (max ${formatFileSize(CHAT_MAX_FILE_BYTES)}).`);
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new Error(`"${file.name}" type is not supported. Use images, PDF, or text files.`);
  }

  const base64 = await readBase64(file);
  const previewUrl = isImageMime(mimeType)
    ? `data:${mimeType};base64,${base64}`
    : URL.createObjectURL(file);

  return {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType,
    size: file.size,
    base64,
    previewUrl,
  };
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

export function revokeAttachmentPreview(attachment: ChatAttachment) {
  if (!isImageMime(attachment.mimeType) && attachment.previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
}

export function attachmentsToApiPayload(attachments: ChatAttachment[]) {
  return attachments.map((a) => ({
    name: a.name,
    mimeType: a.mimeType,
    base64: a.base64,
  }));
}

export function attachmentSummary(attachments: ChatAttachment[]): string {
  if (!attachments.length) return "";
  const names = attachments.map((a) => a.name).join(", ");
  return `[Attached: ${names}]`;
}
