<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "../composables/useTheme";

interface Props {
  isDarkTheme?: boolean;
}

defineProps<Props>();

const { theme, toggleTheme } = useTheme();

const label = computed(() => (theme.value === "dark" ? "Switch to light mode" : "Switch to dark mode"));
const isDark = computed(() => theme.value === "dark");
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ 'theme-toggle-active': isDark }"
    :aria-label="label"
    :aria-pressed="isDark"
    data-cursor="circle-white"
    data-sound="click"
    data-hoversound="hover"
    @click="toggleTheme"
  >
    <span class="theme-toggle-track" aria-hidden="true">
      <span class="theme-toggle-glow" />
      <span class="theme-toggle-thumb">
        <svg v-if="isDark" class="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
          />
        </svg>
        <svg v-else class="theme-toggle-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z"
          />
        </svg>
      </span>
    </span>
  </button>
</template>

<style scoped lang="scss">
.theme-toggle {
  position: relative;
  width: 52px;
  height: 52px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;

  &-track {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--color-grayscale-400);
    border: 1px solid var(--color-border-subtle);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition:
      background 0.35s ease,
      border-color 0.35s ease,
      box-shadow 0.35s ease,
      transform 0.2s ease;
    overflow: hidden;
  }

  &-glow {
    position: absolute;
    inset: -40%;
    background: conic-gradient(
      from 200deg,
      transparent 0deg,
      rgba(232, 93, 4, 0.5) 90deg,
      rgba(251, 146, 60, 0.8) 180deg,
      rgba(232, 93, 4, 0.4) 270deg,
      transparent 360deg
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    animation: theme-toggle-spin 8s linear infinite;
  }

  &-thumb {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-background-400);
    color: var(--color-text-400);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition:
      transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1),
      background 0.35s ease,
      color 0.35s ease;
  }

  &-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1);
  }

  &:hover &-track {
    transform: scale(1.06);
  }

  &:active &-track {
    transform: scale(0.96);
  }

  &-active &-track {
    background: linear-gradient(145deg, #4a4f56, #363a3f);
    border-color: rgba(232, 93, 4, 0.35);
    box-shadow:
      0 0 24px rgba(232, 93, 4, 0.25),
      0 4px 20px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }

  &-active &-glow {
    opacity: 1;
  }

  &-active &-thumb {
    background: linear-gradient(145deg, #e85d04, #fb923c);
    color: #fff;
    transform: rotate(15deg) scale(1.05);
    box-shadow: 0 4px 16px rgba(232, 93, 4, 0.45);
  }

  &-active &-icon {
    transform: rotate(-15deg);
  }
}

[data-theme="dark"] .theme-toggle:not(.theme-toggle-active) .theme-toggle-track {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

@keyframes theme-toggle-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
