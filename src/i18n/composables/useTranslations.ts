import { watch } from "vue";
import { loadTranslations } from "../utils/load";
import { locale, translations } from "../store";
import { onMounted } from "vue";
import { LOCALE_DEFAULT } from "../constants";

export const useTranslations = () => {
  onMounted(() => {
    locale.value = LOCALE_DEFAULT;
    window.localStorage.setItem("portfolio-locale", LOCALE_DEFAULT);
  });

  watch(
    locale,
    async (newLocale) => {
      if (!newLocale) return;
      translations.value = (await loadTranslations("common", newLocale)) ?? {};
    },
    { immediate: true },
  );
};
