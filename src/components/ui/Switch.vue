<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    checked: boolean;
    ariaLabel?: string;
    size?: "default" | "sm";
  }>(),
  { size: "default" },
);

const emit = defineEmits<{
  "update:checked": [value: boolean];
}>();

const toggle = () => {
  emit("update:checked", !props.checked);
};
</script>

<template>
  <button
    type="button"
    role="switch"
    class="ui-switch"
    :class="`ui-switch-${size}`"
    :data-state="checked ? 'checked' : 'unchecked'"
    :aria-checked="checked"
    :aria-label="ariaLabel"
    data-sound="click"
    @click="toggle"
  >
    <span class="ui-switch-thumb" />
  </button>
</template>

<style scoped lang="scss">
.ui-switch {
  position: relative;
  flex-shrink: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: 9999px;
  background: var(--color-grayscale-400);
  cursor: pointer;
  padding: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus-visible {
    outline: 2px solid var(--color-accent-400);
    outline-offset: 2px;
  }

  &[data-state="checked"] {
    background: var(--color-accent-400);
    border-color: var(--color-accent-400);
  }

  &-default {
    width: 44px;
    height: 24px;

    .ui-switch-thumb {
      width: 20px;
      height: 20px;
    }

    &[data-state="checked"] .ui-switch-thumb {
      transform: translateX(20px);
    }
  }

  &-sm {
    width: 36px;
    height: 20px;

    .ui-switch-thumb {
      width: 16px;
      height: 16px;
    }

    &[data-state="checked"] .ui-switch-thumb {
      transform: translateX(16px);
    }
  }

  &-thumb {
    position: absolute;
    top: 1px;
    left: 1px;
    border-radius: 50%;
    background: var(--color-surface-elevated);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }
}

[data-theme="dark"] .ui-switch:not([data-state="checked"]) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.14);
}
</style>
