<script setup lang="ts">
import { computed, watch } from "vue";
import { path } from "../../../composables/useRouteObserver";
import { useClerkAdmin } from "../../../composables/useClerkAdmin";
import { useRouter } from "../../../composables/useRouter";
import AdminLogin from "./AdminLogin.vue";
import AdminDashboard from "./AdminDashboard.vue";
import AdminAccessDenied from "./AdminAccessDenied.vue";

const router = useRouter();
const { isLoaded, isSignedIn, canAccessAdmin, isClerkConfigured, isClerkAdminConfigured } = useClerkAdmin();

const isLoginPage = computed(() => path.value === "/admin/login" || path.value === "/admin/login/");
const isAdminRoot = computed(() => path.value === "/admin" || path.value === "/admin/");

watch([isLoaded, isSignedIn, canAccessAdmin, path], () => {
  if (!isLoaded.value) return;

  if (canAccessAdmin.value && isLoginPage.value) {
    router.replace("/admin");
    return;
  }

  if (isAdminRoot.value && isSignedIn.value && !canAccessAdmin.value) {
    router.replace("/admin/login");
  }
});
</script>

<template>
  <div class="admin-app">
    <div v-if="!isClerkConfigured" class="admin-app-message">
      <p>Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable authentication.</p>
      <a href="/">← Back to portfolio</a>
    </div>

    <div v-else-if="!isClerkAdminConfigured" class="admin-app-message">
      <p>
        Add <code>VITE_CLERK_ADMIN_USER_IDS</code> in Vercel (comma-separated Clerk user IDs) to enable the
        admin panel.
      </p>
      <a href="/">← Back to portfolio</a>
    </div>

    <div v-else-if="!isLoaded" class="admin-app-loading">Loading…</div>

    <AdminDashboard v-else-if="canAccessAdmin && isAdminRoot" />

    <AdminAccessDenied v-else-if="isSignedIn && !canAccessAdmin" />

    <AdminLogin v-else />
  </div>
</template>

<style scoped lang="scss">
.admin-app {
  min-height: 100vh;
  background: var(--color-background-400);

  &-loading,
  &-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    min-height: 100vh;
    padding: var(--space-outer);
    color: var(--color-text-300);
    text-align: center;

    a {
      color: var(--color-accent-400);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    code {
      font-size: 0.9em;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--color-surface-elevated);
    }
  }
}
</style>
