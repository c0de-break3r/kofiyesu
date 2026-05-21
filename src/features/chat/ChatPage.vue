<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { t } from "../../i18n/utils/translate";
import { useRouter } from "../../composables/useRouter";
import { isClerkConfigured } from "../../lib/clerk";
import { clerkReady } from "../../lib/clerkReady";

const ContactChatPanel = isClerkConfigured
  ? defineAsyncComponent(() => import("../../components/ContactChatPanel.vue"))
  : null;

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="chat-page">
    <main class="chat-page-main">
      <div class="chat-page-intro">
        <h1 class="chat-page-title">{{ t("chat-title") }}</h1>
        <p class="chat-page-subtitle">{{ t("chat-subtitle") }}</p>
      </div>

      <div v-if="!isClerkConfigured" class="chat-page-gate">
        <p>{{ t("chat-clerk-missing") }}</p>
        <button type="button" class="chat-page-home-link" @click="goHome">{{ t("back-to-home") }}</button>
      </div>
      <ContactChatPanel v-else-if="clerkReady" fixed class="chat-page-panel" />
      <p v-else class="chat-page-gate">{{ t("chat-loading") }}</p>
    </main>
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-background-400);
  overflow: hidden;

  &-intro {
    flex-shrink: 0;
    padding-bottom: var(--space-sm);
  }

  &-title {
    font-size: var(--font-size-md);
    font-weight: 800;
    color: var(--color-text-400);

    @include mixins.mq("md") {
      font-size: var(--font-size-lg);
    }
  }

  &-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    margin-top: var(--space-xxs);
  }

  &-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 840px;
    margin: 0 auto;
    padding: var(--space-sm) var(--space-outer);
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
    overflow: hidden;

    @include mixins.mq("lg") {
      max-width: none;
      padding-inline: var(--space-lg);
    }
  }

  &-panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &-gate {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    color: var(--color-text-300);
    padding: var(--space-xl) 0;
  }

  &-home-link {
    align-self: flex-start;
    border: none;
    background: none;
    color: var(--color-accent-400);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }
}
</style>
