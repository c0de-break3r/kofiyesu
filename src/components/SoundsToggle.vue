<script setup lang="ts">
import { computed } from "vue";
import Switch from "./ui/Switch.vue";
import Volume from "./icons/Volume.vue";
import { soundsEnabled, howlerUnlocked } from "../features/sounds/composables/useHowler";
import { t } from "../i18n/utils/translate";

defineProps<{
  isDarkTheme: boolean;
}>();

const isActive = computed({
  get: () => soundsEnabled.value && howlerUnlocked.value,
  set: (value: boolean) => {
    soundsEnabled.value = value;
  },
});
</script>

<template>
  <div class="sounds-toggle" :class="{ 'sounds-toggle-dark': isDarkTheme }" data-cursor="circle-white">
    <Volume :active="isActive" class="sounds-toggle-icon" />
    <Switch
      :checked="isActive"
      size="sm"
      :aria-label="isActive ? t('disable-sounds') : t('enable-sounds')"
      @update:checked="isActive = $event"
    />
  </div>
</template>

<style scoped lang="scss">
.sounds-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-elevated);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    --icon-color: var(--color-text-300);
  }

  &-dark &-icon {
    --icon-color: rgba(255, 255, 255, 0.75);
  }
}
</style>
