const CHUNK_RELOAD_KEY = "kofiyesu-chunk-reload";

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("dynamically imported module")
  );
}

/** Clear the one-time reload guard after a successful app boot. */
export function clearChunkReloadGuard() {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

async function importWithChunkRetry<T>(importer: () => Promise<T>): Promise<T> {
  try {
    const module = await importer();
    clearChunkReloadGuard();
    return module;
  } catch (error) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
      return new Promise(() => {});
    }
    throw error;
  }
}

/** Lazy-load a page module; reload once if a stale deploy left a missing chunk. */
export function lazyPage<T extends Record<string, unknown>, K extends keyof T>(
  importer: () => Promise<T>,
  exportName: K,
) {
  return importWithChunkRetry(importer).then((module) => ({
    default: module[exportName] as T[K],
  }));
}
