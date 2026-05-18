<script setup lang="ts">
import { isClerkConfigured } from "../lib/clerk";
import ClerkProfileNav from "./ClerkProfileNav.vue";
</script>

<template>
  <ClerkProfileNav v-if="isClerkConfigured" />
  <a v-else href="#contact" class="profile-nav-button-fallback" aria-label="Contact">
    <img src="/meta/logo-avatar.png" alt="" width="32" height="32" />
  </a>
</template>

<style scoped lang="scss">
.profile-nav-button-fallback {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 20, 25, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
  flex-shrink: 0;
  text-decoration: none;

  img {
    border-radius: 50%;
    object-fit: cover;
  }
}
</style>
