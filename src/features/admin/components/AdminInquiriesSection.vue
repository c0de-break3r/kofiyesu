<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminApi } from "../../../composables/useAdminApi";

type Inquiry = {
  id: string;
  inquiry_type: string;
  message: string;
  needs_admin: boolean;
  user_email: string | null;
  user_name: string | null;
  created_at: string;
};

const { adminFetch } = useAdminApi();
const inquiries = ref<Inquiry[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await adminFetch("/api/admin/inquiries");
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      error.value = body.error ?? `Failed to load (${res.status})`;
      return;
    }
    const data = (await res.json()) as { inquiries?: Inquiry[] };
    inquiries.value = data.inquiries ?? [];
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load inquiries";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="admin-section">
    <h2>Contact inquiries</h2>
    <p v-if="loading" class="admin-note">Loading…</p>
    <p v-else-if="error" class="admin-note">{{ error }}</p>
    <p v-else-if="inquiries.length === 0" class="admin-note">No inquiries yet.</p>
    <ul v-else class="admin-inquiries">
      <li
        v-for="item in inquiries"
        :key="item.id"
        class="admin-inquiry"
        :class="{ 'admin-inquiry-urgent': item.needs_admin }"
      >
        <div class="admin-inquiry-meta">
          <span class="admin-inquiry-type">{{ item.inquiry_type }}</span>
          <span v-if="item.needs_admin" class="admin-inquiry-badge">Needs review</span>
        </div>
        <p v-if="item.user_name || item.user_email" class="admin-inquiry-user">
          {{ item.user_name ?? "Guest" }}
          <span v-if="item.user_email"> · {{ item.user_email }}</span>
        </p>
        <p class="admin-inquiry-message">{{ item.message }}</p>
        <time class="admin-inquiry-time">{{ new Date(item.created_at).toLocaleString() }}</time>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
.admin-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);

  h2 {
    font-size: var(--font-size-lg);
    font-weight: 800;
    color: var(--color-text-400);
  }
}

.admin-note {
  font-size: var(--font-size-sm);
  color: var(--color-text-300);
}

.admin-inquiries {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.admin-inquiry {
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
</style>
