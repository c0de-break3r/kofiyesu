<script setup lang="ts">
import ButtonRound from "./ButtonRound.vue";
import Sun from "./icons/Sun.vue";
import Moon from "./icons/Moon.vue";
import { useTheme } from "../composables/useTheme";
import { t } from "../i18n/utils/translate";
import { ref } from "vue";

defineProps<{
  isDarkTheme?: boolean;
}>();

const { resolvedTheme, toggleTheme } = useTheme();
const isAnimating = ref(false);
let animTimer: ReturnType<typeof setTimeout> | undefined;

const onToggle = () => {
  toggleTheme();
  isAnimating.value = true;
  clearTimeout(animTimer);
  animTimer = setTimeout(() => {
    isAnimating.value = false;
  }, 520);
};
</script>

<template>
  <ButtonRound
    renderAs="button"
    variant="border"
    size="md"
    class="mode-toggle-trigger"
    :class="[
      `mode-toggle-trigger--${resolvedTheme}`,
      { 'mode-toggle-trigger--animating': isAnimating },
    ]"
    :aria-label="t('toggle-theme')"
    data-cursor="circle-white"
    @click="onToggle"
  >
    <span class="mode-toggle-icons" aria-hidden="true">
      <Sun
        class="mode-toggle-icon mode-toggle-icon-sun"
        :class="{ 'mode-toggle-icon-hidden': resolvedTheme === 'dark' }"
      />
      <Moon
        class="mode-toggle-icon mode-toggle-icon-moon"
        :class="{ 'mode-toggle-icon-hidden': resolvedTheme === 'light' }"
      />
    </span>
  </ButtonRound>
</template>

<style scoped lang="scss">
/* Light site theme (moon visible) → accent orange */
.mode-toggle-trigger--light {
  --icon-color: #e85d04;
  color: #e85d04;
}

/* Dark site theme (sun visible) → gray */
.mode-toggle-trigger--dark {
  --icon-color: #94a3b8;
  color: #94a3b8;
}

.mode-toggle-icons {
  position: relative;
  display: flex;
  width: 1.2rem;
  height: 1.2rem;
  transform-origin: center center;
}

.mode-toggle-trigger--animating .mode-toggle-icons {
  animation: mode-toggle-spin-tilt 0.52s cubic-bezier(0.34, 1.45, 0.64, 1);
}

@keyframes mode-toggle-spin-tilt {
  0% {
    transform: rotate(0deg) scale(1);
  }

  35% {
    transform: rotate(120deg) scale(1.12) skewX(-8deg);
  }

  70% {
    transform: rotate(260deg) scale(1.08) skewX(6deg);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}

.mode-toggle-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition:
    transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1),
    opacity 0.22s ease;

  &-hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.mode-toggle-icon-sun.mode-toggle-icon-hidden {
  transform: scale(0) rotate(-90deg);
}

.mode-toggle-icon-moon.mode-toggle-icon-hidden {
  transform: scale(0) rotate(90deg);
}
</style>
