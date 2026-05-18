export const social = [
  { url: "mailto:hello@kheliancart.com", name: "mail" },
  { url: "https://github.com/kofiyesu", name: "github" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
