import { type InquiryType, inquiryRoutes, getInquiryRoute } from "@/content/contact";
import { chatAssistantBio } from "@/content/about";
import type { ChatAttachment } from "@/lib/chatAttachments";
import { attachmentsToApiPayload } from "@/lib/chatAttachments";
import {
  ESCALATION_PATTERN,
  hasBusinessIntent,
  hasEnoughContextForQuote,
  isInformationalQuestion,
  isProjectBuildRequest,
  isSimplePricingQuestion,
  wantsToTalkToObed,
} from "@/lib/inquiryClassifier";
import {
  type ProjectQuote,
  normalizeProjectQuote,
  parseProjectQuote,
} from "@/lib/projectQuote";

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
  projectQuote?: ProjectQuote;
  source?: "gemini" | "openai" | "fallback";
}

function allUserMessagesText(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
}

function buildFallbackProjectQuote(allUserText: string): ProjectQuote | null {
  if (!hasEnoughContextForQuote(allUserText)) return null;
  const lower = allUserText.toLowerCase();

  if (/ecommerce|online store|shop|storefront/.test(lower)) {
    const quote = normalizeProjectQuote({
      projectTitle: "Premium ecommerce website",
      summary:
        "Full-stack ecommerce build based on your brief — catalog, checkout, admin, and Ghana-friendly payments.",
      requirements: [
        "Product catalog, categories, and search",
        "Cart, checkout, and Paystack (Mobile Money + cards)",
        "Customer accounts and order history",
        "Admin dashboard for products, orders, and basic analytics",
        "Deployed on modern hosting with SSL",
      ],
      passThroughCosts: [
        {
          label: "Domain + hosting (year 1, estimated)",
          amountGhs: 450,
          note: "e.g. Vercel + Neon — actual vendor bills passed through",
        },
        {
          label: "Paystack / Clerk / email",
          amountGhs: 0,
          note: "Usage-based; usually billed on accounts you own",
        },
      ],
      laborGhs: 18_000,
      depositGhs: 5_000,
      totalGhs: 18_450,
    });
    return quote;
  }

  if (/pentest|security audit|vulnerability/.test(lower)) {
    return normalizeProjectQuote({
      projectTitle: "Application security review",
      summary: "Focused security assessment of your app or API based on your scope.",
      requirements: [
        "Scope agreed in chat (apps, APIs, auth flows)",
        "Recon and OWASP-aligned testing",
        "Written findings with severity ratings",
        "Remediation guidance for critical issues",
      ],
      passThroughCosts: [
        {
          label: "Testing tools & lab time",
          amountGhs: 200,
          note: "Licensed tooling and environment costs",
        },
      ],
      laborGhs: 4_500,
      depositGhs: 1_500,
      totalGhs: 4_700,
    });
  }

  return null;
}

