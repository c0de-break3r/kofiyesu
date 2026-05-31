import type { InquiryType } from "@/content/contact";
import type { RoutingResult } from "@/lib/contactAi";

const BUSINESS_TYPES = new Set<InquiryType>(["collaboration", "security", "job"]);

/** True when a chat turn should create an admin inquiry (not casual Q&A). */
export function shouldQueueInquiry(
  inquiryType: InquiryType,
  result: Pick<RoutingResult, "escalateToAdmin" | "showEmailCta" | "confidence">,
): boolean {
  const urgent = Boolean(result.escalateToAdmin);

  if (inquiryType === "general") {
    return urgent;
  }

  if (!BUSINESS_TYPES.has(inquiryType)) {
    return false;
  }

  return Boolean(urgent || result.showEmailCta || result.confidence === "high");
}
