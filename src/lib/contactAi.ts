import { type InquiryType, inquiryRoutes, getInquiryRoute } from "@/content/contact";
import { chatAssistantBio } from "@/content/about";
import type { ChatAttachment } from "@/lib/chatAttachments";
import { attachmentsToApiPayload } from "@/lib/chatAttachments";
import { formatPackagesForReply } from "@/content/chatPackages";
import {
  ESCALATION_PATTERN,
  PAYMENT_OR_NEXT_STEP_PATTERN,
  hasBusinessIntent,
  isInformationalQuestion,
  shouldShowPaymentOptions,
  wantsToTalkToObed,
} from "@/lib/inquiryClassifier";

export interface ChatMessageAttachmentView {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  previewUrl?: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachments?: ChatMessageAttachmentView[];
}

export interface RoutingResult {
  inquiryType: InquiryType;
  reply: string;
  confidence: "high" | "medium" | "low";
  escalateToAdmin?: boolean;
  showEmailCta?: boolean;
  queueInquiry?: boolean;
  showPaymentOptions?: boolean;
  source?: "gemini" | "openai" | "fallback";
}

export function mergeRoutingFlags(result: RoutingResult, userText: string): RoutingResult {
  const informational = isInformationalQuestion(userText);
  const business = hasBusinessIntent(userText);
  const talkToObed = wantsToTalkToObed(userText);
  const paymentContext = shouldShowPaymentOptions(userText);

  let showPaymentOptions = result.showPaymentOptions ?? paymentContext;
  let queueInquiry = result.queueInquiry;
  let showEmailCta = result.showEmailCta;
  let escalated = result.escalateToAdmin ?? ESCALATION_PATTERN.test(userText);

  if (informational) {
    queueInquiry = false;
    showEmailCta = false;
    escalated = false;
    if (!paymentContext) showPaymentOptions = false;
  } else if (talkToObed && !business) {
    queueInquiry = false;
    showEmailCta = false;
    escalated = false;
  } else if (paymentContext && !escalated) {
    queueInquiry = false;
    showEmailCta = false;
    showPaymentOptions = true;
  } else if (queueInquiry === undefined) {
    queueInquiry = Boolean(business && (escalated || result.showEmailCta || result.confidence === "high"));
  }

  if (escalated && !business && !queueInquiry) {
    escalated = false;
  }

  return {
    ...result,
    escalateToAdmin: escalated,
    showEmailCta: Boolean(showEmailCta && (queueInquiry || escalated)),
    queueInquiry: Boolean(queueInquiry),
    showPaymentOptions,
  };
}

const PORTFOLIO_ANSWER =
  "Obed builds full-stack web and mobile apps (React, Next.js, React Native, TypeScript), secure REST APIs (Node.js, Express, PostgreSQL/Neon), ecommerce and SaaS products, auth with Clerk, and security-focused work — pentesting workflows, API hardening, and recon automation. Recent work includes KhelianCart (grocery ecommerce in Ghana) and security tooling for bug bounty recon.";

const shouldEscalate = (text: string): boolean => ESCALATION_PATTERN.test(text);

