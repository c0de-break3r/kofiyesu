import { hasEnoughContextForQuote } from "./inquiryClassifier.js";
import { normalizeProjectQuote, type ProjectQuote } from "./projectQuote.js";

export function buildFallbackProjectQuote(allUserText: string): ProjectQuote | null {
  if (!hasEnoughContextForQuote(allUserText)) return null;
  const lower = allUserText.toLowerCase();

  if (/ecommerce|online store|shop|storefront/.test(lower)) {
    return normalizeProjectQuote({
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

export function formatQuoteReply(quote: ProjectQuote): string {
  const req = quote.requirements.map((r) => `• ${r}`).join("\n");
  const costs =
    quote.passThroughCosts.length > 0
      ? quote.passThroughCosts
          .map((c) => `• ${c.label}: GH₵${c.amountGhs}${c.note ? ` (${c.note})` : ""}`)
          .join("\n")
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
