import type { InquiryType } from "@/content/contact";
import type { RoutingResult } from "@/lib/contactAi";
import { shouldQueueInquiry as classifyQueue } from "@/lib/inquiryClassifier";

/** True when a chat turn should create an admin inquiry (not casual Q&A). */
export function shouldQueueInquiry(
  inquiryType: InquiryType,
  result: Pick<RoutingResult, "escalateToAdmin" | "showEmailCta" | "confidence" | "queueInquiry">,
  userMessage: string,
): boolean {
  return classifyQueue({
    inquiryType,
    userMessage,
    escalateToAdmin: result.escalateToAdmin,
    showEmailCta: result.showEmailCta,
    confidence: result.confidence,
    queueInquiry: result.queueInquiry,
  });
}
