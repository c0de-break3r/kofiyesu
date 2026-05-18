<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "../../../composables/useAuth";
import { useRouter } from "../../../composables/useRouter";
import Button from "../../../components/Button.vue";

const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const { signIn, authError, isSupabaseConfigured } = useAuth();
const router = useRouter();

const handleSubmit = async () => {
  isSubmitting.value = true;
  const { error } = await signIn(email.value, password.value);
  isSubmitting.value = false;
  if (!error) {
    router.replace("/admin");
  }
};
</script>

<template>
  <div class="admin-login">
    <div class="admin-login-card">
      <h1 class="admin-login-title">Admin</h1>
      <p v-if="!isSupabaseConfigured" class="admin-login-error">
        Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your
        environment to enable authentication.
      </p>
      <form v-else class="admin-login-form" @submit.prevent="handleSubmit">
        <label class="admin-login-label">
          Email
          <input v-model="email" type="email" required autocomplete="email" class="admin-login-input" />
        </label>
        <label class="admin-login-label">
          Password
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="admin-login-input"
          />
        </label>
        <p v-if="authError" class="admin-login-error">{{ authError }}</p>
        <Button renderAs="button" variant="accent" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? "Signing in…" : "Sign in" }}
        </Button>
      </form>
      <a href="/" class="admin-login-back">← Back to portfolio</a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-outer);
  background: var(--color-background-400);

  &-card {
    width: 100%;
    max-width: 400px;
    padding: var(--space-xl);
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  &-title {
    font-size: var(--font-size-title-sm);
    font-weight: 900;
    color: var(--color-text-400);
  }

  &-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  &-label {
    display: flex;
    flex-direction: column;
    gap: var(--space-xxs);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-300);
  }

  &-input {
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-md);
    background: var(--color-background-400);
    color: var(--color-text-400);

    &:focus {
      outline: none;
      border-color: var(--color-accent-400);
    }
  }

  &-error {
    font-size: var(--font-size-sm);
    color: #dc2626;
  }

  &-back {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    text-decoration: none;

    &:hover {
      color: var(--color-accent-400);
    }
  }
}
</style>
