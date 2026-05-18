<script setup lang="ts">
import { computed, useAttrs } from "vue";

export interface Props {
  renderAs?: "button" | "a" | "div";
  variant?: "accent" | "border" | "theme" | "background" | "gray" | "toggle";
  rounded?: boolean;
  /** When variant is `toggle`, controls the filled active state (KhelianCart-style). */
  active?: boolean;
  /** Set to `false` to disable auto click sound on this button. */
  sound?: string | false;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  variant: "accent",
  active: false,
});

const attrs = useAttrs();

const classes = computed(() => [
  "button-wrapper",
  { [`button-wrapper-${props.variant}`]: props.variant !== undefined },
  { "button-wrapper-rounded": props.rounded },
  { "button-wrapper-toggle-active": props.variant === "toggle" && props.active },
]);

const soundAttrs = computed(() => {
  if (props.sound === false) return {};
  return {
    "data-sound": props.sound ?? "click",
    "data-hoversound": "hover",
  };
});

const componentTag = computed(() => props.renderAs ?? "button");
</script>

<template>
  <component :is="componentTag" :class="classes" v-bind="{ ...soundAttrs, ...attrs }">
    <slot></slot>
  </component>
</template>

<style scoped lang="scss">
.button-wrapper {
  border: none;
  border-radius: 100px;
  letter-spacing: 0.02em;
  font-size: var(--font-size-md);
  font-weight: 800;
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
  background-color: transparent;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.1s ease;

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-rounded {
    border-radius: 50%;
    aspect-ratio: 1;
  }

  &-accent {
    background-color: var(--color-accent-400, var(--color-orange-400));
    color: var(--color-accent-text-400, var(--color-white-400));
    --icon-color: var(--color-accent-text-400, var(--color-white-400));

    @include mixins.hover {
      &:hover:not(:disabled) {
        background-color: var(--color-hover, var(--color-black-400));
        color: var(--color-hover-text, var(--color-white-400));
        --icon-color: var(--color-hover-text, var(--color-white-400));
      }
    }
  }

  &-theme {
    background-color: var(--color-grayscale-500);
    color: var(--color-text-400);
    --icon-color: var(--color-text-400);

    @include mixins.hover {
      &:hover:not(:disabled) {
        background-color: var(--color-hover, var(--color-black-400));
        color: var(--color-white-400);
        --icon-color: var(--color-white-400);
      }
    }
  }

  &-background {
    background-color: var(--color-background-400);
    color: var(--color-text-400);
    --icon-color: var(--color-text-400);

    @include mixins.hover {
      &:hover:not(:disabled) {
        background-color: var(--color-text-400);
        color: var(--color-background-400);
        --icon-color: var(--color-background-400);
      }
    }
  }

  &-gray {
    background-color: var(--color-gray-400);
    color: var(--color-white-400);
    --icon-color: var(--color-white-400);

    @include mixins.hover {
      &:hover:not(:disabled) {
        background-color: var(--color-gray-500);
      }
    }
  }

  &-border {
    border: 2px solid var(--color-grayscale-400);
    color: var(--color-text-400);
    --icon-color: var(--color-text-400);

    @include mixins.hover {
      &:hover:not(:disabled) {
        background-color: var(--color-hover, var(--color-black-400));
        color: var(--color-white-400);
        --icon-color: var(--color-white-400);
        border-color: var(--color-hover, var(--color-black-400));
      }
    }
  }

  /* KhelianCart-style pill toggle: muted off, filled accent on */
  &-toggle {
    background-color: var(--color-grayscale-400);
    color: var(--color-text-300);
    --icon-color: var(--color-text-300);
    border: 1px solid var(--color-border-subtle);
    box-shadow: none;

    @include mixins.hover {
      &:hover:not(:disabled):not(.button-wrapper-toggle-active) {
        background-color: var(--color-grayscale-500);
        color: var(--color-text-400);
        --icon-color: var(--color-text-400);
      }
    }

    &.button-wrapper-toggle-active {
      background: linear-gradient(135deg, var(--color-accent-400, #e85d04) 0%, #fb923c 100%);
      color: var(--color-white-400);
      --icon-color: var(--color-white-400);
      border-color: transparent;
      box-shadow:
        0 4px 20px rgba(232, 93, 4, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);

      @include mixins.hover {
        &:hover:not(:disabled) {
          filter: brightness(1.08);
          box-shadow:
            0 6px 24px rgba(232, 93, 4, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }
      }
    }
  }
}

[data-theme="dark"] .button-wrapper-toggle:not(.button-wrapper-toggle-active) {
  background-color: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  --icon-color: rgba(255, 255, 255, 0.6);
  border-color: rgba(255, 255, 255, 0.12);
}

[data-theme="dark"] .button-wrapper-toggle.button-wrapper-toggle-active {
  box-shadow:
    0 4px 24px rgba(232, 93, 4, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
</style>
