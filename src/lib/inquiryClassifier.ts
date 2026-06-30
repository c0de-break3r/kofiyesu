type InquiryType = "collaboration" | "security" | "job" | "general";

export const WANTS_OBED_PATTERN =
  /talk to (obed|kofi|you)|speak to (obed|kofi|a )?(human|person|real person)|contact (obed|kofi)|reach (obed|kofi)|message (obed|kofi)|get (obed|kofi)|connect with (obed|kofi)/i;

export const ESCALATION_PATTERN =
  /speak to (a )?human|talk to kofi|talk to obed|contact kofi|contact obed|real person|urgent|escalat|admin|pass (this )?on|human support|email (me|kofi|obed)|send (an )?email|notify kofi|notify obed/i;

export const INFORMATIONAL_PATTERN =
  /^(what|which|who|how|tell me|can you explain|do you|does (he|obed|kofi)|describe|list|show me|any examples?)\b|what (can|could|does|do|kind|type|sort|websites?|apps?|projects?|services?)|what (is|are) (your|his|obed|kofi)|who (is|are) (obed|kofi|you|he)|about (obed|kofi|your|his) (skills|work|experience|projects|services|stack)|your (skills|stack|experience|projects|services)|how (does|do) (you|he|obed|kofi) (work|build)|what do you (build|make|offer|specialize)|what websites? can|what (apps?|products?) can|portfolio|résumé|resume|cv\b/i;

export const PROJECT_BUILD_REQUEST_PATTERN =
  /(?:want|need|would like|ask(?:ing)?)\s+(?:obed|kofi|you|him)\s+to\s+(?:build|create|develop|make)|(?:build|create|develop|make)\s+(?:me|us|my|our|a|an)\s+(?:premium\s+)?(?:ecommerce|website|web\s*app|mobile\s*app|app|platform|store|saas|product)|(?:premium|custom|full[- ]?stack)\s+(?:ecommerce|website|app|platform|store)/i;

export const SIMPLE_PRICING_QUESTION_PATTERN =
  /^(how much|what(?:'s| is) the (?:price|cost)|price for|cost of|how do i pay for)\b.*\b(discovery|session|package|audit|kickoff)\b/i;

export const READY_TO_PAY_PATTERN =
  /ready to pay|proceed with payment|pay (the )?(deposit|total|invoice)|let'?s pay|start payment|pay now/i;

export const BUSINESS_INTENT_PATTERN =
  /i (want|need|would like|'d like) to (hire|work|collaborate|start|build|get)|i need (a|an|help|someone)|looking for (a |an )?(developer|engineer|freelancer|pentester|consultant)|my (project|startup|company|business|app|website|product)|we (need|want|are looking)|get (a )?quote|send (me )?a (quote|proposal)|work together on|start a project|budget (is|of|around)|timeline (is|of|by)|deadline (is|by)|ready to (pay|hire|start)|can you build (my|a|an|our)|build (my|our|a|an) (website|app|product)|pentest (my|our|this)|audit (my|our|this)|hire (you|obed|kofi|him)/i;

export function isInformationalQuestion(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();

  if (BUSINESS_INTENT_PATTERN.test(lower)) return false;
  if (INFORMATIONAL_PATTERN.test(lower)) return true;

  if (/what .{0,40}(build|make|create|develop)/.test(lower) && !/\b(my|our|i need)\b/.test(lower)) {
    return true;
  }

  return false;
}

export function hasBusinessIntent(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return BUSINESS_INTENT_PATTERN.test(trimmed.toLowerCase());
}

export function wantsToTalkToObed(text: string): boolean {
  return WANTS_OBED_PATTERN.test(text.trim());
}

export function isProjectBuildRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return PROJECT_BUILD_REQUEST_PATTERN.test(trimmed) || hasBusinessIntent(trimmed);
}

export function isSimplePricingQuestion(text: string): boolean {
  return SIMPLE_PRICING_QUESTION_PATTERN.test(text.trim());
}

export function hasEnoughContextForQuote(allUserText: string): boolean {
  const lower = allUserText.toLowerCase();
  const hasDeliverable =
    /ecommerce|website|web\s*app|mobile\s*app|saas|platform|store|pentest|api|backend/.test(lower);
  const detailSignals = [
    /\b(premium|custom|payment|checkout|cart|inventory|admin|dashboard)\b/,
    /\b(timeline|deadline|weeks?|months?|asap|launch)\b/,
    /\b(budget|gh[c₵]?|\d+\s*k|\d+\s*gh)\b/,
    /\b(feature|integration|clerk|auth|mobile)\b/,
    /\b(products?|sku|vendor|delivery)\b/,
  ];
  const detailCount = detailSignals.filter((p) => p.test(lower)).length;
  return hasDeliverable && (detailCount >= 2 || lower.length > 140);
}

export const PORTFOLIO_SERVICES_BLURB =
  "Obed builds full-stack web and mobile apps (React, Next.js, React Native, TypeScript), secure REST APIs (Node.js, Express, PostgreSQL/Neon), ecommerce and SaaS products, auth with Clerk, and security-focused work — pentesting workflows, API hardening, and recon automation. Recent work includes KhelianCart (grocery ecommerce in Ghana) and security tooling for bug bounty recon.";

/**
 * Determine whether a chat turn should be queued for admin follow‑up.
 */
export function shouldQueueInquiry(
  inquiryType: InquiryType,
  result: Pick<
    import("@/lib/contactAi").RoutingResult,
    "escalateToAdmin" | "showEmailCta" | "confidence" | "queueInquiry" | "projectQuote"
  >,
  userMessage: string,
): boolean {
  if (result.projectQuote) return false;
  return result.queueInquiry || result.escalateToAdmin;
}
