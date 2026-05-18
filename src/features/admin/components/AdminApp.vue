<script setup lang="ts">
import { computed, watch, onMounted } from "vue";
import { path } from "../../../composables/useRouteObserver";
import { useAuth, initAuth } from "../../../composables/useAuth";
import { useRouter } from "../../../composables/useRouter";
import AdminLogin from "./AdminLogin.vue";
import AdminDashboard from "./AdminDashboard.vue";

const router = useRouter();
const { isAuthenticated, authLoading } = useAuth();

const isLoginPage = computed(() => path.value === "/admin/login" || path.value === "/admin/login/");
const isAdminRoot = computed(() => path.value === "/admin" || path.value === "/admin/");

onMounted(() => {
  initAuth();
});

watch([isAuthenticated, authLoading, path], () => {
  if (authLoading.value) return;

  if (!isAuthenticated.value && isAdminRoot.value) {
    router.replace("/admin/login");
  } else if (isAuthenticated.value && isLoginPage.value) {
    router.replace("/admin");
  }
});
</script>

<template>
  <div class="admin-app">
    <div v-if="authLoading" class="admin-app-loading">Loading…</div>
    <AdminLogin v-else-if="isLoginPage || (!isAuthenticated && isAdminRoot)" />
    <AdminDashboard v-else-if="isAuthenticated" />
  </div>
</template>

<style scoped lang="scss">
.admin-app {
  min-height: 100vh;
  background: var(--color-background-400);

  &-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: var(--color-text-300);
  }
}
</style>
