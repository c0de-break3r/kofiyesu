export const defaultPricingPackages = [
  {
    slug: "discovery",
    title: "Discovery session",
    amountGhs: 150,
    description: "30-minute scoping call — goals, timeline, stack, and fit.",
    highlights: ["Video or async brief", "Written next steps", "No commitment"],
    featured: false,
    sortOrder: 0,
  },
  {
    slug: "deposit",
    title: "Project kickoff",
    amountGhs: 500,
    description: "Reserve a build slot and start technical discovery.",
    highlights: ["Priority scheduling", "Architecture outline", "Milestone plan"],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "audit",
    title: "Security review",
    amountGhs: 800,
    description: "Focused review of your app, API, or auth flows.",
    highlights: ["OWASP-aligned checks", "Findings report", "Fix recommendations"],
    featured: false,
    sortOrder: 2,
  },
] as const;

export const fallbackPackageAmounts = Object.fromEntries(
  defaultPricingPackages.map((pkg) => [
    pkg.slug,
    { title: pkg.title, amountGhs: pkg.amountGhs, description: pkg.description },
  ]),
);
