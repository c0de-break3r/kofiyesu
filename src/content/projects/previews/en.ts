import thumbnailKheliancart from "../../../assets/thumbnails/kheliancart.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "KhelianCart",
    slug: "kheliancart",
    thumbnail: thumbnailKheliancart,
    description: "Grocery ecommerce · Ho, Ghana",
    tags: ["node", "postgresql", "javascript", "html"],
  },
  {
    title: "Recon Automation Toolkit",
    slug: "security-recon-toolkit",
    thumbnail: "/meta/logo-avatar.png",
    description: "Recon & automation for bug bounty workflows",
    tags: ["node", "javascript", "postgresql"],
  },
  {
    title: "API Pentest Workflows",
    slug: "api-pentest-workflows",
    thumbnail: "/meta/logo-avatar.png",
    description: "REST API security testing methodology",
    tags: ["node", "postgresql", "react"],
  },
] as const satisfies ProjectPreview[];
