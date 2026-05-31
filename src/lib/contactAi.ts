import { type InquiryType, inquiryRoutes, getInquiryRoute } from "@/content/contact";
import type { ChatAttachment } from "@/lib/chatAttachments";
import { attachmentsToApiPayload } from "@/lib/chatAttachments";

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
  source?: "gemini" | "openai" | "fallback";
}

const ESCALATION_PATTERN =
  /speak to (a )?human|talk to kofi|contact kofi|real person|urgent|escalat|admin|pass (this )?on|human support/i;

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
  if (escalate) {
    return {
      inquiryType: type,
      reply: `I've passed this to **Kofi** in the admin queue — he'll follow up with you personally.`,
      confidence: "high",
      escalateToAdmin: true,
      showEmailCta: true,
    };
  }

  const lower = userMessage.toLowerCase();

  if (/skill|stack|tech|python|backend|security|cyber|tool|automation|what do you|who (is|are) kofi|about/.test(lower)) {
    return {
      inquiryType: type,
      reply:
        "Kofi is a **Software Engineer & Cybersecurity Practitioner** from Ghana — backend APIs, automation, and offensive-security tooling. What would you like to know more about?",
      confidence: "medium",
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower)) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `${route.description} Share a few details (scope, timeline, goals) and we can take it from there.`,
      confidence: "medium",
      showEmailCta: true,
    };
  }

  return {
    inquiryType: type,
    reply: "Ask me anything about Kofi's skills, projects, or experience — I'm happy to help.",
    confidence: "low",
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
      return data;
    }
  } catch {
    /* fallback */
  }

  return routeInquiryLocally(lastUser?.content ?? "", hasFiles);
};

export const getWelcomeMessage = (name?: string | null): string => {
  const greeting = name ? `Hi ${name.split(" ")[0]}!` : "Hi!";
  return `${greeting} I'm Kofi's assistant. Ask me about his work, skills, or projects — or attach images, PDFs, and text files for analysis.`;
};
