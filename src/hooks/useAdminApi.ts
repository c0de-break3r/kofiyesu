import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export function useAdminApi() {
  const { getToken } = useAuth();

  const adminFetch = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");

      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return fetch(path, { ...init, headers });
    },
    [getToken],
  );

  return { adminFetch };
}
