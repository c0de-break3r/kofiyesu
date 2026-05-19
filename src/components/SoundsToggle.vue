<script setup lang="ts">
import { computed } from "vue";
import { soundsEnabled, howlerUnlocked } from "../features/sounds/composables/useHowler";
import ButtonRound from "./ButtonRound.vue";
import Volume from "./icons/Volume.vue";
import { t } from "../i18n/utils/translate";
const props = defineProps<{
  isDarkTheme: boolean;
}>();

const isActive = computed(() => soundsEnabled.value && howlerUnlocked.value);

const toggleSounds = () => {
  soundsEnabled.value = !soundsEnabled.value;
};
</script>

<template>
  <ButtonRound
    variant="toggle"
    :active="isActive"
    :class="{ 'music-toggle': true, 'music-toggle-dark': props.isDarkTheme, 'children-unclickable': true }"
    @click="toggleSounds"
    :aria-label="isActive ? t('disable-sounds') : t('enable-sounds')"
    data-cursor="circle-white"
  >
    <Volume :active="isActive" />
  </ButtonRound>
</template>

<style scoped lang="scss">
.music-toggle-dark :deep(.button-wrapper-toggle:not(.button-wrapper-toggle-active)) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  --icon-color: rgba(255, 255, 255, 0.7);
}
</style>
