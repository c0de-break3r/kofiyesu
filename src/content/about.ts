export const defaultAbout = {
  job_title: "Software Engineer & Cybersecurity Practitioner",
  location: "Ghana",
  about_intro: [
    "Software Engineer and Cybersecurity Practitioner based in Ghana, specializing in secure, scalable, and production-ready web and mobile applications. Experienced in modern full-stack development using JavaScript and TypeScript ecosystems, with strong expertise in React, Next.js, React Native with Expo, Node.js, Express.js, Vite, Tailwind CSS, and shadcn/ui.",
    "Skilled in building high-performance applications with modern authentication systems using Clerk, scalable backend architectures, REST APIs, real-time systems, and database solutions including PostgreSQL, Neon, Supabase, MongoDB, and Firebase Firestore. Experienced with monitoring and analytics platforms such as Sentry and PostHog to improve reliability, performance, and user experience across production environments.",
    "Strong cybersecurity background with knowledge in application security, API security, security automation, authentication security, penetration testing fundamentals, and secure software development practices. Passionate about creating digital products that combine exceptional user experiences with strong security foundations and scalable architecture.",
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
      name: "Auth & Real-time Systems",
      info: "Clerk authentication, session and role models, WebSockets, and live features that stay reliable under real user load.",
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
  "Software Engineer and Cybersecurity Practitioner in Ghana. Full-stack web and mobile apps with React, Next.js, React Native, Node.js, Clerk, PostgreSQL, and secure, production-ready architecture.";

export const chatAssistantBio =
  "Software Engineer & Cybersecurity Practitioner from Ghana — full-stack (React, Next.js, React Native, Node.js, TypeScript), Clerk auth, PostgreSQL/Neon/Supabase, application security, and production observability with Sentry and PostHog.";
