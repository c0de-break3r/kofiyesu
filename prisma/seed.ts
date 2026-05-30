import { PrismaClient } from "@prisma/client";
import { defaultAbout } from "../src/content/about";

const prisma = new PrismaClient();

const projects = [
  {
    slug: "kheliancart",
    title: "KhelianCart",
    theme: "dark",
    tags: ["node", "postgresql", "javascript", "html", "css"],
    description:
      "Grocery ecommerce platform for Ho, Ghana — catalog, cart, checkout, and delivery partner workflows.",
    thumbnailUrl: "/thumbnails/kheliancart.webp",
    liveUrl: "https://kheliancart.com",
    sortOrder: 0,
    components: [
      {
        type: "media",
        props: {
          type: "image",
          src: "/thumbnails/kheliancart.webp",
          alt: "KhelianCart grocery ecommerce",
          caption: "KhelianCart — grocery delivery in Ho, Ghana",
        },
      },
      {
        type: "text",
        props: {
          title: "What I built",
          text: "Full-stack grocery ecommerce: product catalog, cart, checkout, delivery partner flows, and admin-ready backend APIs with validation and secure coding practices.",
        },
      },
      {
        type: "list",
        props: {
          title: "Stack & focus",
          size: "md",
          items: [
            "Node.js / Express APIs",
            "PostgreSQL data layer",
            "Web and mobile-friendly storefront",
            "Secure payments and order workflows",
          ],
        },
      },
    ],
  },
  {
    slug: "security-recon-toolkit",
    title: "Recon Automation Toolkit",
    theme: "dark",
    tags: ["node", "javascript", "postgresql"],
    description:
      "Python and Bash tooling for bug bounty recon — asset discovery, scope tracking, and repeatable scan pipelines.",
    thumbnailUrl: "/meta/logo-avatar.png",
    sortOrder: 1,
    components: [
      {
        type: "text",
        props: {
          title: "Overview",
          text: "A modular recon toolkit that chains subdomain enumeration, HTTP probing, and findings export into structured reports for web application assessments.",
        },
      },
      {
        type: "list",
        props: {
          title: "Capabilities",
          size: "md",
          items: [
            "Scope-aware asset inventory",
            "Scheduled diffing between runs",
            "JSON export for reporting workflows",
            "CLI-friendly for CI and local hunts",
          ],
        },
      },
    ],
  },
  {
    slug: "api-pentest-workflows",
    title: "API Pentest Workflows",
    theme: "light",
    tags: ["node", "postgresql", "react"],
    description:
      "Methodology and automation for testing REST APIs — auth flows, IDOR checks, and rate-limit validation.",
    thumbnailUrl: "/meta/logo-avatar.png",
    sortOrder: 2,
    components: [
      {
        type: "text",
        props: {
          title: "Approach",
          text: "Structured API reviews combining manual testing with scripted probes for authentication, authorization, input validation, and business-logic edge cases.",
        },
      },
      {
        type: "list",
        props: {
          title: "Deliverables",
          size: "md",
          items: [
            "Threat-modeled test cases per endpoint",
            "Evidence-backed finding write-ups",
            "Remediation priorities for dev teams",
            "Optional re-test verification",
          ],
        },
      },
    ],
  },
] as const;

async function main() {
  await prisma.siteAbout.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      displayName: "Obed Prince Kofi Yesu",
      jobTitle: defaultAbout.job_title,
      aboutIntro: defaultAbout.about_intro,
      aboutTagline: defaultAbout.about_tagline,
      location: defaultAbout.location,
      services: defaultAbout.services,
    },
    update: {
      displayName: "Obed Prince Kofi Yesu",
      jobTitle: defaultAbout.job_title,
      aboutIntro: defaultAbout.about_intro,
      aboutTagline: defaultAbout.about_tagline,
      location: defaultAbout.location,
      services: defaultAbout.services,
    },
  });

  for (const p of projects) {
    await prisma.siteProject.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        theme: p.theme,
        tags: p.tags,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        liveUrl: "liveUrl" in p ? p.liveUrl : null,
        components: p.components,
        sortOrder: p.sortOrder,
        published: true,
      },
      update: {
        title: p.title,
        theme: p.theme,
        tags: p.tags,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        liveUrl: "liveUrl" in p ? p.liveUrl : null,
        components: p.components,
        sortOrder: p.sortOrder,
        published: true,
      },
    });
  }

  console.log("Seed complete: site_about +", projects.length, "projects");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
