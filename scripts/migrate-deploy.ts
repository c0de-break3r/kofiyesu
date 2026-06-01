/**
 * Deploy migrations with retries (Neon cold start / advisory lock timeouts on CI).
 * Uses DIRECT_DATABASE_URL when set; otherwise prisma.config.ts derives a direct URL.
 */
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 5;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    console.log(`[db:migrate] attempt ${attempt}/${MAX_ATTEMPTS}`);
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: {
        ...process.env,
        // Neon + serverless: pooled/direct latency can exceed Prisma's 10s advisory-lock wait.
        PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK: "true",
      },
    });
    console.log("[db:migrate] success");
    process.exit(0);
  } catch {
    if (attempt === MAX_ATTEMPTS) {
      console.error("[db:migrate] failed after all retries");
      process.exit(1);
    }
    const waitSec = attempt * 8;
    console.warn(`[db:migrate] timed out or failed — retrying in ${waitSec}s…`);
    await sleep(waitSec * 1000);
  }
}
