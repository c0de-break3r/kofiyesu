export const SITE_URL = "https://www.kofiyesu.com";

export const SITE_NAME = "Obed Prince Kofi Yesu";

export const SITE_SHORT_NAME = "Kofi Yesu";

export const SITE_TITLE =
  "Obed Prince Kofi Yesu — Software Engineer · AI & Automation · Cybersecurity";

export const SITE_TAGLINE = "Software Engineering · AI & Automation · Cybersecurity · Accra, Ghana";

export const SITE_DESCRIPTION =
  "Portfolio of Obed Prince Kofi Yesu, a software engineer in Accra, Ghana — web applications, AI and automation tools, and security-minded engineering.";

export const SITE_KEYWORDS = [
  "Obed Prince Kofi Yesu",
  "Kofi Yesu",
  "software engineer Ghana",
  "cybersecurity",
  "full-stack developer",
  "React developer",
  "Next.js",
  "TypeScript portfolio",
  "application security",
  "API security",
  "PostgreSQL",
  "AI and automation",
  "web developer Ghana",
].join(", ");

export const OG_IMAGE_PATH = "/meta/icon-512.png";

export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;

export const PWA_DESCRIPTION =
  "Portfolio of Obed Prince Kofi Yesu — software projects, experience, and contact. Install for quick access.";

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
    jobTitle: "Software Engineer · AI & Automation · Cybersecurity",
    address: {
      "@type": "PostalAddress",
      addressCountry: "GH",
    },
    sameAs: ["https://github.com/c0de-break3r", "https://kofiyesu.com"],
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
