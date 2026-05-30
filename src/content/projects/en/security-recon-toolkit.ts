import type { ProjectContent } from "../../types";

export default {
  title: "Recon Automation Toolkit",
  theme: "light",
  tags: ["node", "javascript", "postgresql"],
  videoBorder: false,
  description:
    "Python and Bash tooling for bug bounty recon — asset discovery, scope tracking, and repeatable scan pipelines.",
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
} as const satisfies ProjectContent;
