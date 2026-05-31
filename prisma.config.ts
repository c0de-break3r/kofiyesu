import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Generate only needs a valid URL shape; db push/migrate uses the real DATABASE_URL.
    url:
      process.env.DATABASE_URL?.trim() ||
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
