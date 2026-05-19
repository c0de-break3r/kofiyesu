<script setup lang="ts">
import { ref, nextTick, computed, watch, withDefaults } from "vue";
import { useAuth, useUser, SignInButton } from "@clerk/vue";
import { t } from "../i18n/utils/translate";
import Button from "./Button.vue";
import {
  type ChatMessage,
  type RoutingResult,
  getWelcomeMessage,
  routeInquiryWithAi,
} from "../lib/contactAi";
import { buildMailtoUrl, getInquiryRoute } from "../content/contact";
import { getSupabase } from "../lib/supabase";

const props = withDefaults(
  defineProps<{
    /** Full-viewport fixed layout on /chat */
    fixed?: boolean;
  }>(),
  { fixed: false },
);

const { isSignedIn, isLoaded } = useAuth();
const { user } = useUser();

const messages = ref<ChatMessage[]>([]);
const input = ref("");
const isLoading = ref(false);
const routing = ref<RoutingResult | null>(null);
const messagesEl = ref<HTMLElement | null>(null);

const canSend = computed(() => isSignedIn.value && input.value.trim().length > 0 && !isLoading.value);

const resetWelcome = () => {
  const name = user.value?.firstName ?? user.value?.fullName ?? null;
  messages.value = [{ role: "assistant", content: getWelcomeMessage(name) }];
  routing.value = null;
};

watch(
  [isSignedIn, user],
  () => {
    if (isSignedIn.value) resetWelcome();
  },
  { immediate: true },
);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
};

const saveInquiry = async (text: string, result: RoutingResult) => {
  const supabase = getSupabase();
  if (!supabase) return;

  await supabase.from("contact_inquiries").insert({
    inquiry_type: result.inquiryType,
    message: text,
    needs_admin: result.escalateToAdmin ?? false,
    user_email: user.value?.primaryEmailAddress?.emailAddress ?? null,
    user_id: user.value?.id ?? null,
    user_name: user.value?.fullName ?? null,
  });
};

const handleSend = async () => {
  if (!isSignedIn.value) return;

  const text = input.value.trim();
  if (!text || isLoading.value) return;

  messages.value.push({ role: "user", content: text });
  input.value = "";
  isLoading.value = true;
  routing.value = null;
  await scrollToBottom();

  const result = await routeInquiryWithAi({
    messages: messages.value,
    userEmail: user.value?.primaryEmailAddress?.emailAddress,
    userId: user.value?.id,
    userName: user.value?.fullName,
  });

  routing.value = result;
  messages.value.push({ role: "assistant", content: result.reply });
  await saveInquiry(text, result);

  isLoading.value = false;
  await scrollToBottom();
};

const mailtoUrl = computed(() => {
  if (!routing.value?.showEmailCta && !routing.value?.escalateToAdmin) return null;
  const route = getInquiryRoute(routing.value.inquiryType);
  const userMsgs = messages.value.filter((m) => m.role === "user").map((m) => m.content);
  return buildMailtoUrl(route, userMsgs.join("\n\n"));
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const formatContent = (content: string) =>
  content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");
</script>

<template>
  <div class="contact-chat-panel" :class="{ 'contact-chat-panel-fixed': props.fixed }">
    <div v-if="!isLoaded" class="contact-chat-gate">
      <p>{{ t("chat-loading") }}</p>
    </div>

    <div v-else-if="!isSignedIn" class="contact-chat-gate">
      <p>{{ t("chat-sign-in-required") }}</p>
      <SignInButton mode="modal">
        <Button renderAs="button" variant="accent">{{ t("chat-sign-in") }}</Button>
      </SignInButton>
    </div>

    <template v-else>
      <div ref="messagesEl" class="contact-chat-messages" role="log" aria-live="polite">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="['contact-chat-bubble', `contact-chat-bubble-${msg.role}`]"
        >
          <p class="contact-chat-text" v-html="formatContent(msg.content)"></p>
        </div>
        <div v-if="isLoading" class="contact-chat-bubble contact-chat-bubble-assistant">
          <p class="contact-chat-text contact-chat-typing">{{ t("chat-thinking") }}</p>
        </div>
      </div>

      <div v-if="routing?.escalateToAdmin" class="contact-chat-escalation">
        {{ t("chat-escalated") }}
      </div>

      <div v-if="mailtoUrl" class="contact-chat-action">
        <Button renderAs="a" variant="accent" :href="mailtoUrl" external>
          {{ t("chat-send-email") }}
        </Button>
      </div>

      <div class="contact-chat-input-row">
        <textarea
          v-model="input"
          class="contact-chat-input"
          :placeholder="t('chat-placeholder')"
          rows="2"
          :disabled="isLoading"
          @keydown="handleKeydown"
        />
        <button
          type="button"
          class="contact-chat-send"
          :disabled="!canSend"
          @click="handleSend"
          :aria-label="t('chat-send')"
        >
          →
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.contact-chat-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 0;

  &-fixed {
    height: 100%;
    gap: 0;

    .contact-chat-messages {
      flex: 1;
      min-height: 0;
      max-height: none;
      overflow-y: auto;
      padding: var(--space-sm) 0;
    }

    .contact-chat-escalation,
    .contact-chat-action {
      flex-shrink: 0;
    }

    .contact-chat-input-row {
      flex-shrink: 0;
      padding-top: var(--space-sm);
      background: transparent;
    }

    .contact-chat-bubble-assistant {
      border: none;
    }
  }
}

.contact-chat-gate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  color: var(--color-text-300);
  font-size: var(--font-size-md);
}

.contact-chat-escalation {
  font-size: var(--font-size-sm);
  color: var(--color-accent-400);
  font-weight: 600;
  padding: var(--space-xs) var(--space-sm);
  background: rgba(232, 93, 4, 0.1);
  border-radius: var(--radius-md);
}

.contact-chat-messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 280px;
  overflow-y: auto;
}

.contact-chat-bubble {
  max-width: 92%;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  line-height: 1.5;

  &-user {
    align-self: flex-end;
    background: var(--color-chat-user);
    color: var(--color-white-400);
  }

  &-assistant {
    align-self: flex-start;
    background: var(--color-chat-assistant);
    color: var(--color-text-400);
    border: 1px solid var(--color-border-subtle);
  }
}

.contact-chat-text {
  margin: 0;
}

.contact-chat-typing {
  opacity: 0.6;
  animation: pulse 1.2s ease-in-out infinite;
}

.contact-chat-input-row {
  display: flex;
  gap: var(--space-sm);
  align-items: flex-end;
}

.contact-chat-input {
  flex: 1;
  resize: none;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  font-family: inherit;
  font-size: var(--font-size-md);
  background: var(--color-background-400);
  color: var(--color-text-400);

  &:focus {
    outline: none;
    border-color: var(--color-accent-400);
  }
}

.contact-chat-send {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-accent-400);
  color: var(--color-white-400);
  font-size: 20px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
