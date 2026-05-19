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
}

const ESCALATION_PATTERN =
  /speak to (a )?human|talk to kofi|contact kofi|real person|urgent|escalat|admin|pass (this )?on|human support/i;

const classifyWithKeywords = (text: string): InquiryType => {
  const lower = text.toLowerCase();
  if (/security|pentest|bug bounty|audit|vulnerability|recon|cyber/.test(lower)) return "security";
  if (/job|hire|position|role|employment|freelance|contract|recruit/.test(lower)) return "job";
  if (/collaborat|project|build|partner|startup|product|app|website/.test(lower)) return "collaboration";
  return "general";
};

const buildLocalReply = (type: InquiryType, escalate: boolean): string => {
  if (escalate) {
    return `I've flagged this for **Kofi** and added it to the admin queue. He'll review your message and follow up personally.`;
  }
  const labels: Record<InquiryType, string> = {
    collaboration: "project collaboration",
    security: "security and pentesting",
    job: "job opportunity",
    general: "general message",
  };
  return `Thanks! This looks like a **${labels[type]}** inquiry. Tap below to email Kofi with your message pre-filled.`;
};

const buildSystemPrompt = (userName?: string, userEmail?: string) =>
  `You are the AI assistant for Obed Prince Kofi Yesu's portfolio. Kofi is a Software Engineer & Cybersecurity Practitioner from Ghana who builds backend systems, automation, and pentesting tools.

Your jobs:
1. Answer brief questions about Kofi's skills (backend, security, Python, automation, mobile/web).
2. Classify contact intent: collaboration | security | job | general.
3. If the user asks to speak to Kofi, a human, admin, or says urgent — set escalateToAdmin true.

User: ${userName ?? "Guest"} (${userEmail ?? "not provided"})

Respond with JSON only:
{"inquiryType":"collaboration|security|job|general","reply":"2-3 friendly sentences. Use **bold** sparingly.","escalateToAdmin":false,"confidence":"high"}`;

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

const callGemini = async (
  apiKey: string,
  messages: ChatMessage[],
  userName?: string,
  userEmail?: string,
): Promise<ChatResponse | null> => {
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
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
        temperature: 0.4,
        maxOutputTokens: 280,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return parseAiJson(text);
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
      temperature: 0.4,
      max_tokens: 280,
    }),
  });

  if (!aiRes.ok) return null;

  const data = await aiRes.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return parseAiJson(content);
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

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const openAiKey = process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;

  try {
    let parsed: ChatResponse | null = null;

    if (geminiKey) {
      parsed = await callGemini(geminiKey, messages ?? [], userName, userEmail);
    } else if (openAiKey) {
      parsed = await callOpenAi(openAiKey, messages ?? [], userName, userEmail);
    }

    if (parsed) {
      return res.status(200).json({
        inquiryType: parsed.inquiryType,
        reply: parsed.reply,
        confidence: parsed.confidence ?? "high",
        escalateToAdmin: parsed.escalateToAdmin ?? escalate,
      });
    }
  } catch {
    /* fall through */
  }

  const inquiryType = classifyWithKeywords(lastUser.content);
  return res.status(200).json({
    inquiryType,
    reply: buildLocalReply(inquiryType, escalate),
    confidence: "medium",
    escalateToAdmin: escalate,
  });
}
