import { ref } from "vue";

import type { Locale } from "./types";

export const locale = ref<Locale | null>("en");
export const translations = ref<Record<string, string>>({});
