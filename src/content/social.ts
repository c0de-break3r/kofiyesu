export const social = [
  { url: "mailto:hello@kofiyesu.dev", name: "mail" },
  { url: "https://github.com/kofiyesu", name: "github" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" }[];
