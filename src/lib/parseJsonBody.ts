import type { VercelRequest } from "@vercel/node";

export async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function parseJsonBody(req: VercelRequest): Promise<void> {
  if (req.method !== "POST" && req.method !== "PATCH" && req.method !== "PUT") return;
  const raw = await readRawBody(req);
  if (!raw) {
    req.body = {};
    return;
  }
  try {
    req.body = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON body");
  }
}
