import { servicePackages, formatGhs } from "@/content/payments";

export type ChatPackageOption = {
  id: string;
  title: string;
  amountGhs: number;
  description: string;
  highlights: readonly string[];
  featured?: boolean;
};

export const chatPackages: ChatPackageOption[] = servicePackages.map((pkg) => ({
  id: pkg.id,
  title: pkg.title,
  amountGhs: pkg.amountGhs,
  description: pkg.description,
  highlights: pkg.highlights,
  featured: "featured" in pkg && pkg.featured === true,
}));

export function formatPackagesForReply(): string {
  return chatPackages
    .map((p) => `**${p.title}** — ${formatGhs(p.amountGhs)}: ${p.description}`)
    .join("\n");
}
