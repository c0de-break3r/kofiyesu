<script setup lang="ts">
import { useClerkAdmin } from "../composables/useClerkAdmin";
import { useAdminPanel } from "../composables/useAdminPanel";
import ButtonRound from "./ButtonRound.vue";

defineProps<{
  isDarkTheme?: boolean;
}>();

const { canAccessAdmin } = useClerkAdmin();
const { toggle } = useAdminPanel();
</script>

<template>
  <ButtonRound
    v-if="canAccessAdmin"
    variant="border"
    class="admin-panel-toggle"
    :class="{ 'admin-panel-toggle-dark': isDarkTheme }"
    aria-label="Manage site"
    title="Manage site"
    data-sound="click"
    @click="toggle"
  >
    <span class="admin-panel-toggle-icon" aria-hidden="true">✎</span>
  </ButtonRound>
</template>

<style scoped lang="scss">
.admin-panel-toggle {
  font-size: 16px;
  line-height: 1;

  &-icon {
    display: block;
    font-weight: 700;
  }

  &-dark {
    color: var(--color-white-400);
  }
}
</style>
