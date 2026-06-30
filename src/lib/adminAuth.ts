import type { VercelRequest } from "@vercel/node";
import { verifyToken } from "@clerk/backend";

const adminUserIds = (): string[] =>
  (process.env.CLERK_ADMIN_USER_IDS || process.env.VITE_CLERK_ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

export async function requireAdminUserId(req: VercelRequest): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const token = header.slice(7);
    const payload = await verifyToken(token, { secretKey });
    const userId = payload.sub;
    if (!userId || !adminUserIds().includes(userId)) return null;
    return userId;
  } catch {
    return null;
  }
}
