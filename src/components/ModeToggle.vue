<script setup lang="ts">
import ButtonRound from "./ButtonRound.vue";
import DropdownMenu from "./ui/DropdownMenu.vue";
import DropdownMenuItem from "./ui/DropdownMenuItem.vue";
import Sun from "./icons/Sun.vue";
import Moon from "./icons/Moon.vue";
import { useTheme, type ThemePreference } from "../composables/useTheme";
import { t } from "../i18n/utils/translate";

defineProps<{
  isDarkTheme?: boolean;
}>();

const { themePreference, resolvedTheme, setTheme } = useTheme();

const selectTheme = (preference: ThemePreference) => {
  setTheme(preference);
};
</script>

<template>
  <DropdownMenu align="end">
    <template #trigger>
      <ButtonRound
        renderAs="button"
        variant="border"
        size="md"
        class="mode-toggle-trigger"
        :class="`mode-toggle-trigger--${resolvedTheme}`"
        :aria-label="t('toggle-theme')"
        data-cursor="circle-white"
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

    <DropdownMenuItem :active="themePreference === 'light'" @click="selectTheme('light')">
      {{ t("theme-light") }}
    </DropdownMenuItem>
    <DropdownMenuItem :active="themePreference === 'dark'" @click="selectTheme('dark')">
      {{ t("theme-dark") }}
    </DropdownMenuItem>
    <DropdownMenuItem :active="themePreference === 'system'" @click="selectTheme('system')">
      {{ t("theme-system") }}
    </DropdownMenuItem>
  </DropdownMenu>
</template>

<style scoped lang="scss">
/* Light site theme (moon visible) → gray */
.mode-toggle-trigger--light {
  --icon-color: #94a3b8;
  color: #94a3b8;
}

/* Dark site theme (sun visible) → light-mode accent orange, not dark-theme orange */
.mode-toggle-trigger--dark {
  --icon-color: #e85d04;
  color: #e85d04;
}

.mode-toggle-icons {
  position: relative;
  display: flex;
  width: 1.2rem;
  height: 1.2rem;
}

.mode-toggle-icon {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &-sun {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  &-moon {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

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
