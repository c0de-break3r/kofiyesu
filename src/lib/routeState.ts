export const path = {
  value: typeof window !== "undefined" ? window.location.pathname : "/",
};

export const isTransitioning = { value: false };

export const projectVisible = {
  get value(): boolean {
    return /^\/project\/[^/]+$/.test(path.value) && !isTransitioning.value;
  },
};

export function syncPath(next: string) {
  path.value = next;
}
