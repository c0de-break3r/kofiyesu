<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { t } from "../../i18n/utils/translate";
import { useRouter } from "../../composables/useRouter";
import { isClerkConfigured } from "../../lib/clerk";
import ButtonRound from "../../components/ButtonRound.vue";
import ArrowRight from "../../components/icons/ArrowRight.vue";
import ProfileNavButton from "../../components/ProfileNavButton.vue";
import ModeToggle from "../../components/ModeToggle.vue";
import SoundsToggle from "../../components/SoundsToggle.vue";
import { isFeatureEnabled } from "../../utils/features";
import { useTheme } from "../../composables/useTheme";

const ContactChatPanel = isClerkConfigured
  ? defineAsyncComponent(() => import("../../components/ContactChatPanel.vue"))
  : null;

const router = useRouter();
const { resolvedTheme } = useTheme();

const goHome = () => {
  router.push("/");
};
</script>

<template>
  <div class="chat-page">
    <header class="chat-page-header">
      <ButtonRound
        variant="accent"
        class="chat-page-back"
        :aria-label="t('back-to-home')"
        data-sound="click"
        @click="goHome"
      >
        <ArrowRight class="chat-page-back-icon" />
      </ButtonRound>

      <div class="chat-page-heading">
        <h1 class="chat-page-title">{{ t("chat-title") }}</h1>
        <p class="chat-page-subtitle">{{ t("chat-subtitle") }}</p>
      </div>

      <div class="chat-page-actions">
        <ModeToggle :isDarkTheme="resolvedTheme === 'dark'" />
        <SoundsToggle
          v-if="isFeatureEnabled('sounds')"
          class="chat-page-sounds"
          :isDarkTheme="resolvedTheme === 'dark'"
        />
        <ProfileNavButton variant="header" />
      </div>
    </header>

    <main class="chat-page-main">
      <div v-if="!isClerkConfigured" class="chat-page-gate">
        <p>{{ t("chat-clerk-missing") }}</p>
        <button type="button" class="chat-page-home-link" @click="goHome">{{ t("back-to-home") }}</button>
      </div>
      <ContactChatPanel v-else fixed class="chat-page-panel" />
    </main>
  </div>
</template>

<style scoped lang="scss">
.chat-page {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--color-background-400);
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom)
    env(safe-area-inset-left);
  overflow: hidden;

  &-header {
    flex-shrink: 0;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-outer);
    padding-top: calc(var(--space-sm) + env(safe-area-inset-top, 0px));
    border-bottom: 1px solid var(--color-border-subtle);
    background: var(--color-surface-elevated);
  }

  &-back-icon {
    width: 100%;
    transform: rotate(180deg);
  }

  &-heading {
    min-width: 0;
    padding: 0 var(--space-xs);
  }

  &-title {
    font-size: var(--font-size-md);
    font-weight: 800;
    color: var(--color-text-400);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include mixins.mq("md") {
      font-size: var(--font-size-lg);
    }
  }

  &-subtitle {
    display: none;
    font-size: var(--font-size-sm);
    color: var(--color-text-300);

    @include mixins.mq("md") {
      display: block;
    }
  }

  &-actions {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  &-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-outer);
    padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0px));
    overflow: hidden;
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
