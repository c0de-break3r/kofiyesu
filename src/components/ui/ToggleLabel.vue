<script setup lang="ts">
defineProps<{
  forId?: string;
}>();
</script>

<template>
  <label class="ui-toggle-label" :for="forId">
    <slot />
  </label>
</template>

<style scoped lang="scss">
.ui-toggle-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  line-height: 1;
  color: var(--color-text-400);
  cursor: pointer;
  user-select: none;
}
</style>
