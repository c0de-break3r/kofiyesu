<script setup lang="ts">
import { isClerkConfigured } from "../lib/clerk";
import ClerkProfileNav from "./ClerkProfileNav.vue";
import User from "./icons/User.vue";

withDefaults(
  defineProps<{
    variant?: "floating" | "header";
  }>(),
  { variant: "floating" },
);
</script>

<template>
  <ClerkProfileNav v-if="isClerkConfigured" :variant="variant" />
  <a
    v-else
    href="#contact"
    class="profile-nav-button-fallback"
    :class="`profile-nav-button-fallback-${variant}`"
    aria-label="Contact"
  >
    <User class="profile-nav-button-fallback-icon" />
  </a>
</template>

<style scoped lang="scss">
.profile-nav-button-fallback {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-decoration: none;
  color: var(--color-text-400);

  &-floating {
    width: 52px;
    height: 52px;
    background: rgba(15, 20, 25, 0.72);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  }

  &-header {
    width: 44px;
    height: 44px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-subtle);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &-icon {
    width: 22px;
    height: 22px;
  }
}

[data-theme="light"] .profile-nav-button-fallback-floating {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(26, 29, 33, 0.1);
}
</style>
