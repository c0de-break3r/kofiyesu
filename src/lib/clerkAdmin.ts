/** Comma-separated Clerk user IDs allowed to open the inline site admin panel (VITE_CLERK_ADMIN_USER_IDS). */
const rawAdminIds = import.meta.env.VITE_CLERK_ADMIN_USER_IDS as string | undefined;

export const clerkAdminUserIds = (rawAdminIds ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export const isClerkAdminConfigured = clerkAdminUserIds.length > 0;

export const isClerkAdminUser = (userId: string | null | undefined): boolean => {
  if (!userId || !isClerkAdminConfigured) return false;
  return clerkAdminUserIds.includes(userId);
};
