<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "a";
    hover?: boolean;
  }>(),
  {
    as: "div",
    hover: false,
  },
);
</script>

<template>
  <component
    :is="as === 'a' ? 'a' : 'div'"
    class="ui-card"
    :class="{ 'ui-card-hover': hover }"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-surface-elevated);
  color: var(--color-text-400);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.06);

  &-hover {
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;

    @include mixins.hover {
      &:hover {
        border-color: rgba(232, 93, 4, 0.25);
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 8px 24px rgba(232, 93, 4, 0.08);
      }
    }
  }
}
</style>
