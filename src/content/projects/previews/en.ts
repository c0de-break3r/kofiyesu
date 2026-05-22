import thumbnailKheliancart from "../../../assets/thumbnails/kheliancart.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "KhelianCart",
    slug: "kheliancart",
    thumbnail: thumbnailKheliancart,
    description: "Grocery ecommerce · Ho, Ghana",
  },
  {
    title: "Recon Automation Toolkit",
    slug: "security-recon-toolkit",
    thumbnail: "/meta/logo-avatar.png",
    description: "Recon & automation for bug bounty workflows",
  },
  {
    title: "API Pentest Workflows",
    slug: "api-pentest-workflows",
    thumbnail: "/meta/logo-avatar.png",
    description: "REST API security testing methodology",
  },
] as const satisfies ProjectPreview[];
