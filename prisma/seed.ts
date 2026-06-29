import { prisma } from "../api/lib/prisma.js";
import { defaultAbout } from "../src/content/about";

const featureDefs = [
  { slug: "web-application", label: "Web Application", sortOrder: 0 },
  { slug: "mobile-application", label: "Mobile Application", sortOrder: 1 },
  { slug: "recon-automation-tool", label: "Recon Automation Tool", sortOrder: 2 },
] as const;

const projects = [
  {
    slug: "kheliancart",
    title: "KhelianCart",
    theme: "light",
    categorySlug: "web-application",
    techStack: ["Node.js", "PostgreSQL", "Express.js", "JavaScript", "HTML", "CSS"],
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
    theme: "light",
    categorySlug: "recon-automation-tool",
    techStack: ["Node.js", "JavaScript", "PostgreSQL", "Python", "Bash"],
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
    categorySlug: "web-application",
    techStack: ["Node.js", "PostgreSQL", "React", "REST API"],
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
    },
    update: {
      displayName: "Obed Prince Kofi Yesu",
      jobTitle: defaultAbout.job_title,
      aboutIntro: defaultAbout.about_intro,
      aboutTagline: defaultAbout.about_tagline,
      location: defaultAbout.location,
    },
  });

  const featureIds = new Map<string, string>();
  for (const feature of featureDefs) {
    const row = await prisma.siteFeature.upsert({
      where: { slug: feature.slug },
      create: {
        slug: feature.slug,
        label: feature.label,
        sortOrder: feature.sortOrder,
        published: true,
      },
      update: {
        label: feature.label,
        sortOrder: feature.sortOrder,
        published: true,
      },
    });
    featureIds.set(feature.slug, row.id);
  }

  for (const p of projects) {
    await prisma.siteProject.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        theme: p.theme,
        categoryId: featureIds.get(p.categorySlug) ?? null,
        techStack: p.techStack,
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
        categoryId: featureIds.get(p.categorySlug) ?? null,
        techStack: p.techStack,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        liveUrl: "liveUrl" in p ? p.liveUrl : null,
        components: p.components,
        sortOrder: p.sortOrder,
        published: true,
      },
    });
  }

  console.log(
    "Seed complete: site_about +",
    featureDefs.length,
    "features +",
    projects.length,
    "projects"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
