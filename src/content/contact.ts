export type InquiryType = "collaboration" | "security" | "job" | "general";

export interface InquiryRoute {
  id: InquiryType;
  label: string;
  description: string;
  email: string;
  subject: string;
  keywords: string[];
}

export const inquiryRoutes: InquiryRoute[] = [
  {
    id: "collaboration",
    label: "Project collaboration",
    description: "Building software, products, or long-term partnerships",
    email: "hello@kofiyesu.dev",
    subject: "Collaboration inquiry",
    keywords: ["collaborate", "project", "build", "partner", "startup", "product", "app", "website"],
  },
  {
    id: "security",
    label: "Security & pentesting",
    description: "Bug bounty, pentesting, recon tooling, or security consulting",
    email: "security@kofiyesu.dev",
    subject: "Security inquiry",
    keywords: ["security", "pentest", "bug bounty", "hacking", "audit", "vulnerability", "recon", "cyber"],
  },
  {
    id: "job",
    label: "Job opportunity",
    description: "Full-time, contract, or freelance roles",
    email: "hello@kofiyesu.dev",
    subject: "Job opportunity",
    keywords: ["job", "hire", "position", "role", "employment", "freelance", "contract", "recruit"],
  },
  {
    id: "general",
    label: "General message",
    description: "Anything else — I'll get back to you",
    email: "hello@kofiyesu.dev",
    subject: "Portfolio contact",
    keywords: [],
  },
];

export const getInquiryRoute = (type: InquiryType): InquiryRoute => {
  return inquiryRoutes.find((r) => r.id === type) ?? inquiryRoutes[inquiryRoutes.length - 1]!;
};

export const buildMailtoUrl = (route: InquiryRoute, message: string): string => {
  const body = encodeURIComponent(message.trim() || "Hi Kofi,\n\n");
  const subject = encodeURIComponent(route.subject);
  return `mailto:${route.email}?subject=${subject}&body=${body}`;
};
