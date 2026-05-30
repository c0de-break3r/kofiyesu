export const contactEmail = "hello@kofiyesu.com";

export const social = [
  { url: `mailto:${contactEmail}`, name: "mail" },
  { url: "https://github.com/kofiyesu", name: "github" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
