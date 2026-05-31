import type { VercelRequest, VercelResponse } from "@vercel/node";
import { firstPathSegment } from "../lib/routePath.js";
import aboutHandler from "../lib/routes/site/about.js";
import featuresHandler from "../lib/routes/site/features.js";
import projectsHandler from "../lib/routes/site/projects.js";

const routes = {
  about: aboutHandler,
  features: featuresHandler,
  projects: projectsHandler,
} as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segment = firstPathSegment(req);
  const route = segment ? routes[segment as keyof typeof routes] : undefined;
  if (!route) {
    return res.status(404).json({ error: "Not found" });
  }
  return route(req, res);
}
