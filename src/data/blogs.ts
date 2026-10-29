import type { BlogPost } from "./types";

/**
 * Writing / blog entries surfaced on the home one-pager.
 *
 * These are placeholders — replace with your real posts (or links to
 * dev.to / Hashnode / personal blog). The section only renders when this
 * array has at least one entry.
 */
export const blogs: BlogPost[] = [
  {
    slug: "building-secure-apis",
    title: "Building Secure APIs from Scratch",
    excerpt:
      "Lessons learned hardening a production Express + PostgreSQL API — auth, rate-limiting, input validation, and the OWASP top-10 in practice.",
    date: "2026-06-12",
    readingTime: 8,
    tag: "Security",
  },
  {
    slug: "ai-augmented-workflows",
    title: "Practical AI-Augmented Workflows",
    excerpt:
      "How I wired OpenAI and Anthropic models into everyday developer tooling — code review bots, auto-labeling, and document pipelines.",
    date: "2026-05-03",
    readingTime: 6,
    tag: "AI",
  },
  {
    slug: "react-performance",
    title: "Shipping a Fast React Portfolio",
    excerpt:
      "A walkthrough of the build, bundle, and render optimizations that kept this site under 100 KB gzipped with a 98 Lighthouse score.",
    date: "2026-04-18",
    readingTime: 7,
    tag: "Performance",
  },
];
