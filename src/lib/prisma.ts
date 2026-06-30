import dns from "node:dns/promises";
import { Pool, type PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

async function createPgPool(connectionString: string): Promise<Pool> {
  const url = new URL(connectionString);
  const hostname = url.hostname;

  let host = hostname;
  try {
    const { address } = await dns.lookup(hostname, { family: 4 });
    host = address;
  } catch {
    // Fall back to hostname if IPv4 lookup fails.
  }

  const config: PoolConfig = {
    host,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: true, servername: hostname },
    max: 10,
    connectionTimeoutMillis: 15_000,
  };

  return new Pool(config);
}

async function createPrismaClient(): Promise<PrismaClient> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = await createPgPool(connectionString);
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? (await createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const isDatabaseConfigured = () => Boolean(process.env.DATABASE_URL?.trim());
