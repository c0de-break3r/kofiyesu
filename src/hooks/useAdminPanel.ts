import { useCallback, useSyncExternalStore } from "react";

let panelOpen = false;
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => panelOpen;

const setOpen = (value: boolean) => {
  panelOpen = value;
  listeners.forEach((l) => l());
};

export function useAdminPanel() {
  const open = useSyncExternalStore(subscribe, getSnapshot, () => false);

  const toggle = useCallback(() => setOpen(!panelOpen), []);
  const close = useCallback(() => setOpen(false), []);

  return { open, setOpen, toggle, close };
}
