<script setup lang="ts">
import { computed } from "vue";
import Switch from "./ui/Switch.vue";
import { useTheme } from "../composables/useTheme";
import { t } from "../i18n/utils/translate";

defineProps<{
  isDarkTheme?: boolean;
}>();

const { theme, setTheme } = useTheme();

const isDark = computed({
  get: () => theme.value === "dark",
  set: (value: boolean) => setTheme(value ? "dark" : "light"),
});

const label = computed(() => (isDark.value ? t("theme-light") : t("theme-dark")));
</script>

<template>
  <div class="theme-toggle" data-cursor="circle-white">
    <span class="theme-toggle-icon" aria-hidden="true">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none">
        <path fill="currentColor" d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z" />
      </svg>
    </span>
    <Switch :checked="isDark" size="sm" :aria-label="label" @update:checked="isDark = $event" />
  </div>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-elevated);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &-icon {
    display: flex;
    width: 18px;
    height: 18px;
    color: var(--color-text-300);

    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
