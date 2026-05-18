<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useClerkAdmin } from "../../../composables/useClerkAdmin";
import { useRouter } from "../../../composables/useRouter";
import { getSupabase, isSupabaseConfigured } from "../../../lib/supabase";
import Button from "../../../components/Button.vue";
import { features } from "../../../utils/features";

const { user, signOut } = useClerkAdmin();
const router = useRouter();
const inquiries = ref<
  {
    id: string;
    inquiry_type: string;
    message: string;
    needs_admin: boolean;
    user_email: string | null;
    user_name: string | null;
    created_at: string;
  }[]
>([]);
const loading = ref(true);

const handleSignOut = async () => {
  await signOut();
  router.replace("/");
};

onMounted(async () => {
  const supabase = getSupabase();
  if (!supabase) {
    loading.value = false;
    return;
  }

  const { data } = await supabase
    .from("contact_inquiries")
    .select("id, inquiry_type, message, needs_admin, user_email, user_name, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  inquiries.value = data ?? [];
  loading.value = false;
});
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-dashboard-header">
      <div>
        <h1 class="admin-dashboard-title">Dashboard</h1>
        <p class="admin-dashboard-subtitle">
          {{ user?.fullName ?? user?.primaryEmailAddress?.emailAddress }}
        </p>
      </div>
      <Button renderAs="button" variant="border" @click="handleSignOut">Sign out</Button>
    </header>

    <section class="admin-dashboard-section">
      <h2>Site features</h2>
      <ul class="admin-dashboard-list">
        <li v-for="(enabled, key) in features" :key="key">
          <span>{{ key }}</span>
          <span :class="enabled ? 'admin-badge-on' : 'admin-badge-off'">{{ enabled ? "On" : "Off" }}</span>
        </li>
      </ul>
    </section>

    <section class="admin-dashboard-section">
      <h2>Contact inquiries</h2>
      <p v-if="!isSupabaseConfigured" class="admin-dashboard-note">
        Configure Supabase to log and view chat inquiries.
      </p>
      <p v-else-if="loading" class="admin-dashboard-note">Loading…</p>
      <p v-else-if="inquiries.length === 0" class="admin-dashboard-note">No inquiries yet.</p>
      <ul v-else class="admin-dashboard-inquiries">
        <li
          v-for="item in inquiries"
          :key="item.id"
          class="admin-dashboard-inquiry"
          :class="{ 'admin-dashboard-inquiry-urgent': item.needs_admin }"
        >
          <div class="admin-dashboard-inquiry-meta">
            <span class="admin-dashboard-inquiry-type">{{ item.inquiry_type }}</span>
            <span v-if="item.needs_admin" class="admin-dashboard-inquiry-badge">Needs review</span>
          </div>
          <p v-if="item.user_name || item.user_email" class="admin-dashboard-inquiry-user">
            {{ item.user_name ?? "Guest" }}
            <span v-if="item.user_email"> · {{ item.user_email }}</span>
          </p>
          <p class="admin-dashboard-inquiry-message">{{ item.message }}</p>
          <time class="admin-dashboard-inquiry-time">{{ new Date(item.created_at).toLocaleString() }}</time>
        </li>
      </ul>
    </section>

    <a href="/" class="admin-dashboard-back">← View portfolio</a>
  </div>
</template>

<style scoped lang="scss">
.admin-dashboard {
  min-height: 100vh;
  padding: var(--space-xl) var(--space-outer);
  max-width: 800px;
  margin: 0 auto;
  background: var(--color-background-400);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  &-title {
    font-size: var(--font-size-title-md);
    font-weight: 900;
    color: var(--color-text-400);
  }

  &-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    margin-top: var(--space-xxs);
  }

  &-section {
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);

    h2 {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--color-text-400);
    }
  }

  &-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);

    li {
      display: flex;
      justify-content: space-between;
      font-size: var(--font-size-md);
      color: var(--color-text-400);
    }
  }

  &-note {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
  }

  &-inquiries {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  &-inquiry {
    padding: var(--space-md);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);

    &-urgent {
      border-color: var(--color-accent-400);
      background: rgba(232, 93, 4, 0.06);
    }

    &-meta {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    &-badge {
      font-size: var(--font-size-xxs);
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-accent-400);
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(232, 93, 4, 0.12);
    }

    &-user {
      font-size: var(--font-size-xs);
      color: var(--color-text-300);
    }

    &-type {
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      color: var(--color-accent-400);
    }

    &-message {
      font-size: var(--font-size-sm);
      color: var(--color-text-400);
    }

    &-time {
      font-size: var(--font-size-xxs);
      color: var(--color-text-300);
    }
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

.admin-badge-on {
  color: #16a34a;
  font-weight: 700;
  font-size: var(--font-size-sm);
}

.admin-badge-off {
  color: var(--color-text-300);
  font-size: var(--font-size-sm);
}
</style>
