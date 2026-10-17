import type { ExperienceEntry } from "./types";

/**
 * Formal work experience only — independently built products live in
 * `src/data/projects.ts`. To add a role, append an entry here.
 *
 * Keep dates and titles accurate. If a full date range is unverified, show
 * only the period that is documented.
 */
export const experience: ExperienceEntry[] = [
  {
    id: "aib-consulting",
    organization: "AIB Consulting",
    role: "Cybersecurity & IT Analyst Intern",
    period: "2026",
    summary:
      "Hands-on IT support and security work documented across a September 2026 reporting period.",
    responsibilities: [
      "Installed, troubleshot, and configured network printers.",
      "Resolved DNS and nameserver issues affecting connectivity.",
      "Administered domains, hosting, and cPanel environments.",
      "Performed authorized website security reviews.",
      "Contributed to software engineering work on SOPF and Driver Connect.",
      "Produced technical documentation and system troubleshooting records.",
    ],
    technologies: ["Networking", "DNS", "cPanel", "Web hosting", "Security reviews"],
  },
];
