import type { VercelRequest, VercelResponse } from "@vercel/node";
import inquiriesHandler from "../server/routes/inquiries.js";
import paymentsHandler from "../server/routes/payments.js";
import chatHandler from "../server/routes/chat/main.js";
import conversationHandler from "../server/routes/chat/conversation.js";
import siteAboutHandler from "../server/routes/site/about.js";
import siteFeaturesHandler from "../server/routes/site/features.js";
import siteProjectsHandler from "../server/routes/site/projects.js";
import sitePricingHandler from "../server/routes/site/pricing.js";
import adminAboutHandler from "../server/routes/admin/about.js";
import adminFeaturesHandler from "../server/routes/admin/features.js";
import adminProjectsHandler from "../server/routes/admin/projects.js";
import adminInquiriesHandler from "../server/routes/admin/inquiries.js";
import adminPaymentsHandler from "../server/routes/admin/payments.js";
import adminPricingHandler from "../server/routes/admin/pricing.js";
import paystackInitializeHandler from "../server/routes/paystack/initialize.js";
import paystackVerifyHandler from "../server/routes/paystack/verify.js";
import paystackWebhookHandler from "../server/routes/paystack/webhook.js";

export const config = {
  api: { bodyParser: false },
};

const siteRoutes = {
  about: siteAboutHandler,
  features: siteFeaturesHandler,
  projects: siteProjectsHandler,
  pricing: sitePricingHandler,
} as const;

const adminRoutes = {
  about: adminAboutHandler,
  features: adminFeaturesHandler,
  projects: adminProjectsHandler,
  inquiries: adminInquiriesHandler,
  payments: adminPaymentsHandler,
  pricing: adminPricingHandler,
} as const;

const paystackRoutes = {
  initialize: paystackInitializeHandler,
  verify: paystackVerifyHandler,
  webhook: paystackWebhookHandler,
} as const;

function pathSegments(req: VercelRequest): string[] {
  const raw = req.query.path;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string" && raw.length > 0) {
    return raw.split("/").filter(Boolean);
  }

  const pathname = (req.url ?? "").split("?")[0] ?? "";
  return pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
}

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function withJsonBody(req: VercelRequest): Promise<void> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const [root, sub] = pathSegments(req);

  if (!root) {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    if (root === "inquiries") {
      await withJsonBody(req);
      return inquiriesHandler(req, res);
    }

    if (root === "payments") {
      await withJsonBody(req);
      return paymentsHandler(req, res);
    }

    if (root === "chat") {
      if (!sub) {
        await withJsonBody(req);
        return chatHandler(req, res);
      }
      if (sub === "conversation") {
        await withJsonBody(req);
        return conversationHandler(req, res);
      }
      return res.status(404).json({ error: "Not found" });
    }

    if (root === "site" && sub) {
      const route = siteRoutes[sub as keyof typeof siteRoutes];
      if (!route) return res.status(404).json({ error: "Not found" });
      return route(req, res);
    }

    if (root === "admin" && sub) {
      await withJsonBody(req);
      const route = adminRoutes[sub as keyof typeof adminRoutes];
      if (!route) return res.status(404).json({ error: "Not found" });
      return route(req, res);
    }

    if (root === "paystack" && sub) {
      if (sub === "webhook") {
        return paystackWebhookHandler(req, res);
      }
      await withJsonBody(req);
      const route = paystackRoutes[sub as keyof typeof paystackRoutes];
      if (!route) return res.status(404).json({ error: "Not found" });
      return route(req, res);
    }

    return res.status(404).json({ error: "Not found" });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid JSON body") {
      return res.status(400).json({ error: err.message });
    }
    console.error("[api]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
