import type { InquiryType } from "@/content/contact";
import type { RoutingResult } from "@/lib/contactAi";
import { shouldQueueInquiry as classifyQueue } from "@/lib/inquiryClassifier";

/** True when a chat turn should create an admin inquiry (not casual Q&A). */
export function shouldQueueInquiry(
  inquiryType: InquiryType,
  result: Pick<
    RoutingResult,
    "escalateToAdmin" | "showEmailCta" | "confidence" | "queueInquiry" | "projectQuote"
  >,
  userMessage: string,
): boolean {
  if (result.projectQuote) return false;

  return classifyQueue(inquiryType, result, userMessage);
}