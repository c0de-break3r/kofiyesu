import type { VercelRequest } from "@vercel/node";

export function firstPathSegment(req: VercelRequest): string | undefined {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw[0];
  return typeof raw === "string" ? raw : undefined;
}
