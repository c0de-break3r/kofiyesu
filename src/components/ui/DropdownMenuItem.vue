<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();
</script>

<template>
  <button
    type="button"
    role="menuitem"
    class="ui-dropdown-item"
    :class="{ 'ui-dropdown-item-active': active }"
    data-sound="click"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.ui-dropdown-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover,
  &-active {
    background: var(--color-grayscale-400);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent-400);
    outline-offset: -2px;
  }
}
</style>
