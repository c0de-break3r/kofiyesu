<script setup lang="ts">
import { SignInButton, Show } from "@clerk/vue";
import Button from "../../../components/Button.vue";
</script>

<template>
  <div class="admin-login">
    <div class="admin-login-card">
      <h1 class="admin-login-title">Admin</h1>
      <p class="admin-login-subtitle">Sign in with your authorized Clerk account to manage inquiries.</p>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button renderAs="button" variant="accent">Sign in with Clerk</Button>
        </SignInButton>
      </Show>

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

  &-subtitle {
    font-size: var(--font-size-md);
    color: var(--color-text-300);
    line-height: 1.5;
  }

  &-back {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    text-decoration: none;
    margin-top: var(--space-sm);

    &:hover {
      color: var(--color-accent-400);
    }
  }
}
</style>
