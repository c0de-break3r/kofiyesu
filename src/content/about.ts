export const defaultAbout = {
  job_title: "Software Engineer · AI Product Builder · Cybersecurity Practitioner",
  location: "Accra, Ghana",
  about_intro: [
    "Software Engineer, AI product builder and Cybersecurity Practitioner based in Accra, Ghana, specializing in secure, scalable and production-ready web and mobile applications. Experienced in modern full-stack development across the JavaScript and TypeScript ecosystems, with strong expertise in React, Next.js, React Native with Expo, Node.js, Express.js, Vite, Tailwind CSS and shadcn/ui.",
    "Skilled at building high-performance products with scalable backend architectures, REST APIs, real-time systems and data layers across PostgreSQL (Neon), Supabase, MongoDB and Firebase Firestore. I ship AI-assisted features and automations that solve real workflows, and use monitoring platforms such as Sentry and PostHog to improve reliability, performance and user experience across production environments.",
    "Strong cybersecurity background spanning application security, API security, security automation, authentication security, penetration-testing fundamentals and secure software development practices. Passionate about creating digital products that combine exceptional user experiences with strong security foundations and scalable architecture.",
  ].join("\n\n"),
  about_tagline:
    "Driven by a long-term vision of building interactive, immersive, and gamified platforms inspired by modern digital ecosystems and social gaming experiences — creating applications that encourage creativity, collaboration, engagement, and digital identity at scale.",
  services: [
    {
      name: "Full-Stack Web & Mobile",
      info: "React, Next.js, React Native with Expo, TypeScript, Vite, Tailwind CSS, and shadcn/ui — from landing pages to cross-platform mobile apps.",
    },
    {
      name: "Secure Backend & REST APIs",
      info: "Node.js and Express APIs with validation, structured error handling, rate limiting, and architectures built for production traffic.",
    },
    {
      name: "Application & API Security",
      info: "Secure SDLC practices, OWASP-aware reviews, API hardening, auth security, and penetration-testing fundamentals baked into delivery.",
    },
    {
      name: "AI & Automation",
      info: "AI-assisted product features, intelligent assistants, workflow automation and real-time systems that stay reliable under real user load.",
    },
    {
      name: "PostgreSQL & Cloud Data",
      info: "PostgreSQL on Neon, MongoDB, Firebase Firestore, migrations, branching, and data layers that scale with the product.",
    },
    {
      name: "Production Observability",
      info: "Sentry for errors, PostHog for product analytics, logging, and monitoring so issues surface before users report them.",
    },
  ],
} as const;

export const defaultAboutIntroParagraphs = defaultAbout.about_intro.split(/\n\n+/);

/** Split CMS intro into scroll-story paragraphs (needs 2+ for cross-fade). */
export function splitAboutIntro(introRaw: string): string[] {
  const trimmed = introRaw.trim();
  if (!trimmed) return [...defaultAboutIntroParagraphs];

  const byDouble = trimmed.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  if (byDouble.length > 1) return byDouble;

  const bySingle = trimmed
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
  if (bySingle.length > 1) return bySingle;

  return [trimmed];
}

export const siteMetaDescription =
  "Software Engineer, AI product builder and Cybersecurity Practitioner in Accra, Ghana. Full-stack web and mobile products with React, Next.js, React Native, Node.js, PostgreSQL and secure, production-ready architecture.";
