import type { VercelRequest, VercelResponse } from "@vercel/node";

type InquiryType = "collaboration" | "security" | "job" | "general";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  inquiryType: InquiryType;
  reply: string;
  confidence: "high" | "medium" | "low";
  escalateToAdmin?: boolean;
  showEmailCta?: boolean;
  source?: "gemini" | "openai" | "fallback";
}

const ESCALATION_PATTERN =
  /speak to (a )?human|talk to kofi|contact kofi|real person|urgent|escalat|admin|pass (this )?on|human support|email (me|kofi)|send (an )?email/i;

const EMAIL_INTENT_PATTERN =
  /hire|job|quote|proposal|collaborat|project|pentest|audit|security work|work together|get in touch|reach out|contact you/i;

const DEFAULT_GEMINI_MODELS = ["gemini-3-flash-preview"];

const classifyWithKeywords = (text: string): InquiryType => {
  const lower = text.toLowerCase();
  if (/security|pentest|bug bounty|audit|vulnerability|recon|cyber/.test(lower)) return "security";
  if (/job|hire|position|role|employment|freelance|contract|recruit/.test(lower)) return "job";
  if (/collaborat|project|build|partner|startup|product|app|website/.test(lower)) return "collaboration";
  return "general";
};

const buildLocalReply = (text: string, escalate: boolean, inquiryType: InquiryType): ChatResponse => {
  if (escalate) {
    return {
      inquiryType,
      reply: `I've passed this to **Kofi** in the admin queue — he'll follow up with you personally.`,
      confidence: "high",
      escalateToAdmin: true,
      showEmailCta: true,
      source: "fallback",
    };
  }

  const lower = text.toLowerCase();

  if (/skill|stack|tech|python|backend|security|cyber|tool|automation|what do you|who (is|are) kofi|about kofi/.test(lower)) {
    return {
      inquiryType,
      reply:
        "Kofi is a **Software Engineer & Cybersecurity Practitioner** from Ghana. He builds backend APIs, automation scripts, and offensive-security tooling (recon, pentesting workflows). Ask me anything specific — projects, stack, or how he works.",
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: false,
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
      reply: `Happy to help with ${labels[inquiryType]}. Tell me a bit more about what you need — timeline, scope, or goals — and I can point you to the right next step.`,
      confidence: "medium",
      escalateToAdmin: false,
      showEmailCta: EMAIL_INTENT_PATTERN.test(lower),
      source: "fallback",
    };
  }

  return {
    inquiryType,
    reply:
      "I'm here to answer questions about Kofi's work, skills, and experience. What would you like to know?",
    confidence: "low",
    escalateToAdmin: false,
    showEmailCta: false,
    source: "fallback",
  };
};

const buildSystemPrompt = (userName?: string, userEmail?: string) =>
  `You are the AI assistant on Obed Prince Kofi Yesu's portfolio site. Kofi is a Software Engineer & Cybersecurity Practitioner from Ghana (backend systems, Python/Bash automation, pentesting & recon tools).

Rules:
1. **Answer the visitor's question directly** in 2–4 sentences. Be helpful and conversational.
2. **Never** say "general inquiry", "this looks like a … inquiry", or "tap below to email" unless the user explicitly wants to contact Kofi or speak to a human.
3. Classify intent internally only (collaboration | security | job | general) — do not announce the category in the reply.
4. Set escalateToAdmin true only if they ask for Kofi, a human, admin, or say it's urgent.
5. Set showEmailCta true only if they clearly want to hire, collaborate, get a quote, or explicitly ask to email — not for casual questions.

Visitor: ${userName ?? "Guest"} (${userEmail ?? "not provided"})

JSON only:
{"inquiryType":"collaboration|security|job|general","reply":"your answer","escalateToAdmin":false,"showEmailCta":false,"confidence":"high"}`;

const parseAiJson = (content: string): ChatResponse | null => {
  try {
    const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, "").trim()) as ChatResponse;
    if (parsed.inquiryType && parsed.reply) return parsed;
  } catch {
    /* invalid */
  }
  return null;
};

const toGeminiContents = (messages: ChatMessage[]) => {
  const trimmed = [...messages];
  while (trimmed.length > 0 && trimmed[0].role === "assistant") {
    trimmed.shift();
  }

  return trimmed.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
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
        maxOutputTokens: 400,
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

const normalizeResponse = (parsed: ChatResponse, escalate: boolean): ChatResponse => {
  const escalated = parsed.escalateToAdmin ?? escalate;

  return {
    inquiryType: parsed.inquiryType,
    reply: parsed.reply,
    confidence: parsed.confidence ?? "high",
    escalateToAdmin: escalated,
    showEmailCta: escalated || parsed.showEmailCta === true,
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

  const lastUser = [...(messages ?? [])].reverse().find((m) => m.role === "user");

  if (!lastUser?.content?.trim()) {
    return res.status(400).json({ error: "No message provided" });
  }

  const escalate = ESCALATION_PATTERN.test(lastUser.content);
  const inquiryType = classifyWithKeywords(lastUser.content);

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;

  try {
    let parsed: ChatResponse | null = null;

    if (geminiKey) {
      parsed = await callGemini(geminiKey, messages ?? [], userName, userEmail);
    } else if (openAiKey) {
      parsed = await callOpenAi(openAiKey, messages ?? [], userName, userEmail);
    } else {
      console.warn("[chat] No GEMINI_API_KEY or OPENAI_API_KEY — using keyword fallback");
    }

    if (parsed) {
      res.setHeader("X-Chat-Source", parsed.source ?? "ai");
      return res.status(200).json(normalizeResponse(parsed, escalate));
    }
  } catch (err) {
    console.error("[chat] AI handler error", err);
  }

  res.setHeader("X-Chat-Source", "fallback");
  return res.status(200).json(buildLocalReply(lastUser.content, escalate, inquiryType));
}
