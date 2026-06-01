import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CHAT_PACKAGES_PROMPT } from "../../../api/lib/chatPackages.js";
import {
  ESCALATION_PATTERN,
  PAYMENT_OR_NEXT_STEP_PATTERN,
  hasBusinessIntent,
  isInformationalQuestion,
  PORTFOLIO_SERVICES_BLURB,
  shouldShowPaymentOptions,
  wantsToTalkToObed,
} from "../../../api/lib/inquiryClassifier.js";

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

const buildLocalReply = (text: string, escalate: boolean, inquiryType: InquiryType, hasFiles: boolean): ChatResponse => {
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

  if (PAYMENT_OR_NEXT_STEP_PATTERN.test(lower)) {
    return {
      inquiryType,
      reply: `Obed offers fixed packages you can pay for in chat (Paystack — card or Mobile Money):\n\n${CHAT_PACKAGES_PROMPT}\n\nPick a package below when you're ready. For custom scope, describe your project here first.`,
      confidence: "high",
      showPaymentOptions: true,
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
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

  if (EMAIL_INTENT_PATTERN.test(lower) && business) {
    const labels: Record<InquiryType, string> = {
      collaboration: "a collaboration",
      security: "security / pentesting work",
      job: "a role or hire",
      general: "getting in touch",
    };
    return {
      inquiryType,
      reply: `Got it — ${labels[inquiryType]}. Share scope, timeline, and goals here and I'll help you choose the right package. Standard options are below when you're ready to pay.`,
      confidence: "high",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: true,
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
      reply: `Happy to help with ${labels[inquiryType]}. Tell me a bit more — timeline, scope, or goals — and I can answer questions or show payment options when you're ready.`,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
      queueInquiry: false,
      showPaymentOptions: shouldShowPaymentOptions(text),
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

Standard packages (answer pricing questions using these — do not invent prices):
${CHAT_PACKAGES_PROMPT}

Rules:
1. **Answer every question in chat** — skills, pricing, scope, timeline, security work. Be helpful in 2–5 sentences.
2. **Informational questions** — answer fully. queueInquiry false, showEmailCta false, escalateToAdmin false.
3. **Pricing / payment / how much / packages / ready to pay / next step** — explain packages from the list above. Set showPaymentOptions true, queueInquiry false, showEmailCta false.
4. When the user shares **project specs** (budget, timeline, scope, features) with business intent — help them choose a package. Set showPaymentOptions true unless they only want a custom quote with no payment yet.
5. When the user asks to **talk to Obed/Kofi** without a concrete project — invite questions here first. queueInquiry false.
6. **queueInquiry true** only for urgent human follow-up with substantive details where they explicitly need Obed to act outside payment (rare). Prefer showPaymentOptions over queueInquiry for hires and quotes.
7. When the user shares **files**, analyze them. queueInquiry true only if they need Obed to act on a brief, not casual analysis.
8. Never say "tap below to email" or route to email for pricing — payment happens in chat via showPaymentOptions.
9. Do not announce inquiry category in the reply.
10. escalateToAdmin true only when they need Obed personally with a substantive message.
11. showEmailCta true only when queueInquiry is true.

Visitor: ${userName ?? "Guest"} (${userEmail ?? "not provided"})

JSON only:
{"inquiryType":"collaboration|security|job|general","reply":"your answer","escalateToAdmin":false,"showEmailCta":false,"queueInquiry":false,"showPaymentOptions":false,"confidence":"high"}`;

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
        maxOutputTokens: hasFiles ? 800 : 400,
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
      max_tokens: 400,
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

const normalizeResponse = (parsed: ChatResponse, userText: string, keywordEscalate: boolean): ChatResponse => {
  const informational = isInformationalQuestion(userText);
  const business = hasBusinessIntent(userText);
  const talkToObed = wantsToTalkToObed(userText);
  const paymentContext = shouldShowPaymentOptions(userText);

  let escalated = parsed.escalateToAdmin ?? keywordEscalate;
  let queueInquiry = parsed.queueInquiry;
  let showEmailCta = parsed.showEmailCta;
  let showPaymentOptions = parsed.showPaymentOptions ?? paymentContext;

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
      return res.status(200).json(normalizeResponse(parsed, text, escalate));
    }
  } catch (err) {
    console.error("[chat] AI handler error", err);
  }

  res.setHeader("X-Chat-Source", "fallback");
  return res.status(200).json(normalizeResponse(buildLocalReply(text, escalate, inquiryType, hasFiles), text, escalate));
}
