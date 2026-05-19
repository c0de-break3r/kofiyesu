import { type InquiryType, inquiryRoutes, getInquiryRoute } from "../content/contact";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RoutingResult {
  inquiryType: InquiryType;
  reply: string;
  confidence: "high" | "medium" | "low";
  escalateToAdmin?: boolean;
  showEmailCta?: boolean;
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
      escalateToAdmin: false,
      showEmailCta: false,
    };
  }

  if (/hire|job|quote|collaborat|project|pentest|audit|work together|get in touch/.test(lower)) {
    const route = getInquiryRoute(type);
    return {
      inquiryType: type,
      reply: `${route.description} Share a few details (scope, timeline, goals) and we can take it from there.`,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: true,
    };
  }

  return {
    inquiryType: type,
    reply: "Ask me anything about Kofi's skills, projects, or experience — I'm happy to help.",
    confidence: "low",
    escalateToAdmin: false,
    showEmailCta: false,
  };
};

export const routeInquiryLocally = (userMessage: string): RoutingResult => {
  const escalate = shouldEscalate(userMessage);
  const inquiryType = classifyLocally(userMessage);
  return buildReply(inquiryType, escalate, userMessage);
};

export interface RouteInquiryOptions {
  messages: ChatMessage[];
  userEmail?: string | null;
  userId?: string | null;
  userName?: string | null;
}

export const routeInquiryWithAi = async ({
  messages,
  userEmail,
  userId,
  userName,
}: RouteInquiryOptions): Promise<RoutingResult> => {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content.trim()) {
    return routeInquiryLocally("");
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, userEmail, userId, userName }),
    });

    if (!res.ok) {
      return routeInquiryLocally(lastUser.content);
    }

    const data = (await res.json()) as RoutingResult;
    if (data.inquiryType && data.reply) {
      return data;
    }
  } catch {
    /* fallback below */
  }

  return routeInquiryLocally(lastUser.content);
};

export const getWelcomeMessage = (name?: string | null): string => {
  const greeting = name ? `Hi ${name.split(" ")[0]}!` : "Hi!";
  return `${greeting} I'm Kofi's assistant. Ask me about his work, skills, projects, or security engineering — I'll answer your questions here.`;
};
