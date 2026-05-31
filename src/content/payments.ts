export const servicePackages = [
  {
    id: "discovery",
    title: "Discovery session",
    amountGhs: 150,
    description: "30-minute scoping call — goals, timeline, stack, and fit.",
    highlights: ["Video or async brief", "Written next steps", "No commitment"],
  },
  {
    id: "deposit",
    title: "Project kickoff",
    amountGhs: 500,
    description: "Reserve a build slot and start technical discovery.",
    highlights: ["Priority scheduling", "Architecture outline", "Milestone plan"],
    featured: true,
  },
  {
    id: "audit",
    title: "Security review",
    amountGhs: 800,
    description: "Focused review of your app, API, or auth flows.",
    highlights: ["OWASP-aligned checks", "Findings report", "Fix recommendations"],
  },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  amountGhs: number;
  description: string;
  highlights: readonly string[];
  featured?: boolean;
}>;

export type ServicePackageId = (typeof servicePackages)[number]["id"];

export const currencyCode = "GHS" as const;
export const currencyName = "Ghana Cedis";

/** Format amounts in Ghana Cedis (GHS). */
export function formatGhs(amount: number): string {
  const formatted = amount.toLocaleString("en-GH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `GH₵ ${formatted}`;
}

/** Country code, no + — override with VITE_WHATSAPP_NUMBER in .env */
export const whatsappNumber =
  import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, "") || "233000000000";

export const whatsappUrl = (message: string) =>
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

export const whatsappContactUrl = whatsappUrl(
  "Hi Obed — I saw your portfolio and would like to discuss a project.",
);
