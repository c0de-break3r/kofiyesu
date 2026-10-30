/**
 * Personal profile content — the single source of truth for who I am,
 * where to reach me, and what I work with. Edit freely; the whole site reads
 * from here.
 */

export const profile = {
  name: "Obed Prince Kofi Yesu",
  shortName: "Kofi Yesu",
  /** Shown under the name in the hero and page headers. */
  title: "Software Engineer · AI & Automation · Cybersecurity",
  location: "Accra, Ghana",
  /** Compact hero introduction. */
  intro:
    "I'm a software engineer based in Accra, Ghana. I build web applications, explore AI-driven products, and develop practical solutions with security in mind.",

  /** One-line philosophy — shown in the hero and reused across page headers. */
  tagline: "Build with purpose. Automate with intent. Secure by design.",

  /**
   * Full-width hero background image (e.g. `/hero-bg.webp`).
   * Place the file in `public/` and set this to the URL path, or leave empty
   * to skip the layer.
   */
  heroImage: "" as string,

  /** Longer biography for the About page. */
  bio: [
    "I'm a software engineer who likes taking ideas all the way to working products — the interface, the API, the data layer, and the details that keep things reliable once real people use them.",
    "My work spans full-stack web applications, practical AI and automation features, and security-minded engineering. I care about clean, maintainable code and products that feel straightforward to use.",
    "Alongside building, I have hands-on cybersecurity experience — authorized reviews, API and application security, and secure development practices baked into how I ship.",
  ],

  email: "hello@kofiyesu.com",
  github: "https://github.com/c0de-break3r",
  /** Replace with your actual LinkedIn profile URL. */
  linkedin: "https://www.linkedin.com/in/kofiyesu",

  /** Concise technical expertise — replaces the old services/capabilities grid. */
  expertise: [
    {
      title: "Full-stack web",
      body: "React, Next.js, TypeScript, Node.js and Express — from data model to a polished, responsive interface.",
    },
    {
      title: "AI & automation",
      body: "AI-assisted product features and workflow automation grounded in real, repeatable tasks.",
    },
    {
      title: "Security-minded delivery",
      body: "Application and API security, authorized reviews, and secure development practices built into delivery.",
    },
    {
      title: "Data & reliability",
      body: "PostgreSQL-backed architectures, deployment, and monitoring so products stay dependable in production.",
    },
  ],

  /** Areas of interest — mirrors the c0de-break3r profile README. */
  interests: [
    "Full-Stack Development",
    "Artificial Intelligence",
    "SaaS Engineering",
    "Automation",
    "Cybersecurity",
  ],

  /** What I'm focused on — from the profile README. */
  focus: [
    {
      icon: "🚀",
      title: "Software Engineering",
      body: "Building scalable web applications, APIs, dashboards, and digital platforms.",
    },
    {
      icon: "🤖",
      title: "AI & Automation",
      body: "Developing intelligent workflows, AI-assisted applications, and productivity tools.",
    },
    {
      icon: "🛡️",
      title: "Cybersecurity",
      body: "Offensive security, vulnerability assessment, reconnaissance, and secure development.",
    },
    {
      icon: "🧩",
      title: "SaaS Products",
      body: "Transforming real-world problems into practical, sustainable software products.",
    },
    {
      icon: "📚",
      title: "Continuous Learning",
      body: "Improving system design, application architecture, and engineering practices.",
    },
  ],

  /** Engineering & security philosophy — from the profile README. */
  philosophy: {
    quote:
      "Great software isn't just about making things work. It's about understanding how they work, where they can fail, and how to build them better.",
    body: "I approach development with a security-first mindset — weighing reliability, maintainability, performance, and potential attack surfaces throughout the engineering process. My security interests span web application testing, reconnaissance, attack surface analysis, and automating repetitive security tasks in authorized environments.",
  },

  /** Categorized technology stack — from the profile README. */
  techStack: [
    { category: "Languages", tools: ["TypeScript", "JavaScript", "Python", "Bash", "HTML", "CSS"] },
    { category: "Frontend & UI", tools: ["React", "Next.js", "Tailwind CSS", "Vite"] },
    { category: "Backend & Runtime", tools: ["Node.js", "Express", "Bun"] },
    { category: "Databases & Infrastructure", tools: ["PostgreSQL", "MySQL", "MongoDB", "Docker", "Vercel"] },
    { category: "Development Tools", tools: ["Git", "GitHub", "VS Code", "Linux", "Postman"] },
  ],

  /** Let's connect copy — from the profile README. */
  connect: {
    blurb:
      "I'm interested in connecting with developers, founders, engineers, and teams working on meaningful technology.",
    openTo: [
      "Full-stack engineering",
      "AI-powered applications",
      "SaaS development",
      "Automation",
      "Cybersecurity",
    ],
  },

  /** Products in active development — sourced from the c0de-break3r profile README. */
  currentlyBuilding: [
    {
      name: "SOCANA AI",
      description: "AI product development focused on intelligent digital experiences.",
      focus: ["AI", "Product Engineering"],
    },
    {
      name: "CineFlow",
      description: "AI-powered creative production platform for generating and managing visual content.",
      focus: ["AI", "SaaS", "Creative Tools"],
    },
    {
      name: "Barbers Eazy Connect",
      description: "Barber booking and business management for walk-ins, home services, and operations.",
      focus: ["Marketplace", "Booking", "SaaS"],
    },
    {
      name: "Africana Mobility Service",
      description: "Digital mobility platform connecting transportation services with customers.",
      focus: ["Mobility", "Full-Stack"],
    },
    {
      name: "DocxBase",
      description: "Document-focused SaaS exploring smarter document workflows and productivity.",
      focus: ["Documents", "SaaS"],
    },
  ],

  /** Technologies used across real projects — shown on the About page. */
  technologies: [
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Vite",
    "Node.js",
    "Express",
    "Bun",
    "Python",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Docker",
    "Vercel",
    "Git",
    "GitHub",
    "Linux",
    "Postman",
  ],
} as const;

export type Profile = typeof profile;