const classifyLocally = (text: string): InquiryType => {
  const lower = text.toLowerCase();
  let best: InquiryType = "general";
  let bestScore = 0;

  for (const route of inquiryRoutes) {
    if (route.id === "general") continue;
    const score = route.keywords.reduce((acc, kw) => (lower.includes(kw) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = route.id;
    }
  }

  return best;
};

const buildReply = (type: InquiryType, escalate: boolean, userMessage: string): RoutingResult => {
  const lower = userMessage.toLowerCase();
  const business = hasBusinessIntent(userMessage);
  const informational = isInformationalQuestion(userMessage);

  if (wantsToTalkToObed(userMessage) && !business) {
    return {
      inquiryType: type,
      reply:
        "You can ask me anything here first — skills, services, project ideas, or security work. If it's something **Obed** should handle personally (a hire, quote, or urgent request), describe it and I'll pass it to his inbox.",
      confidence: "medium",
      queueInquiry: false,
    };
  }

  if (escalate && business) {
    return {
      inquiryType: type,
      reply: `I've passed this to **Obed** in the admin queue — he'll follow up with you personally.`,
      confidence: "high",
      escalateToAdmin: true,
      showEmailCta: true,
      queueInquiry: true,
    };
  }

  if (escalate && !business) {
    return {
      inquiryType: type,
      reply:
        "Happy to connect you with Obed. Share what you need — project scope, timeline, or the question you want him to answer — and I'll make sure it reaches him.",
      confidence: "medium",
      queueInquiry: false,
    };
  }

  if (PAYMENT_OR_NEXT_STEP_PATTERN.test(lower)) {
    return {
      inquiryType: type,
      reply: `Obed offers fixed packages you can pay for right here in chat (Paystack — card or Mobile Money):\n\n${formatPackagesForReply()}\n\nPick one below when you're ready. For a custom scope beyond these, describe your project and we can line up a bespoke quote.`,
      confidence: "high",
      showPaymentOptions: true,
      queueInquiry: false,
      showEmailCta: false,
      escalateToAdmin: false,
    };
  }

  if (informational || /what (websites?|apps?|can|kind)|build for me|services|portfolio|projects/.test(lower)) {
    return {
      inquiryType: type,
      reply: PORTFOLIO_ANSWER,
      confidence: "medium",
      queueInquiry: false,
    };
  }

  if (/skill|stack|tech|python|backend|security|cyber|tool|automation|what do you|who (is|are) (kofi|obed)|about (kofi|obed)/.test(lower)) {
    return {
      inquiryType: type,
      reply: `${chatAssistantBio} What would you like to know more about?`,
      confidence: "medium",
      queueInquiry: false,
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower) && business) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `Got it — ${route.description} Share scope, timeline, and goals here and I'll help you choose the right next step. Standard packages are below if you want to reserve a slot or discovery call.`,
      confidence: "high",
      showPaymentOptions: true,
      queueInquiry: false,
      showEmailCta: false,
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower)) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `${route.description} Share a few details (scope, timeline, goals) and I can answer questions or show payment options when you're ready.`,
      confidence: "medium",
      showPaymentOptions: shouldShowPaymentOptions(userMessage),
      queueInquiry: false,
    };
  }

  return {
    inquiryType: type,
    reply: "Ask me anything about Obed's skills, projects, or experience — I'm happy to help.",
    confidence: "low",
    queueInquiry: false,
  };
};

export const routeInquiryLocally = (userMessage: string, hasFiles = false): RoutingResult => {
  const escalate = shouldEscalate(userMessage);
  const inquiryType = classifyLocally(userMessage);
  if (hasFiles && !userMessage.trim()) {
    return {
      inquiryType,
      reply:
        "I received your file(s). For image and PDF analysis, ensure **GEMINI_API_KEY** is configured on the server — then I can summarize and answer questions about what you shared.",
      confidence: "low",
      queueInquiry: false,
    };
  }
  return buildReply(inquiryType, escalate, userMessage);
};

export interface RouteInquiryOptions {
  messages: ChatMessage[];
  userEmail?: string | null;
  userId?: string | null;
  userName?: string | null;
  /** Attachments for the latest user turn only. */
  pendingAttachments?: ChatAttachment[];
}

function messagesForApi(messages: ChatMessage[], pendingAttachments?: ChatAttachment[]) {
  const lastUserIdx = [...messages].map((m, i) => (m.role === "user" ? i : -1)).filter((i) => i >= 0).pop();

  return messages.map((m, i) => {
    const base = { role: m.role, content: m.content };
    if (i === lastUserIdx && pendingAttachments?.length) {
      return { ...base, attachments: attachmentsToApiPayload(pendingAttachments) };
    }
    return base;
  });
}

export const routeInquiryWithAi = async ({
  messages,
  userEmail,
  userId,
  userName,
  pendingAttachments,
}: RouteInquiryOptions): Promise<RoutingResult> => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const hasFiles = (pendingAttachments?.length ?? 0) > 0;
  if (!lastUser?.content?.trim() && !hasFiles) {
    return routeInquiryLocally("", hasFiles);
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messagesForApi(messages, pendingAttachments),
        userEmail,
        userId,
        userName,
      }),
    });

    if (!res.ok) {
      return routeInquiryLocally(lastUser?.content ?? "", hasFiles);
    }

    const data = (await res.json()) as RoutingResult;
    if (data.inquiryType && data.reply) {
      return mergeRoutingFlags(data, lastUser?.content ?? "");
    }
  } catch {
    /* fallback */
  }

  return mergeRoutingFlags(routeInquiryLocally(lastUser?.content ?? "", hasFiles), lastUser?.content ?? "");
};

export const getWelcomeMessage = (name?: string | null): string => {
  const greeting = name ? `Hi ${name.split(" ")[0]}!` : "Hi!";
  return `${greeting} I'm Obed's assistant — ask anything about Obed's work, pricing, or your project specs. I can answer here and show Paystack payment options when you're ready to start. Attach images, PDFs, or text files for analysis too.`;
};
