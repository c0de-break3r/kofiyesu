import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireSignedInUserId } from "./lib/clerkAuth.js";
import { isDatabaseConfigured, prisma } from "./lib/prisma.js";
import { notifyAdminUrgentInquiry } from "./lib/notifyAdmin.js";
import { toInputJson } from "./lib/prismaJson.js";

type InquiryType = "collaboration" | "security" | "job" | "general";

interface InquiryBody {
  inquiryType?: InquiryType;
  message?: string;
  needsAdmin?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  intake?: Record<string, unknown> | null;
}

const validTypes = new Set<InquiryType>(["collaboration", "security", "job", "general"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = await requireSignedInUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Sign in required" });
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({ error: "Database not configured" });
  }

  const body = (req.body ?? {}) as InquiryBody;
  const inquiryType = body.inquiryType;
  const message = body.message?.trim();

  if (!inquiryType || !validTypes.has(inquiryType)) {
    return res.status(400).json({ error: "Invalid inquiry type" });
  }

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  const needsAdmin = Boolean(body.needsAdmin);

  const row = await prisma.contactInquiry.create({
    data: {
      inquiryType,
      message,
      needsAdmin,
      userEmail: body.userEmail ?? null,
      userId,
      userName: body.userName ?? null,
      intake: toInputJson(body.intake),
    },
  });

  let notified = false;
  if (needsAdmin) {
    notified = await notifyAdminUrgentInquiry({
      inquiryType,
      message,
      userEmail: body.userEmail,
      userName: body.userName,
      intake: body.intake,
    });
  }

  return res.status(200).json({ id: row.id, notified });
}
