<script setup lang="ts">
import { ref } from "vue";
import { useAdminPanel } from "../../../composables/useAdminPanel";
import { useClerkAdmin } from "../../../composables/useClerkAdmin";
import AdminProjectsSection from "./AdminProjectsSection.vue";
import AdminAboutSection from "./AdminAboutSection.vue";
import AdminInquiriesSection from "./AdminInquiriesSection.vue";
import ButtonRound from "../../../components/ButtonRound.vue";

type Tab = "projects" | "about" | "inquiries";

const { isOpen, close } = useAdminPanel();
const { canAccessAdmin } = useClerkAdmin();
const tab = ref<Tab>("projects");

const tabs: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "inquiries", label: "Inquiries" },
];
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && canAccessAdmin"
      class="admin-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Site management"
    >
      <div class="admin-panel-backdrop" @click="close" />
      <div class="admin-panel-sheet">
        <div class="admin-panel-toolbar">
          <nav class="admin-panel-tabs" aria-label="Admin sections">
            <button
              v-for="item in tabs"
              :key="item.id"
              type="button"
              class="admin-panel-tab"
              :class="{ 'admin-panel-tab-active': tab === item.id }"
              @click="tab = item.id"
            >
              {{ item.label }}
            </button>
          </nav>
          <ButtonRound variant="border" aria-label="Close" data-sound="click" @click="close">×</ButtonRound>
        </div>

        <div class="admin-panel-body">
          <AdminProjectsSection v-show="tab === 'projects'" />
          <AdminAboutSection v-show="tab === 'about'" />
          <AdminInquiriesSection v-show="tab === 'inquiries'" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.admin-panel {
  position: fixed;
  top: var(--height-header);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 88;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;

  &-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    pointer-events: auto;
  }

  &-sheet {
    position: relative;
    width: min(100%, 520px);
    height: 100%;
    background: var(--color-background-400);
    box-shadow: -8px 0 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    pointer-events: auto;
    padding-bottom: env(safe-area-inset-bottom);
  }

  &-toolbar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-outer);
    border-bottom: 1px solid var(--color-border-subtle);
  }

  &-tabs {
    display: flex;
    gap: var(--space-xs);
    overflow-x: auto;
    min-width: 0;
  }

  &-tab {
    border: none;
    background: transparent;
    font: inherit;
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-300);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    white-space: nowrap;

    &-active {
      color: var(--color-text-400);
      background: var(--color-surface-elevated);
    }
  }

  &-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-lg) var(--space-outer);
  }
}
</style>
