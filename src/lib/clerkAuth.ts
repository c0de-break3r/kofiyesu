import type { VercelRequest } from "@vercel/node";
import { verifyToken } from "@clerk/backend";

export async function requireSignedInUserId(req: VercelRequest): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;

  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const payload = await verifyToken(header.slice(7), { secretKey });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
