export const en = {
  about: "About",
  home: "Home",
  projects: "Projects",
  contact: "Contact",
  "job-title": "Software Engineer · AI Product Builder · Cybersecurity Practitioner",
  location: "Accra, Ghana",
  "start-a-project": "Start a project",
  "view-work": "View work",
  "explore-work": "Explore my work",
  "let-connect": "Let's connect",
  "hero-eyebrow": "Portfolio",
  "hero-intro":
    "I'm Obed Prince Kofi Yesu, a software engineer and AI product builder based in Ghana. I create thoughtful digital experiences with strong engineering and security foundations.",
  "capabilities-kicker": "What I do",
  "capabilities-heading": "Engineering products end to end",
  "selected": "Selected",
  "projects-subtitle": "Secure full-stack products, scalable backends, and security-focused builds from recent work.",
  "back-to-home": "Back to home",
  "toggle-theme": "Toggle theme",
  "live-view": "View live",
  "source-code": "Source code",
  "next-project": "Next project",
  "project-not-found": "Project not found",
  "back-to-work": "Back to work",
  "scroll-explore": "Scroll to explore",
  "contact-headline": "Let's work together",
  "contact-subtitle": "Chat about projects, pentesting, or collaboration.",
  "download-cv": "Download résumé",
  "view-github": "View GitHub",
  "get-in-touch": "Get in touch",
  "filter-all": "All",
  "filter-feature": "Feature",
  services: "Services",
  "whatsapp-cta": "WhatsApp Obed",
} as const;

export type MessageKey = keyof typeof en;

export const t = (key: MessageKey, vars?: Record<string, string | number>) => {
  let text: string = en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
};
