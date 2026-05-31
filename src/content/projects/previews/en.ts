import thumbnailKheliancart from "../../../assets/thumbnails/kheliancart.webp";
import { staticFeatureBySlug } from "@/content/features";
import type { ProjectPreview } from "../../types";

const web = staticFeatureBySlug["web-application"];
const recon = staticFeatureBySlug["recon-automation-tool"];

export default [
  {
    title: "KhelianCart",
    slug: "kheliancart",
    thumbnail: thumbnailKheliancart,
    description: "Grocery ecommerce · Ho, Ghana",
    categoryId: web.id,
    categoryLabel: web.label,
    sortOrder: 0,
  },
  {
    title: "Recon Automation Toolkit",
    slug: "security-recon-toolkit",
    thumbnail: "/meta/portrait.png",
    description: "Recon & automation for bug bounty workflows",
    categoryId: recon.id,
    categoryLabel: recon.label,
    sortOrder: 1,
  },
  {
    title: "API Pentest Workflows",
    slug: "api-pentest-workflows",
    thumbnail: "/meta/portrait.png",
    description: "REST API security testing methodology",
    categoryId: web.id,
    categoryLabel: web.label,
    sortOrder: 2,
  },
] as const satisfies ProjectPreview[];
