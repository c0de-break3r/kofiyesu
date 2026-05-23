const parseIds = (raw: string | undefined) =>
  (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

export const adminUserIds = parseIds(import.meta.env.VITE_CLERK_ADMIN_USER_IDS);

export const isClerkAdminUser = (userId: string | null | undefined) =>
  Boolean(userId && adminUserIds.includes(userId));
