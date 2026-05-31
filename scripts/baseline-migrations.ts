/**
 * One-time baseline for databases created with `prisma db push` before migrate deploy.
 * Marks all existing migrations as applied without running SQL.
 */
import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const migrationsDir = path.join(process.cwd(), "prisma/migrations");
const names = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (names.length === 0) {
  console.error("No migrations found in prisma/migrations");
  process.exit(1);
}

console.log(`Baselining ${names.length} migration(s)...`);

for (const name of names) {
  console.log(`→ ${name}`);
  execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: "inherit" });
}

console.log("Done. Run `npm run db:migrate` to verify.");
