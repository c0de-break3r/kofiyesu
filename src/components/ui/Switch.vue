<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    checked: boolean;
    ariaLabel?: string;
    disabled?: boolean;
    id?: string;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  "update:checked": [value: boolean];
}>();

const toggle = () => {
  if (props.disabled) return;
  emit("update:checked", !props.checked);
};
</script>

<template>
  <button
    :id="id"
    type="button"
    role="switch"
    class="ui-switch"
    :data-state="checked ? 'checked' : 'unchecked'"
    :aria-checked="checked"
    :aria-label="ariaLabel"
    :disabled="disabled"
    data-sound="click"
    @click="toggle"
  >
    <span class="ui-switch-thumb" />
  </button>
</template>

<style scoped lang="scss">
/* shadcn/ui Switch */
.ui-switch {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  background-color: var(--switch-background);
  transition: background-color 0.2s ease;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px var(--color-background-400),
      0 0 0 4px var(--color-accent-400);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &[data-state="checked"] {
    background-color: var(--switch-primary);
  }
}

.ui-switch-thumb {
  pointer-events: none;
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background-color: var(--switch-thumb);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
}

.ui-switch[data-state="checked"] .ui-switch-thumb {
  transform: translateX(1.25rem);
}
</style>
