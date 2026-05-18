<script setup lang="ts">
import { useClerkAdmin } from "../../../composables/useClerkAdmin";
import { useRouter } from "../../../composables/useRouter";
import Button from "../../../components/Button.vue";

const { signOut, user } = useClerkAdmin();
const router = useRouter();

const handleSignOut = async () => {
  await signOut();
  router.replace("/admin/login");
};
</script>

<template>
  <div class="admin-denied">
    <div class="admin-denied-card">
      <h1>Access denied</h1>
      <p>
        Signed in as <strong>{{ user?.primaryEmailAddress?.emailAddress }}</strong> — this account is not
        authorized for admin.
      </p>
      <p class="admin-denied-hint">
        Add your Clerk user ID to <code>VITE_CLERK_ADMIN_USER_IDS</code> in Vercel to grant access.
      </p>
      <div class="admin-denied-actions">
        <Button renderAs="button" variant="accent" @click="handleSignOut">Sign out</Button>
        <Button renderAs="a" variant="border" href="/">Back to portfolio</Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-denied {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-outer);

  &-card {
    max-width: 440px;
    padding: var(--space-xl);
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);

    h1 {
      font-size: var(--font-size-title-sm);
      font-weight: 900;
      color: var(--color-text-400);
    }

    p {
      font-size: var(--font-size-md);
      color: var(--color-text-300);
      line-height: 1.5;
    }
  }

  &-hint {
    font-size: var(--font-size-sm) !important;

    code {
      font-size: 0.9em;
    }
  }

  &-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
  }
}
</style>