export function mergeRoutingFlags(
  result: RoutingResult,
  userText: string,
  allUserText = userText,
): RoutingResult {
  const informational = isInformationalQuestion(userText);
  const business = hasBusinessIntent(userText);
  const talkToObed = wantsToTalkToObed(userText);

  let projectQuote =
    parseProjectQuote(result.projectQuote) ??
    (result.showPaymentOptions ? buildFallbackProjectQuote(allUserText) : null);

  let showPaymentOptions = Boolean(projectQuote);
  let queueInquiry = result.queueInquiry;
  let showEmailCta = result.showEmailCta;
  let escalated = result.escalateToAdmin ?? ESCALATION_PATTERN.test(userText);

  if (informational || isSimplePricingQuestion(userText)) {
    queueInquiry = false;
    showEmailCta = false;
    escalated = false;
    showPaymentOptions = false;
    projectQuote = null;
  } else if (talkToObed && !business) {
    queueInquiry = false;
    showEmailCta = false;
    escalated = false;
  } else if (showPaymentOptions) {
    queueInquiry = false;
    showEmailCta = false;
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
    projectQuote: projectQuote ?? undefined,
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

const buildReply = (
  type: InquiryType,
  escalate: boolean,
  userMessage: string,
  allUserText: string,
): RoutingResult => {
  const lower = userMessage.toLowerCase();
  const business = hasBusinessIntent(userMessage);
  const informational = isInformationalQuestion(userMessage);

  if (wantsToTalkToObed(userMessage) && !business) {
    return {
      inquiryType: type,
      reply:
        "You can ask me anything here first — skills, services, project ideas, or security work. Describe a build or hire request and I'll scope requirements and pricing in this chat.",
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

  if (isSimplePricingQuestion(userMessage)) {
    return {
      inquiryType: type,
      reply:
        "Obed scopes **custom projects in this chat** (requirements, tool/hosting costs, then a project total you can pay here). Discovery sessions and fixed packages are separate — tell me what you want built (e.g. a premium ecommerce site) and I'll walk through specs and a full quote.",
      confidence: "medium",
      queueInquiry: false,
      showPaymentOptions: false,
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

  if (isProjectBuildRequest(userMessage) || (business && /build|website|app|ecommerce|store|platform/.test(lower))) {
    const fallbackQuote = buildFallbackProjectQuote(allUserText);
    if (fallbackQuote) {
      return {
        inquiryType: type,
        reply: formatQuoteReply(fallbackQuote),
        confidence: "high",
        showPaymentOptions: true,
        projectQuote: fallbackQuote,
        queueInquiry: false,
        showEmailCta: false,
      };
    }

    return {
      inquiryType: type,
      reply: `I'd love to scope this with you. To prepare a proper quote (your requirements, tools/hosting Obed pays for, and the full project total payable here), please share:

1. **Must-have features** (e.g. catalog, Paystack checkout, admin, mobile)
2. **Timeline** (target launch or phases)
3. **Design** (brand ready vs needs UI work)
4. **Scale** (rough product/order volume)

Once that's clear, I'll summarise everything and unlock payment for this project in chat.`,
      confidence: "medium",
      queueInquiry: false,
      showPaymentOptions: false,
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower) && business) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `Got it — ${route.description} Tell me what you want built or reviewed and I'll scope requirements, pass-through costs, and a project total you can pay here.`,
      confidence: "high",
      queueInquiry: false,
      showEmailCta: false,
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower)) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `${route.description} Share what you need built or reviewed and I can scope it in chat.`,
      confidence: "medium",
      queueInquiry: false,
    };
  }

  return {
    inquiryType: type,
    reply: "Ask me anything about Obed's skills, projects, or experience — or describe a project you want built.",
    confidence: "low",
    queueInquiry: false,
  };
};

function formatQuoteReply(quote: ProjectQuote): string {
  const req = quote.requirements.map((r) => `• ${r}`).join("\n");
  const costs =
    quote.passThroughCosts.length > 0
      ? quote.passThroughCosts.map((c) => `• ${c.label}: GH₵${c.amountGhs}${c.note ? ` (${c.note})` : ""}`).join("\n")
      : "• None estimated yet";

  return `Here's a scoped quote for **${quote.projectTitle}**:

**Your requirements**
${req}

**Costs Obed covers (tools, hosting, services)**
${costs}

**Obed's build & delivery (labour):** GH₵${quote.laborGhs.toLocaleString("en-GH")}
**Project total:** GH₵${quote.totalGhs.toLocaleString("en-GH")}${quote.depositGhs ? ` — **Kickoff deposit:** GH₵${quote.depositGhs.toLocaleString("en-GH")}` : ""}

${quote.summary}

Use the payment section below when you're ready (Paystack — card or Mobile Money).`;
}

export const routeInquiryLocally = (userMessage: string, hasFiles = false, allUserText?: string): RoutingResult => {
  const escalate = shouldEscalate(userMessage);
  const inquiryType = classifyLocally(userMessage);
  const context = allUserText ?? userMessage;

  if (hasFiles && !userMessage.trim()) {
    return {
      inquiryType,
      reply:
        "I received your file(s). For image and PDF analysis, ensure **GEMINI_API_KEY** is configured on the server — then I can summarize and answer questions about what you shared.",
      confidence: "low",
      queueInquiry: false,
    };
  }
  return buildReply(inquiryType, escalate, userMessage, context);
};

export interface RouteInquiryOptions {
  messages: ChatMessage[];
  userEmail?: string | null;
  userId?: string | null;
  userName?: string | null;
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
  const allUserText = allUserMessagesText(messages);

  if (!lastUser?.content?.trim() && !hasFiles) {
    return mergeRoutingFlags(routeInquiryLocally("", hasFiles, allUserText), "", allUserText);
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
      return mergeRoutingFlags(
        routeInquiryLocally(lastUser?.content ?? "", hasFiles, allUserText),
        lastUser?.content ?? "",
        allUserText,
      );
    }

    const data = (await res.json()) as RoutingResult;
    if (data.inquiryType && data.reply) {
      return mergeRoutingFlags(data, lastUser?.content ?? "", allUserText);
    }
  } catch {
    /* fallback */
  }

  return mergeRoutingFlags(
    routeInquiryLocally(lastUser?.content ?? "", hasFiles, allUserText),
    lastUser?.content ?? "",
    allUserText,
  );
};

export const getWelcomeMessage = (name?: string | null): string => {
  const greeting = name ? `Hi ${name.split(" ")[0]}!` : "Hi!";
  return `${greeting} I'm Obed's assistant. Describe a project (e.g. a premium ecommerce site) and I'll capture your requirements, estimate tools/hosting costs, and prepare a project total you can pay here with Paystack. Ask about skills or past work anytime.`;
};
