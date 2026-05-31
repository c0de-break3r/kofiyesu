import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firstPathSegment } from "../lib/routePath.js";
import initializeHandler from "../lib/routes/paystack/initialize.js";
import verifyHandler from "../lib/routes/paystack/verify.js";
import webhookHandler from "../lib/routes/paystack/webhook.js";

const routes = {
  initialize: initializeHandler,
  verify: verifyHandler,
  webhook: webhookHandler,
} as const;

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segment = firstPathSegment(req);
  const route = segment ? routes[segment as keyof typeof routes] : undefined;
  if (!route) {
    return res.status(404).json({ error: "Not found" });
  }

  if (segment === "webhook") {
    return webhookHandler(req, res);
  }

  if (req.method === "POST") {
    const raw = await readRawBody(req);
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  return route(req, res);
}
