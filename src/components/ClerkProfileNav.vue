<script setup lang="ts">
import { SignInButton, UserButton, useAuth } from "@clerk/vue";
import User from "./icons/User.vue";

withDefaults(
  defineProps<{
    variant?: "floating" | "header";
  }>(),
  { variant: "floating" },
);

const { isSignedIn, isLoaded } = useAuth();
</script>

<template>
  <div class="profile-nav-button" :class="`profile-nav-button-${variant}`">
    <UserButton
      v-if="isLoaded && isSignedIn"
      :appearance="{
        elements: {
          avatarBox: 'profile-nav-button-avatar',
          userButtonTrigger: 'profile-nav-button-trigger',
        },
      }"
    />
    <SignInButton v-else-if="isLoaded" mode="modal">
      <button
        type="button"
        class="profile-nav-button-signin"
        aria-label="Sign in"
        data-sound="click"
      >
        <User class="profile-nav-button-user-icon" />
      </button>
    </SignInButton>
  </div>
</template>

<style scoped lang="scss">
.profile-nav-button {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &-floating {
    width: 52px;
    height: 52px;
    background: rgba(15, 20, 25, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
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

  :deep(.profile-nav-button-trigger) {
    width: 100% !important;
    height: 100% !important;
  }

  &-floating :deep(.profile-nav-button-trigger) {
    width: 52px !important;
    height: 52px !important;
  }

  &-header :deep(.profile-nav-button-trigger) {
    width: 44px !important;
    height: 44px !important;
  }

  &-floating :deep(.profile-nav-button-avatar) {
    width: 36px !important;
    height: 36px !important;
  }

  &-header :deep(.profile-nav-button-avatar) {
    width: 32px !important;
    height: 32px !important;
  }

  &-signin {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: var(--color-text-400);
  }

  &-user-icon {
    width: 22px;
    height: 22px;
  }

  &-header &-user-icon {
    width: 20px;
    height: 20px;
  }
}

[data-theme="light"] .profile-nav-button-floating {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(26, 29, 33, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
</style>
