<script setup lang="ts">
import { clerkReady } from "../lib/clerkReady";
import AdminPanelToggleInner from "./AdminPanelToggleInner.vue";

defineProps<{
  isDarkTheme?: boolean;
}>();
</script>

<template>
  <AdminPanelToggleInner v-if="clerkReady" :isDarkTheme="isDarkTheme" />
</template>
