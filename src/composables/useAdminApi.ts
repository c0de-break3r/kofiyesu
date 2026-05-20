import { useAuth } from "@clerk/vue";

export function useAdminApi() {
  const { getToken } = useAuth();

  const adminFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const token = await getToken.value();
    if (!token) throw new Error("Sign in as admin to continue");

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(path, { ...init, headers });
  };

  return { adminFetch };
}
