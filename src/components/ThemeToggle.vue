<script setup lang="ts">
import { computed, useId } from "vue";
import Switch from "./ui/Switch.vue";
import ToggleLabel from "./ui/ToggleLabel.vue";
import { useTheme } from "../composables/useTheme";
import { t } from "../i18n/utils/translate";

const props = withDefaults(
  defineProps<{
    isDarkTheme?: boolean;
    /** When true, shows a text label beside the switch (shadcn form style). */
    showLabel?: boolean;
  }>(),
  { showLabel: false },
);

const inputId = useId();
const { theme, setTheme } = useTheme();

const isDark = computed({
  get: () => theme.value === "dark",
  set: (value: boolean) => setTheme(value ? "dark" : "light"),
});

const label = computed(() => (isDark.value ? t("theme-light") : t("theme-dark")));
</script>

<template>
  <div class="theme-toggle" data-cursor="circle-white">
    <Switch
      :id="inputId"
      :checked="isDark"
      :aria-label="label"
      @update:checked="isDark = $event"
    />
    <ToggleLabel v-if="props.showLabel" :for-id="inputId">{{ label }}</ToggleLabel>
  </div>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}
</style>
