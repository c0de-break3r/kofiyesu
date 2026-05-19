<script setup lang="ts">
import { computed, useId } from "vue";
import Switch from "./ui/Switch.vue";
import ToggleLabel from "./ui/ToggleLabel.vue";
import { soundsEnabled, howlerUnlocked } from "../features/sounds/composables/useHowler";
import { t } from "../i18n/utils/translate";

const props = withDefaults(
  defineProps<{
    isDarkTheme?: boolean;
    showLabel?: boolean;
  }>(),
  { showLabel: false },
);

const inputId = useId();

const isActive = computed({
  get: () => soundsEnabled.value && howlerUnlocked.value,
  set: (value: boolean) => {
    soundsEnabled.value = value;
  },
});

const label = computed(() => (isActive.value ? t("disable-sounds") : t("enable-sounds")));
</script>

<template>
  <div class="sounds-toggle" data-cursor="circle-white">
    <Switch
      :id="inputId"
      :checked="isActive"
      :aria-label="label"
      @update:checked="isActive = $event"
    />
    <ToggleLabel v-if="props.showLabel" :for-id="inputId">{{ t("sounds") }}</ToggleLabel>
  </div>
</template>

<style scoped lang="scss">
.sounds-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}
</style>
