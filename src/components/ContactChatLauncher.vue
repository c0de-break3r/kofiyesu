<script setup lang="ts">
import { t } from "../i18n/utils/translate";
import { isClerkConfigured } from "../lib/clerk";
import { useRouter } from "../composables/useRouter";
import Card from "./ui/Card.vue";
import Button from "./Button.vue";

const router = useRouter();

const openChat = () => {
  router.push("/chat");
};
</script>

<template>
  <Card class="contact-chat-launcher" hover>
    <div class="contact-chat-launcher-inner">
      <div class="contact-chat-launcher-copy">
        <h3 class="contact-chat-launcher-title">{{ t("chat-title") }}</h3>
        <p class="contact-chat-launcher-subtitle">{{ t("chat-subtitle") }}</p>
      </div>
      <Button
        v-if="isClerkConfigured"
        renderAs="button"
        variant="accent"
        class="contact-chat-launcher-cta"
        data-sound="click"
        @click="openChat"
      >
        {{ t("chat-open") }}
      </Button>
      <p v-else class="contact-chat-launcher-missing">{{ t("chat-clerk-missing") }}</p>
    </div>
  </Card>
</template>

<style scoped lang="scss">
.contact-chat-launcher {
  width: 100%;
  overflow: hidden;

  &-inner {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-md);

    @include mixins.mq("md") {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg);
    }
  }

  &-copy {
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
    line-height: 1.5;
  }

  &-cta {
    flex-shrink: 0;
    width: 100%;

    @include mixins.mq("md") {
      width: auto;
    }
  }

  &-missing {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    margin: 0;
  }
}
</style>
