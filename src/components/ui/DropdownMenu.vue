<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

defineProps<{
  align?: "start" | "end";
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const toggle = () => {
  open.value = !open.value;
};

const close = () => {
  open.value = false;
};

const onDocumentClick = (event: MouseEvent) => {
  if (!open.value || !rootRef.value) return;
  if (!rootRef.value.contains(event.target as Node)) close();
};

const onEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") close();
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onEscape);
});

defineExpose({ close });
</script>

<template>
  <div ref="rootRef" class="ui-dropdown" :class="`ui-dropdown-align-${align ?? 'end'}`">
    <div class="ui-dropdown-trigger" @click.stop="toggle">
      <slot name="trigger" :open="open" />
    </div>
    <div v-if="open" class="ui-dropdown-content" role="menu" @click="close">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-dropdown {
  position: relative;
  display: inline-flex;

  &-align-end .ui-dropdown-content {
    right: 0;
  }

  &-align-start .ui-dropdown-content {
    left: 0;
  }

  &-trigger {
    display: inline-flex;
  }

  &-content {
    position: absolute;
    top: calc(100% + 6px);
    z-index: 50;
    min-width: 8rem;
    padding: 4px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
    background: var(--color-surface-elevated);
    color: var(--color-text-400);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }
}
</style>
