<script setup lang="ts">
import { computed, onUnmounted, ref, useId, watch } from "vue";
import Switch from "./ui/Switch.vue";
import ToggleLabel from "./ui/ToggleLabel.vue";
import Volume from "./icons/Volume.vue";
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
const bump = ref(false);
let bumpTimer: ReturnType<typeof setTimeout> | undefined;

const triggerBump = () => {
  bump.value = true;
  clearTimeout(bumpTimer);
  bumpTimer = setTimeout(() => {
    bump.value = false;
  }, 420);
};

const isActive = computed({
  get: () => soundsEnabled.value && howlerUnlocked.value,
  set: (value: boolean) => {
    const wasActive = soundsEnabled.value && howlerUnlocked.value;
    soundsEnabled.value = value;
    if (value !== wasActive) triggerBump();
  },
});

const label = computed(() => (isActive.value ? t("disable-sounds") : t("enable-sounds")));

watch(howlerUnlocked, (unlocked, wasUnlocked) => {
  if (unlocked && !wasUnlocked && soundsEnabled.value) triggerBump();
});

onUnmounted(() => clearTimeout(bumpTimer));
</script>

<template>
  <div
    class="sounds-toggle"
    :class="{
      'sounds-toggle-active': isActive,
      'sounds-toggle-bump': bump,
      'sounds-toggle-dark': props.isDarkTheme,
    }"
    data-cursor="circle-white"
  >
    <span class="sounds-toggle-icon" aria-hidden="true">
      <Volume :active="isActive" class="sounds-toggle-volume" />
    </span>
    <Switch
      :id="inputId"
      :checked="isActive"
      :aria-label="label"
      animated
      class="sounds-toggle-switch"
      @update:checked="isActive = $event"
    />
    <ToggleLabel v-if="props.showLabel" :for-id="inputId">{{ t("sounds") }}</ToggleLabel>
  </div>
</template>

<style scoped lang="scss">
.sounds-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.45rem 0.3rem 0.35rem;
  border-radius: 9999px;
  border: 1px solid var(--color-beige-600);
  --icon-color: var(--color-text-400);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &::before {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: 9999px;
    border: 1px solid var(--color-orange-400);
    opacity: 0;
    pointer-events: none;
    transform: scale(0.92);
    transition: opacity 0.25s ease;
  }

  &-dark {
    border-color: var(--color-dark-blue-400);
    --icon-color: var(--color-white-400);
  }

  &-active {
    border-color: var(--color-orange-400);
    background-color: color-mix(in srgb, var(--color-orange-400) 8%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-orange-400) 25%, transparent);

    &::before {
      opacity: 0.45;
      animation: sounds-toggle-ring 2s ease-out infinite;
    }

    &.sounds-toggle-dark {
      border-color: var(--color-cyan-500);
      background-color: color-mix(in srgb, var(--color-cyan-500) 10%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-cyan-500) 30%, transparent);

      &::before {
        border-color: var(--color-cyan-500);
      }
    }
  }

  &-bump {
    animation: sounds-toggle-bump 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.sounds-toggle-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sounds-toggle-active .sounds-toggle-icon {
  transform: scale(1.05);
}

.sounds-toggle-bump .sounds-toggle-icon {
  animation: sounds-toggle-icon-wiggle 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.sounds-toggle-volume {
  width: 1.2rem;
  height: 1.2rem;
  display: block;
}

.sounds-toggle-switch {
  flex-shrink: 0;
}

@keyframes sounds-toggle-bump {
  0%,
  100% {
    transform: scale(1);
  }

  40% {
    transform: scale(1.07);
  }
}

@keyframes sounds-toggle-ring {
  0% {
    transform: scale(0.92);
    opacity: 0.5;
  }

  70% {
    transform: scale(1.12);
    opacity: 0;
  }

  100% {
    transform: scale(1.12);
    opacity: 0;
  }
}

@keyframes sounds-toggle-icon-wiggle {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(-8deg) scale(1.08);
  }

  75% {
    transform: rotate(8deg) scale(1.08);
  }
}
</style>
