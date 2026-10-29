import kheliancart0 from "@/assets/images/projects/kheliancart/kheliancart-0.webp";
import kheliancartShop from "@/assets/images/projects/kheliancart/kheliancart-shop.png";
import type { Project } from "./types";

/**
 * All portfolio projects. To add one, append an entry here and drop its
 * screenshots into `src/assets/images/projects/<slug>/` (or `public/projects/`).
 * The /projects grid and each /project/:slug page render automatically.
 *
 * Keep every field honest — only include years, links, and screenshots that
 * actually exist.
 */
export const projects: Project[] = [
  {
    slug: "kheliancart",
    title: "KhelianCart",
    category: "web",
    status: "live",
    year: 2025,
    summary:
      "Grocery ecommerce platform for Ho, Ghana — catalog, cart, checkout, and delivery-partner workflows.",
    thumbnail: kheliancartShop,
    hero: {
      src: kheliancart0,
      alt: "KhelianCart grocery ecommerce storefront",
    },
    overview:
      "KhelianCart is a grocery ecommerce platform built for Ho, Ghana — farm-fresh produce, category browsing, cart and checkout, and local delivery. It pairs a mobile-friendly storefront with a secure backend for orders and delivery partners.",
    problem:
      "Local shoppers and vendors needed a simple, trustworthy way to buy and deliver fresh groceries online without relying on generic, ill-fitting marketplace tools.",
    features: [
      "Product catalog with category browsing",
      "Cart and secure checkout",
      "Delivery-partner order workflows",
      "Admin-ready backend APIs",
    ],
    contribution:
      "Designed and built the full stack — storefront, REST APIs, PostgreSQL data layer, and order/delivery flows — with validation and secure coding practices throughout.",
    stack: ["Node.js", "Express.js", "PostgreSQL", "JavaScript", "HTML", "CSS"],
    liveUrl: "https://kheliancart.com",
    sortOrder: 0,
  },
  {
    slug: "driver-connect",
    title: "Driver Connect",
    category: "mobile",
    status: "beta",
    summary:
      "A driver connectivity platform with a mobile app and web dashboard — trip and driver coordination built as a TypeScript monorepo.",
    overview:
      "Driver Connect pairs a mobile app for drivers with a web dashboard for coordination. It is structured as a Turborepo monorepo with an Expo mobile client, a web client, and a Convex-backed real-time data layer.",
    problem:
      "Drivers and coordinators needed a shared, real-time view of trips and status instead of scattered calls and messages, across both phone and desktop.",
    features: [
      "Expo mobile client for drivers",
      "Web dashboard for coordination",
      "Real-time data layer with Convex",
      "Supabase-backed schema and auth",
    ],
    contribution:
      "Built and maintain the monorepo — mobile and web clients, data schema, and the real-time coordination logic.",
    stack: ["TypeScript", "React Native (Expo)", "React", "Convex", "Supabase", "Turborepo"],
    liveUrl: "https://driver-connect-web.vercel.app",
    sourceUrl: "https://github.com/c0de-break3r/driver-connect",
    sortOrder: 1,
  },
  {
    slug: "security-recon-toolkit",
    title: "Recon Automation Toolkit",
    category: "security",
    status: "in-development",
    summary:
      "Python and Bash tooling for bug bounty recon — asset discovery, scope tracking, and repeatable scan pipelines.",
    overview:
      "A modular recon toolkit that chains subdomain enumeration, HTTP probing, and findings export into structured reports for web application assessments.",
    problem:
      "Manual reconnaissance is slow and easy to lose track of across engagements; repeatable, scope-aware pipelines keep asset discovery consistent and reportable.",
    features: [
      "Scope-aware asset inventory",
      "Scheduled diffing between runs",
      "JSON export for reporting workflows",
      "CLI-friendly for CI and local hunts",
    ],
    contribution:
      "Built the tooling and pipelines — enumeration and probing chained into structured, exportable findings.",
    stack: ["Python", "Bash", "Node.js", "JavaScript"],
    sortOrder: 1,
  },
  {
    slug: "api-pentest-workflows",
    title: "API Pentest Workflows",
    category: "security",
    status: "in-development",
    summary:
      "Methodology and automation for testing REST APIs — auth flows, IDOR checks, and rate-limit validation.",
    overview:
      "Structured API reviews combining manual testing with scripted probes for authentication, authorization, input validation, and business-logic edge cases.",
    problem:
      "APIs fail in subtle, business-specific ways that generic scanners miss; a repeatable methodology with evidence-backed write-ups makes findings actionable.",
    features: [
      "Threat-modeled test cases per endpoint",
      "Evidence-backed finding write-ups",
      "Remediation priorities for dev teams",
      "Optional re-test verification",
    ],
    contribution:
      "Developed the testing methodology and the scripted probes that support it.",
    stack: ["REST API", "Node.js", "Python"],
    sortOrder: 2,
  },
];
