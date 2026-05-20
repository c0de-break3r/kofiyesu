<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminApi } from "../../../composables/useAdminApi";
import { loadSiteContent } from "../../../composables/useSiteContent";
import Button from "../../../components/Button.vue";
import type { SiteAboutRow } from "../../../lib/siteContentTypes";

const emit = defineEmits<{ saved: [] }>();

const { adminFetch } = useAdminApi();
const saving = ref(false);
const error = ref<string | null>(null);
const form = ref({
  display_name: "",
  job_title: "",
  about_intro: "",
  about_tagline: "",
  location: "",
  servicesText: "",
});

const applyRow = (row: SiteAboutRow | null) => {
  form.value = {
    display_name: row?.display_name ?? "",
    job_title: row?.job_title ?? "",
    about_intro: row?.about_intro ?? "",
    about_tagline: row?.about_tagline ?? "",
    location: row?.location ?? "",
    servicesText: (row?.services ?? []).map((s) => s.name).join("\n"),
  };
};

const load = async () => {
  const res = await adminFetch("/api/admin/about");
  if (!res.ok) return;
  const data = (await res.json()) as { about: SiteAboutRow | null };
  applyRow(data.about);
};

onMounted(load);

const save = async () => {
  saving.value = true;
  error.value = null;
  try {
    const services = form.value.servicesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const res = await adminFetch("/api/admin/about", {
      method: "PATCH",
      body: JSON.stringify({
        display_name: form.value.display_name,
        job_title: form.value.job_title,
        about_intro: form.value.about_intro,
        about_tagline: form.value.about_tagline,
        location: form.value.location,
        services,
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Save failed");
    }

    await loadSiteContent(true);
    emit("saved");
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Save failed";
  } finally {
    saving.value = false;
  }
};

defineExpose({ reload: load });
</script>

<template>
  <section class="admin-section admin-form">
    <h2>About</h2>
    <p class="admin-note">Updates hero, about section, and services on the live site.</p>

    <label class="admin-field">
      <span>Display name</span>
      <input v-model="form.display_name" type="text" />
    </label>
    <label class="admin-field">
      <span>Job title (hero banner)</span>
      <input v-model="form.job_title" type="text" />
    </label>
    <label class="admin-field">
      <span>About intro</span>
      <textarea v-model="form.about_intro" rows="3" />
    </label>
    <label class="admin-field">
      <span>About tagline</span>
      <textarea v-model="form.about_tagline" rows="3" />
    </label>
    <label class="admin-field">
      <span>Location</span>
      <input v-model="form.location" type="text" />
    </label>
    <label class="admin-field">
      <span>Services (one per line)</span>
      <textarea v-model="form.servicesText" rows="5" />
    </label>

    <p v-if="error" class="admin-error">{{ error }}</p>
    <Button renderAs="button" variant="accent" :disabled="saving" @click="save">
      {{ saving ? "Saving…" : "Save about" }}
    </Button>
  </section>
</template>

<style scoped lang="scss">
@use "./admin-form.scss";
</style>
