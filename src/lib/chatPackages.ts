import { defaultPricingPackages } from "./defaultPricingPackages";

export const CHAT_PAYMENT_PACKAGES = defaultPricingPackages.map((pkg) => ({
  id: pkg.slug,
  slug: pkg.slug,
  title: pkg.title,
  amountGhs: Number(pkg.amountGhs),
  description: pkg.description,
  highlights: [...pkg.highlights],
  featured: pkg.featured ?? false,
}));

export const CHAT_PACKAGES_PROMPT = CHAT_PAYMENT_PACKAGES.map(
  (p) => `- **${p.title}** (\`${p.id}\`): GH₵${p.amountGhs} — ${p.description}`,
).join("\n");
