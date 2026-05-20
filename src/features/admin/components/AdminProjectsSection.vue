<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminApi } from "../../../composables/useAdminApi";
import { loadSiteContent } from "../../../composables/useSiteContent";
import { uploadImageToCloudinary, isCloudinaryConfigured } from "../../../lib/cloudinary";
import type { SiteProjectRow } from "../../../lib/siteContentTypes";
import Button from "../../../components/Button.vue";

const emit = defineEmits<{ saved: [] }>();

const { adminFetch } = useAdminApi();
const projects = ref<SiteProjectRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const editingId = ref<string | null>(null);

const emptyForm = () => ({
  slug: "",
  title: "",
  theme: "dark" as "light" | "dark",
  tags: "",
  description: "",
  thumbnail_url: "",
  live_url: "",
  source_url: "",
  published: true,
});

const form = ref(emptyForm());

const load = async () => {
  loading.value = true;
  const res = await adminFetch("/api/admin/projects");
  if (res.ok) {
    const data = (await res.json()) as { projects: SiteProjectRow[] };
    projects.value = data.projects ?? [];
  }
  loading.value = false;
};

onMounted(load);

const startNew = () => {
  editingId.value = "new";
  form.value = emptyForm();
};

const startEdit = (row: SiteProjectRow) => {
  editingId.value = row.id;
  form.value = {
    slug: row.slug,
    title: row.title,
    theme: row.theme,
    tags: (row.tags ?? []).join(", "),
    description: row.description ?? "",
    thumbnail_url: row.thumbnail_url ?? "",
    live_url: row.live_url ?? "",
    source_url: row.source_url ?? "",
    published: row.published,
  };
};

const cancelEdit = () => {
  editingId.value = null;
  form.value = emptyForm();
};

const onThumbnailPick = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!isCloudinaryConfigured()) {
    error.value = "Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET";
    return;
  }
  try {
    saving.value = true;
    form.value.thumbnail_url = await uploadImageToCloudinary(file);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Upload failed";
  } finally {
    saving.value = false;
  }
};

const save = async () => {
  saving.value = true;
  error.value = null;
  try {
    const payload = {
      slug: form.value.slug,
      title: form.value.title,
      theme: form.value.theme,
      tags: form.value.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      description: form.value.description,
      thumbnail_url: form.value.thumbnail_url || null,
      live_url: form.value.live_url || null,
      source_url: form.value.source_url || null,
      published: form.value.published,
      components: [],
    };

    const isNew = editingId.value === "new";
    const res = await adminFetch(
      isNew ? "/api/admin/projects" : `/api/admin/projects?id=${editingId.value}`,
      {
        method: isNew ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Save failed");
    }

    await load();
    await loadSiteContent(true);
    cancelEdit();
    emit("saved");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Save failed";
  } finally {
    saving.value = false;
  }
};

const remove = async (id: string) => {
  if (!confirm("Delete this project?")) return;
  const res = await adminFetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
  if (res.ok) {
    await load();
    await loadSiteContent(true);
    emit("saved");
  }
};
</script>

<template>
  <section class="admin-section admin-form">
    <div class="admin-form-row">
      <h2>Projects</h2>
      <Button renderAs="button" variant="border" @click="startNew">Add project</Button>
    </div>

    <p v-if="!isCloudinaryConfigured()" class="admin-note">
      Add Cloudinary env vars to upload thumbnails.
    </p>

    <p v-if="loading" class="admin-note">Loading…</p>
    <ul v-else class="admin-project-list">
      <li v-for="p in projects" :key="p.id" class="admin-project-item">
        <div>
          <img v-if="p.thumbnail_url" :src="p.thumbnail_url" alt="" class="admin-thumb-preview" />
          <p class="admin-project-item-title">{{ p.title }}</p>
          <p class="admin-project-item-slug">/{{ p.slug }}</p>
        </div>
        <div class="admin-project-item-actions">
          <Button renderAs="button" variant="border" @click="startEdit(p)">Edit</Button>
          <Button renderAs="button" variant="border" @click="remove(p.id)">Delete</Button>
        </div>
      </li>
    </ul>

    <div v-if="editingId" class="admin-section admin-form">
      <h3>{{ editingId === "new" ? "New project" : "Edit project" }}</h3>
      <label class="admin-field">
        <span>Slug</span>
        <input v-model="form.slug" type="text" placeholder="my-project" />
      </label>
      <label class="admin-field">
        <span>Title</span>
        <input v-model="form.title" type="text" />
      </label>
      <label class="admin-field">
        <span>Theme</span>
        <select v-model="form.theme">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </label>
      <label class="admin-field">
        <span>Tags (comma-separated)</span>
        <input v-model="form.tags" type="text" placeholder="node, python" />
      </label>
      <label class="admin-field">
        <span>Description (HTML allowed)</span>
        <textarea v-model="form.description" rows="4" />
      </label>
      <label class="admin-field">
        <span>Thumbnail</span>
        <input type="file" accept="image/*" @change="onThumbnailPick" />
        <img v-if="form.thumbnail_url" :src="form.thumbnail_url" alt="" class="admin-thumb-preview" />
      </label>
      <label class="admin-field">
        <span>Live URL</span>
        <input v-model="form.live_url" type="url" />
      </label>
      <label class="admin-field">
        <span>Source URL</span>
        <input v-model="form.source_url" type="url" />
      </label>
      <label class="admin-field">
        <span>
          <input v-model="form.published" type="checkbox" />
          Published
        </span>
      </label>
      <p v-if="error" class="admin-error">{{ error }}</p>
      <div class="admin-form-row">
        <Button renderAs="button" variant="accent" :disabled="saving" @click="save">
          {{ saving ? "Saving…" : "Save project" }}
        </Button>
        <Button renderAs="button" variant="border" @click="cancelEdit">Cancel</Button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "./admin-form.scss";
</style>
