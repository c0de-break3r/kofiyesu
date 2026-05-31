import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdminUserId } from "../../adminAuth.js";
import { appendAdminReplyToChat } from "../../publishAdminReply.js";
import { isDatabaseConfigured, prisma } from "../../prisma.js";
import { inquiryToApi } from "../../serializers.js";

const BUSINESS_TYPES = ["collaboration", "security", "job"] as const;
const VALID_STATUS = new Set(["new", "reviewed", "replied", "archived"]);

const listWhere = () => ({
  OR: [{ inquiryType: { in: [...BUSINESS_TYPES] } }, { needsAdmin: true }],
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const adminId = await requireAdminUserId(req);
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!isDatabaseConfigured()) {
      return res.status(503).json({ error: "Database not configured" });
    }

    if (req.method === "GET") {
      const rows = await prisma.contactInquiry.findMany({
        where: listWhere(),
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      return res.status(200).json({ inquiries: rows.map(inquiryToApi) });
    }

    if (req.method === "PATCH") {
      const body = req.body as {
        id?: string;
        status?: string;
        admin_notes?: string | null;
        reply_draft?: string | null;
        mark_reviewed?: boolean;
        publish_reply?: boolean;
      };

      if (!body.id) {
        return res.status(400).json({ error: "Inquiry id required" });
      }

      const existing = await prisma.contactInquiry.findFirst({
        where: { AND: [{ id: body.id }, listWhere()] },
      });
      if (!existing) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      const status =
        body.status && VALID_STATUS.has(body.status) ? body.status : existing.status;
      const reviewedAt =
        body.mark_reviewed || status === "reviewed" || status === "replied"
          ? existing.reviewedAt ?? new Date()
          : existing.reviewedAt;

      const replyDraft =
        body.reply_draft !== undefined ? body.reply_draft : existing.replyDraft;
      const publishReply = Boolean(body.publish_reply);
      const replyText = publishReply ? replyDraft?.trim() : "";

      if (publishReply && !replyText) {
        return res.status(400).json({ error: "Reply text required" });
      }

      let adminReply = existing.adminReply;
      let adminReplyAt = existing.adminReplyAt;
      let nextStatus = status;

      if (publishReply && replyText) {
        adminReply = replyText;
        adminReplyAt = new Date();
        nextStatus = "replied";

        if (existing.userId) {
          const published = await appendAdminReplyToChat({
            userId: existing.userId,
            conversationId: existing.conversationId,
            replyText,
          });
          if (!published.ok) {
            console.warn("[admin/inquiries] Could not append reply to chat", existing.id);
          }
        }
      }

      const row = await prisma.contactInquiry.update({
        where: { id: body.id },
        data: {
          status: nextStatus,
          adminNotes: body.admin_notes !== undefined ? body.admin_notes : existing.adminNotes,
          replyDraft,
          adminReply,
          adminReplyAt,
          reviewedAt:
            publishReply || body.mark_reviewed || nextStatus === "reviewed" || nextStatus === "replied"
              ? existing.reviewedAt ?? new Date()
              : existing.reviewedAt,
        },
      });

      return res.status(200).json({ inquiry: inquiryToApi(row) });
    }

    if (req.method === "DELETE") {
      const id = typeof req.query.id === "string" ? req.query.id : undefined;
      if (!id) {
        return res.status(400).json({ error: "Inquiry id required" });
      }

      const deleted = await prisma.contactInquiry.deleteMany({
        where: { AND: [{ id }, listWhere()] },
      });

      if (deleted.count === 0) {
        return res.status(404).json({ error: "Inquiry not found" });
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[admin/inquiries] unhandled", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
