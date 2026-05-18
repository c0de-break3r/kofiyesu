<script setup lang="ts">
import { SignInButton, UserButton, useAuth } from "@clerk/vue";

const { isSignedIn, isLoaded } = useAuth();
</script>

<template>
  <div class="profile-nav-button">
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
      <button type="button" class="profile-nav-button-signin" aria-label="Sign in" data-sound="click">
        <img src="/meta/logo-avatar.png" alt="" width="32" height="32" />
      </button>
    </SignInButton>
  </div>
</template>

<style scoped lang="scss">
.profile-nav-button {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 20, 25, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  flex-shrink: 0;

  :deep(.profile-nav-button-trigger) {
    width: 52px !important;
    height: 52px !important;
  }

  :deep(.profile-nav-button-avatar) {
    width: 36px !important;
    height: 36px !important;
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

    img {
      border-radius: 50%;
      object-fit: cover;
    }
  }
}

[data-theme="light"] .profile-nav-button {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(26, 29, 33, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
</style>
