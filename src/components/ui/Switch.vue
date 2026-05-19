<script setup lang="ts">
import { ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    checked: boolean;
    ariaLabel?: string;
    disabled?: boolean;
    id?: string;
    animated?: boolean;
  }>(),
  { disabled: false, animated: false },
);

const emit = defineEmits<{
  "update:checked": [value: boolean];
}>();

const isPopping = ref(false);
let popTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.checked,
  () => {
    if (!props.animated) return;
    isPopping.value = true;
    clearTimeout(popTimer);
    popTimer = setTimeout(() => {
      isPopping.value = false;
    }, 360);
  },
);

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
    :class="{ 'ui-switch-pop': isPopping }"
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
  transition:
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease;

  &[data-state="checked"] {
    box-shadow: 0 0 12px color-mix(in srgb, var(--switch-primary) 35%, transparent);
  }

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
  transition: transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1);
  transform: translateX(0);
}

.ui-switch[data-state="checked"] .ui-switch-thumb {
  transform: translateX(1.25rem);
}

.ui-switch-pop .ui-switch-thumb {
  animation: ui-switch-thumb-pop 0.36s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ui-switch-thumb-pop {
  0%,
  100% {
    transform: translateX(var(--thumb-x, 0));
  }

  45% {
    transform: translateX(var(--thumb-x, 0)) scale(1.18);
  }
}

.ui-switch[data-state="checked"].ui-switch-pop {
  --thumb-x: 1.25rem;
}

.ui-switch[data-state="unchecked"].ui-switch-pop {
  --thumb-x: 0;
}
</style>
