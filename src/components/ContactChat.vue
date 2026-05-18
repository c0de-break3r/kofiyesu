<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { t } from "../i18n/utils/translate";
import { isClerkConfigured } from "../lib/clerk";

const ContactChatPanel = isClerkConfigured
  ? defineAsyncComponent(() => import("./ContactChatPanel.vue"))
  : null;
</script>

<template>
  <div class="contact-chat">
    <div class="contact-chat-header">
      <h3 class="contact-chat-title">{{ t("chat-title") }}</h3>
      <p class="contact-chat-subtitle">{{ t("chat-subtitle") }}</p>
    </div>

    <div v-if="!isClerkConfigured" class="contact-chat-gate">
      <p>{{ t("chat-clerk-missing") }}</p>
    </div>

    <ContactChatPanel v-else />
  </div>
</template>

<style scoped lang="scss">
.contact-chat {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  background: var(--color-surface-elevated);
  padding: var(--space-md);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);

  @include mixins.mq("md") {
    padding: var(--space-lg);
  }

  &-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-xxs);
  }

  &-title {
    font-weight: 800;
    font-size: var(--font-size-lg);
    color: var(--color-text-400);
  }

  &-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
  }

  &-gate {
    padding: var(--space-md) 0;
    color: var(--color-text-300);
    font-size: var(--font-size-md);
  }
}
</style>
