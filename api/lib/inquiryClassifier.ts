type InquiryType = "collaboration" | "security" | "job" | "general";

export const WANTS_OBED_PATTERN =
  /talk to (obed|kofi|you)|speak to (obed|kofi|a )?(human|person|real person)|contact (obed|kofi)|reach (obed|kofi)|message (obed|kofi)|get (obed|kofi)|connect with (obed|kofi)/i;

export const ESCALATION_PATTERN =
  /speak to (a )?human|talk to kofi|talk to obed|contact kofi|contact obed|real person|urgent|escalat|admin|pass (this )?on|human support|email (me|kofi|obed)|send (an )?email|notify kofi|notify obed/i;

export const INFORMATIONAL_PATTERN =
  /^(what|which|who|how|tell me|can you explain|do you|does (he|obed|kofi)|describe|list|show me|any examples?)\b|what (can|could|does|do|kind|type|sort|websites?|apps?|projects?|services?)|what (is|are) (your|his|obed|kofi)|who (is|are) (obed|kofi|you|he)|about (obed|kofi|your|his) (skills|work|experience|projects|services|stack)|your (skills|stack|experience|projects|services)|how (does|do) (you|he|obed|kofi) (work|build)|what do you (build|make|offer|specialize)|what websites? can|what (apps?|products?) can|portfolio|résumé|resume|cv\b/i;

export const PAYMENT_OR_NEXT_STEP_PATTERN =
  /pay|payment|price|pricing|how much|cost|deposit|package|kickoff|discovery session|paystack|mobile money|card payment|ready to (pay|start|proceed)|next step|get started|proceed with|book (a |the )?session/i;

export const PROJECT_SPECS_PATTERN =
  /budget|quote|timeline|deadline|scope|specification|requirements|feature list|milestone|deliverable|stack|platform|users?|integration/i;

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

export function shouldShowPaymentOptions(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (PAYMENT_OR_NEXT_STEP_PATTERN.test(lower)) return true;
  if (hasBusinessIntent(trimmed) && PROJECT_SPECS_PATTERN.test(lower)) return true;
  return false;
}

export const PORTFOLIO_SERVICES_BLURB =
  "Obed builds full-stack web and mobile apps (React, Next.js, React Native, TypeScript), secure REST APIs (Node.js, Express, PostgreSQL/Neon), ecommerce and SaaS products, auth with Clerk, and security-focused work — pentesting workflows, API hardening, and recon automation. Recent work includes KhelianCart (grocery ecommerce in Ghana) and security tooling for bug bounty recon.";
