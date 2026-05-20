import { ref, readonly } from "vue";

const isOpen = ref(false);

export function useAdminPanel() {
  const open = () => {
    isOpen.value = true;
    document.documentElement.classList.add("admin-panel-open");
  };

  const close = () => {
    isOpen.value = false;
    document.documentElement.classList.remove("admin-panel-open");
  };

  const toggle = () => {
    if (isOpen.value) close();
    else open();
  };

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
  };
}
