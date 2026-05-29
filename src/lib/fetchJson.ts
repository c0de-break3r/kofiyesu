export async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) return null;

    return (await res.json()) as T;
  } catch {
    return null;
  }
}
