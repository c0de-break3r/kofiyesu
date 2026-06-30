import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  ESCALATION_PATTERN,
  hasBusinessIntent,
  isInformationalQuestion,
  isProjectBuildRequest,
  isSimplePricingQuestion,
  PORTFOLIO_SERVICES_BLURB,
  wantsToTalkToObed,
} from "@/lib/inquiryClassifier.js";
import { buildFallbackProjectQuote, formatQuoteReply } from "@/lib/projectQuoteFallback.js";
import { parseProjectQuote, type ProjectQuote } from "@/lib/projectQuote.js";

type InquiryType = "collaboration" | "security" | "job" | "general";

interface ChatAttachmentPayload {
  name: string;
  mimeType: string;
  base64: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  attachments?: ChatAttachmentPayload[];
}

interface ChatResponse {
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

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

const EMAIL_INTENT_PATTERN =
  /hire|job|quote|proposal|collaborat|project|pentest|audit|security work|work together|get in touch|reach out|contact you/i;

const DEFAULT_GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-3-flash-preview"];

const classifyWithKeywords = (text: string): InquiryType => {
  const lower = text.toLowerCase();
  if (/security|pentest|bug bounty|audit|vulnerability|recon|cyber/.test(lower)) return "security";
  if (/job|hire|position|role|employment|freelance|contract|recruit/.test(lower)) return "job";
  if (/collaborat|project|build|partner|startup|product|app|website/.test(lower)) return "collaboration";
  return "general";
};

const messageHasAttachments = (m: ChatMessage) => (m.attachments?.length ?? 0) > 0;

const lastUserText = (messages: ChatMessage[]) => {
  const last = [...messages].reverse().find((m) => m.role === "user");
  return last?.content?.trim() ?? "";
};

const allUserMessagesText = (messages: ChatMessage[]) =>
  messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

const buildLocalReply = (
  text: string,
  escalate: boolean,
  inquiryType: InquiryType,
  hasFiles: boolean,
  allUserText: string,
): ChatResponse => {
  if (hasFiles && !text) {
    return {
      inquiryType,
      reply:
        "I received your file(s). Configure **GEMINI_API_KEY** on the server to enable image and PDF analysis — then I can summarize documents and answer follow-up questions.",
      confidence: "low",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      source: "fallback",
    };
  }

  const lower = text.toLowerCase();
  const business = hasBusinessIntent(text);
  const informational = isInformationalQuestion(text);

  if (wantsToTalkToObed(text) && !business) {
    return {
      inquiryType,
      reply:
        "You can ask me anything here first — skills, services, project ideas, or security work. If it's something **Obed** should handle personally (a hire, quote, or urgent request), describe it and I'll pass it to his inbox.",
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      source: "fallback",
    };
  }

  if (escalate && business) {
    return {
      inquiryType,
      reply: `I've passed this to **Obed** in the admin queue — he'll follow up with you personally.`,
      confidence: "high",
      escalateToAdmin: true,
      showEmailCta: true,
      queueInquiry: true,
      source: "fallback",
    };
  }

  if (escalate && !business) {
    return {
      inquiryType,
      reply:
        "Happy to connect you with Obed. Share what you need — project scope, timeline, or the question you want him to answer — and I'll make sure it reaches him.",
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      source: "fallback",
    };
  }

  if (isSimplePricingQuestion(text)) {
    return {
      inquiryType,
      reply:
        "Obed scopes **custom projects in this chat** (requirements, tool/hosting costs, then a project total you can pay here). Tell me what you want built (e.g. a premium ecommerce site) and I'll walk through specs and a full quote.",
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: false,
      source: "fallback",
    };
  }

  if (informational || /what (websites?|apps?|can|kind)|build for me|services|portfolio|projects/.test(lower)) {
    return {
      inquiryType,
      reply: PORTFOLIO_SERVICES_BLURB,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      source: "fallback",
    };
  }

  if (/skill|stack|tech|python|backend|security|cyber|tool|automation|what do you|who (is|are) (kofi|obed)|about (kofi|obed)/.test(lower)) {
    return {
      inquiryType,
      reply:
        "Obed is a **Software Engineer & Cybersecurity Practitioner** from Ghana. He builds backend APIs, automation scripts, and offensive-security tooling (recon, pentesting workflows). Ask me anything specific — projects, stack, or how he works.",
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      source: "fallback",
    };
  }

  if (isProjectBuildRequest(text) || (business && /build|website|app|ecommerce|store|platform/.test(lower))) {
    const fallbackQuote = buildFallbackProjectQuote(allUserText);
    if (fallbackQuote) {
      return {
        inquiryType,
        reply: formatQuoteReply(fallbackQuote),
        confidence: "high",
        showPaymentOptions: true,
        projectQuote: fallbackQuote,
        escalateToAdmin: false,
        showEmailCta: false,
        queueInquiry: false,
        source: "fallback",
      };
    }

    return {
      inquiryType,
      reply: `I'd love to scope this with you. To prepare a quote (your requirements, tools/hosting Obed pays for, and the full project total payable here), please share:

1. **Must-have features** (e.g. catalog, Paystack checkout, admin, mobile)
2. **Timeline** (target launch or phases)
3. **Design** (brand ready vs needs UI work)
4. **Scale** (rough product/order volume)

Once that's clear, I'll summarise everything and unlock payment for this project in chat.`,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: false,
      source: "fallback",
    };
  }

  if (EMAIL_INTENT_PATTERN.test(lower) && business) {
    const labels: Record<InquiryType, string> = {
      collaboration: "a collaboration",
      security: "security / pentesting work",
      job: "a role or hire",
      general: "getting in touch",
    };
    return {
      inquiryType,
      reply: `Got it — ${labels[inquiryType]}. Tell me what you want built or reviewed and I'll scope requirements, pass-through costs, and a project total you can pay here.`,
      confidence: "high",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: false,
      source: "fallback",
    };
  }

  if (EMAIL_INTENT_PATTERN.test(lower)) {
    const labels: Record<InquiryType, string> = {
      collaboration: "a collaboration",
      security: "security / pentesting work",
      job: "a role or hire",
      general: "getting in touch",
    };
    return {
      inquiryType,
      reply: `Happy to help with ${labels[inquiryType]}. Share what you need built or reviewed and I can scope it in chat.`,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: false,
      source: "fallback",
    };
  }

  return {
    inquiryType,
    reply:
      "I'm here to answer questions about Obed's work, skills, and experience. What would you like to know?",
    confidence: "low",
    escalateToAdmin: false,
    showEmailCta: false,
    queueInquiry: false,
    source: "fallback",
  };
};

const buildSystemPrompt = (userName?: string, userEmail?: string) =>
  `You are the AI assistant on Obed Prince Kofi Yesu's portfolio site. Obed (also called Kofi) is a Software Engineer & Cybersecurity Practitioner from Ghana.

${PORTFOLIO_SERVICES_BLURB}

**Project scoping workflow (important):**
- When the user wants something **built** (e.g. "build me a premium ecommerce website"), do NOT show payment on the first vague message.
- Ask clarifying questions until you know: features, timeline, design/assets, and scale.
- When you have enough detail, reply with a structured breakdown in \`reply\` (requirements from the user, pass-through costs for tools/hosting/services Obed pays, labour, project total in GHS) and set \`showPaymentOptions\` true with a complete \`projectQuote\` object.
- **Simple pricing questions** (e.g. "how much for a discovery call?") — answer briefly in chat only. showPaymentOptions false, no projectQuote.
- Amounts in **Ghana Cedis (GHS)**. labourGhs is Obed's build fee; passThroughCosts are real costs (hosting, domains, paid APIs). totalGhs = labour + sum(passThroughCosts). depositGhs optional (typical 25–40% kickoff).

Visitor: ${userName ?? "Guest"} (${userEmail ?? "not provided"})

JSON only:
{"inquiryType":"collaboration|security|job|general","reply":"markdown answer","escalateToAdmin":false,"showEmailCta":false,"queueInquiry":false,"showPaymentOptions":false,"confidence":"high","projectQuote":null}

When ready to collect payment, projectQuote example:
{"projectTitle":"Premium ecommerce website","summary":"one line","requirements":["…"],"passThroughCosts":[{"label":"Hosting year 1","amountGhs":450,"note":"estimate"}],"laborGhs":18000,"depositGhs":5000,"totalGhs":18450}`;

const parseAiJson = (content: string): ChatResponse | null => {
  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim()) as ChatResponse;
    if (parsed.inquiryType && parsed.reply) return parsed;
  } catch {
    /* invalid */
  }
  return null;
};

