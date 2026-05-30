import { siteMetaDescription } from "@/content/about";

export const SITE_URL = "https://www.kofiyesu.com";

export const SITE_NAME = "Obed Prince Kofi Yesu";

export const SITE_SHORT_NAME = "Kofi Yesu";

export const SITE_TITLE =
  "Obed Prince Kofi Yesu — Software Engineer & Cybersecurity Practitioner";

export const SITE_TAGLINE = "Full-stack · Mobile · Application Security · Ghana";

export const SITE_DESCRIPTION = siteMetaDescription;

export const SITE_KEYWORDS = [
  "Obed Prince Kofi Yesu",
  "Kofi Yesu",
  "software engineer Ghana",
  "cybersecurity practitioner",
  "full-stack developer",
  "React developer",
  "Next.js",
  "React Native",
  "Node.js",
  "TypeScript portfolio",
  "application security",
  "API security",
  "PostgreSQL",
  "Clerk authentication",
  "web developer Ghana",
].join(", ");

export const OG_IMAGE_PATH = "/meta/icon-512.png";

export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

export const PWA_DESCRIPTION =
  "Portfolio of Obed Prince Kofi Yesu — projects, about, and chat. Install for quick access and a smoother experience.";

export const STATIC_PROJECT_SLUGS = [
  "kheliancart",
  "security-recon-toolkit",
  "api-pentest-workflows",
] as const;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPersonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_NAME,
    url: SITE_URL,
    image: OG_IMAGE_URL,
    jobTitle: "Software Engineer & Cybersecurity Practitioner",
    address: {
      "@type": "PostalAddress",
      addressCountry: "GH",
    },
    sameAs: ["https://github.com/kofiyesu", "https://kofiyesu.com"],
    description: SITE_DESCRIPTION,
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: SITE_NAME,
    },
  };
}
