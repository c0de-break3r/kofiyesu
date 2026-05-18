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

const buildReply = (type: InquiryType, escalate: boolean): string => {
  if (escalate) {
    return `I've flagged this for **Kofi** and added it to the admin queue. He'll review your message and follow up personally.\n\nYou can also continue via email using the button below.`;
  }

  const route = getInquiryRoute(type);
  return `Thanks for reaching out! This sounds like a **${route.label.toLowerCase()}** inquiry.\n\n${route.description}\n\nTap below to email me directly — your message will be pre-filled.`;
};

export const routeInquiryLocally = (userMessage: string): RoutingResult => {
  const escalate = shouldEscalate(userMessage);
  const inquiryType = classifyLocally(userMessage);

  return {
    inquiryType,
    reply: buildReply(inquiryType, escalate),
    confidence: inquiryType === "general" ? "low" : "high",
    escalateToAdmin: escalate,
  };
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
  return `${greeting} I'm Kofi's assistant. Ask about collaboration, security work, jobs — or say "speak to Kofi" to escalate to him directly.`;
};
