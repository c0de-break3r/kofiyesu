import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Neon pooler URLs break migrate advisory locks — use a direct host for CLI migrations. */
function migrationDatabaseUrl(): string {
  const explicit =
    process.env.DIRECT_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim();
  if (explicit) return explicit;

  const pooled = process.env.DATABASE_URL?.trim();
  if (!pooled) {
    return "postgresql://placeholder:placeholder@localhost:5432/placeholder";
  }

  try {
    const url = new URL(pooled);
    if (url.hostname.includes("-pooler")) {
      url.hostname = url.hostname.replace("-pooler", "");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "30");
    }
    return url.toString();
  } catch {
    return pooled;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationDatabaseUrl(),
  },
});
