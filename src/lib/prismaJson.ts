import type { Prisma } from "../../generated/prisma/client";

/** Coerce request JSON to a value Prisma accepts on `Json` fields. */
export function toInputJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}