const toGeminiParts = (message: ChatMessage): GeminiPart[] => {
  const parts: GeminiPart[] = [];
  const text = message.content?.trim();

  if (text) {
    parts.push({ text });
  }

  for (const att of message.attachments ?? []) {
    if (!att.base64 || !att.mimeType) continue;
    parts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.base64,
      },
    });
  }

  if (!text && (message.attachments?.length ?? 0) > 0) {
    const names = message.attachments!.map((a) => a.name).join(", ");
    parts.push({
      text: `The user shared: ${names}. Analyze the attachment(s) and respond helpfully.`,
    });
  }

  if (parts.length === 0) {
    parts.push({ text: "(empty message)" });
  }

  return parts;
};

const toGeminiContents = (messages: ChatMessage[]) => {
  const trimmed = [...messages];
  while (trimmed.length > 0 && trimmed[0].role === "assistant") {
    trimmed.shift();
  }

  return trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: toGeminiParts(m),
  }));
};

const geminiModels = (): string[] => {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (configured) return [configured];
  return DEFAULT_GEMINI_MODELS;
};

const callGeminiModel = async (
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  userName?: string,
  userEmail?: string,
): Promise<ChatResponse | null> => {
  const contents = toGeminiContents(messages ?? []);
  if (contents.length === 0) return null;

  const hasFiles = messages.some(messageHasAttachments);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: buildSystemPrompt(userName, userEmail) }],
      },
      contents,
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: hasFiles ? 1200 : 900,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[chat] Gemini ${model} failed`, res.status, errText.slice(0, 400));
    return null;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error(`[chat] Gemini ${model} returned empty content`);
    return null;
  }

  const parsed = parseAiJson(text);
  if (!parsed) {
    console.error(`[chat] Gemini ${model} returned invalid JSON`, text.slice(0, 200));
    return null;
  }

  return { ...parsed, source: "gemini" };
};

const callGemini = async (
  apiKey: string,
  messages: ChatMessage[],
  userName?: string,
  userEmail?: string,
): Promise<ChatResponse | null> => {
  for (const model of geminiModels()) {
    const result = await callGeminiModel(apiKey, model, messages, userName, userEmail);
    if (result) return result;
  }
  return null;
};

const callOpenAi = async (
  apiKey: string,
  messages: ChatMessage[],
  userName?: string,
  userEmail?: string,
): Promise<ChatResponse | null> => {
  const hasFiles = messages.some(messageHasAttachments);
  if (hasFiles) {
    return null;
  }

  const conversation = (messages ?? []).map((m) => `${m.role}: ${m.content}`).join("\n");

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(userName, userEmail) },
        { role: "user", content: conversation },
      ],
      temperature: 0.55,
      max_tokens: 900,
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text();
    console.error("[chat] OpenAI failed", aiRes.status, errText.slice(0, 400));
    return null;
  }

  const data = await aiRes.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = parseAiJson(content);
  return parsed ? { ...parsed, source: "openai" } : null;
};

const normalizeResponse = (
  parsed: ChatResponse,
  userText: string,
  keywordEscalate: boolean,
  allUserText: string,
): ChatResponse => {
  const informational = isInformationalQuestion(userText);
  const business = hasBusinessIntent(userText);
  const talkToObed = wantsToTalkToObed(userText);

  let escalated = parsed.escalateToAdmin ?? keywordEscalate;
  let queueInquiry = parsed.queueInquiry;
  let showEmailCta = parsed.showEmailCta;

  let projectQuote =
    parseProjectQuote(parsed.projectQuote) ??
    (parsed.showPaymentOptions ? buildFallbackProjectQuote(allUserText) : null);

  let showPaymentOptions = Boolean(projectQuote);

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
    queueInquiry = Boolean(business && (escalated || parsed.showEmailCta || parsed.confidence === "high"));
  }

  if (escalated && !business && !queueInquiry) {
    escalated = false;
  }

  return {
    inquiryType: parsed.inquiryType,
    reply: parsed.reply,
    confidence: parsed.confidence ?? "high",
    escalateToAdmin: escalated,
    showEmailCta: Boolean(showEmailCta && (queueInquiry || escalated)),
    queueInquiry: Boolean(queueInquiry),
    showPaymentOptions,
    projectQuote: projectQuote ?? undefined,
    source: parsed.source,
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, userEmail, userName } = req.body as {
    messages?: ChatMessage[];
    userEmail?: string;
    userName?: string;
  };

  const list = messages ?? [];
  const lastUser = [...list].reverse().find((m) => m.role === "user");
  const text = lastUserText(list);
  const allUserText = allUserMessagesText(list);
  const hasFiles = lastUser ? messageHasAttachments(lastUser) : false;

  if (!text && !hasFiles) {
    return res.status(400).json({ error: "No message or attachments provided" });
  }

  const escalate = ESCALATION_PATTERN.test(text);
  const inquiryType = classifyWithKeywords(text);

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;

  try {
    let parsed: ChatResponse | null = null;

    if (geminiKey) {
      parsed = await callGemini(geminiKey, list, userName, userEmail);
    } else if (openAiKey && !hasFiles) {
      parsed = await callOpenAi(openAiKey, list, userName, userEmail);
    } else if (!geminiKey && hasFiles) {
      console.warn("[chat] Files attached but no GEMINI_API_KEY");
    } else {
      console.warn("[chat] No GEMINI_API_KEY or OPENAI_API_KEY — using keyword fallback");
    }

    if (parsed) {
      res.setHeader("X-Chat-Source", parsed.source ?? "ai");
      return res.status(200).json(normalizeResponse(parsed, text, escalate, allUserText));
    }
  } catch (err) {
    console.error("[chat] AI handler error", err);
  }

  res.setHeader("X-Chat-Source", "fallback");
  return res.status(200).json(
    normalizeResponse(buildLocalReply(text, escalate, inquiryType, hasFiles, allUserText), text, escalate, allUserText),
  );
}
