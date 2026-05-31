const CHUNK_RELOAD_KEY = "kofiyesu-chunk-reload";
const MAX_RECOVERY_ATTEMPTS = 2;

function messageFromUnknown(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "";
}

export function isChunkLoadError(error: unknown): boolean {
  const msg = messageFromUnknown(error).toLowerCase();
  if (!msg) return false;
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("importing a module script failed") ||
    msg.includes("error loading dynamically imported module") ||
    msg.includes("dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("chunkloaderror")
  );
}

/** Clear recovery counter after a healthy session boot. */
export function markDeployHealthy() {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY);
}

async function clearStaleCaches() {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
}

/**
 * Recover from a stale deploy (missing hashed chunk). Returns true if reloading.
 * First attempt: normal reload. Second: clear SW/cache then cache-bust reload.
 */
export async function recoverFromStaleDeploy(): Promise<boolean> {
  const attempts = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? "0");
  if (attempts >= MAX_RECOVERY_ATTEMPTS) return false;

  sessionStorage.setItem(CHUNK_RELOAD_KEY, String(attempts + 1));

  if (attempts >= 1) {
    try {
      await clearStaleCaches();
      await unregisterServiceWorkers();
    } catch {
      // Best-effort — still reload below.
    }
  }

  const url = new URL(window.location.href);
  url.searchParams.set("__v", String(Date.now()));
  window.location.replace(url.toString());
  return true;
}

async function importWithChunkRetry<T>(importer: () => Promise<T>): Promise<T> {
  try {
    const module = await importer();
    markDeployHealthy();
    return module;
  } catch (error) {
    if (isChunkLoadError(error) && (await recoverFromStaleDeploy())) {
      return new Promise(() => {});
    }
    throw error;
  }
}

/** Lazy-load a page module; reload if a stale deploy left a missing chunk. */
export function lazyPage<T extends Record<string, unknown>, K extends keyof T>(
  importer: () => Promise<T>,
  exportName: K,
) {
  return importWithChunkRetry(importer).then((module) => ({
    default: module[exportName] as T[K],
  }));
}

export function installChunkLoadRecovery() {
  const onFailure = (error: unknown) => {
    if (!isChunkLoadError(error)) return;
    void recoverFromStaleDeploy();
  };

  window.addEventListener("error", (event) => {
    if (event.target instanceof HTMLScriptElement) {
      onFailure(event.message || "script load error");
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    onFailure(event.reason);
  });
}
