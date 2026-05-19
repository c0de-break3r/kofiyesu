<script setup lang="ts">
import { ref, onMounted } from "vue";
import { t } from "../i18n/utils/translate";
import { lenis } from "../composables/useScroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projectId } from "../composables/useRouteObserver";
import ProfileNavButton from "./ProfileNavButton.vue";
import SoundsToggle from "./SoundsToggle.vue";
import { isFeatureEnabled } from "../utils/features";
import { useTheme } from "../composables/useTheme";

const { theme } = useTheme();
import NavHome from "./icons/NavHome.vue";
import NavAbout from "./icons/NavAbout.vue";
import NavProjects from "./icons/NavProjects.vue";
import NavContact from "./icons/NavContact.vue";

type NavSection = "hero" | "about" | "projects" | "contact";

const activeSection = ref<NavSection | null>(null);

const navItems: { id: NavSection; icon: typeof NavHome; labelKey: "about" | "projects" | "contact" }[] = [
  { id: "about", icon: NavAbout, labelKey: "about" },
  { id: "projects", icon: NavProjects, labelKey: "projects" },
  { id: "contact", icon: NavContact, labelKey: "contact" },
];

const scrollTo = (section: NavSection) => {
  if (!lenis.value) return;
  lenis.value.scrollTo(section === "hero" ? 0 : `#${section}`);
};

onMounted(() => {
  const sections: NavSection[] = ["hero", "about", "projects", "contact"];

  sections.forEach((section) => {
    const trigger = section === "hero" ? "#hero" : `#${section}`;
    ScrollTrigger.create({
      trigger,
      start: section === "hero" ? "top 40%" : section === "about" ? "top 30%" : "top center",
      end: "bottom center",
      onEnter: () => {
        activeSection.value = section;
      },
      onEnterBack: () => {
        activeSection.value = section;
      },
    });
  });
});
</script>

<template>
  <div
    class="mobile-nav-wrap"
    :class="{ 'mobile-nav-wrap-hidden': projectId !== null }"
    aria-label="Mobile navigation"
  >
    <nav class="mobile-nav-pill">
      <button
        type="button"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item-active': activeSection === 'hero' }"
        @click="scrollTo('hero')"
        data-sound="click"
        :aria-label="t('back-to-home')"
      >
        <NavHome class="mobile-nav-icon" />
        <span class="mobile-nav-label">Home</span>
      </button>

      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="mobile-nav-item"
        :class="{ 'mobile-nav-item-active': activeSection === item.id }"
        @click="scrollTo(item.id)"
        data-sound="click"
        :aria-label="t(item.labelKey)"
      >
        <component :is="item.icon" class="mobile-nav-icon" />
        <span class="mobile-nav-label">{{ t(item.labelKey) }}</span>
      </button>
    </nav>

    <SoundsToggle
      v-if="isFeatureEnabled('sounds')"
      class="mobile-nav-sounds"
      :isDarkTheme="theme === 'dark'"
    />
    <ProfileNavButton />
  </div>
</template>

<style scoped lang="scss">
.mobile-nav-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-index-mobile-nav);
  width: calc(100% - 24px);
  max-width: 420px;
  transition: transform 0.35s var(--ease-smooth), opacity 0.25s ease;

  @include mixins.mq("lg") {
    display: none;
  }

  &-hidden {
    transform: translateX(-50%) translateY(calc(100% + 24px));
    opacity: 0;
    pointer-events: none;
  }
}

.mobile-nav-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(15, 20, 25, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.28);
}

[data-theme="light"] .mobile-nav-pill {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(26, 29, 33, 0.08);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  padding: 8px 4px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &-active {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }
}

[data-theme="light"] .mobile-nav-item {
  color: rgba(26, 29, 33, 0.45);

  &-active {
    color: var(--color-text-400);
    background: rgba(26, 29, 33, 0.08);
  }
}

.mobile-nav-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.mobile-nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.mobile-nav-sounds {
  flex-shrink: 0;
}
</style>
