<script setup lang="ts">
import { computed, watch } from "vue";
import Header from "./components/Header.vue";
import MobileNav from "./components/MobileNav.vue";
import { useTranslations } from "./i18n/composables/useTranslations";
import { usePreloader } from "./composables/usePreloader";
import Cursor from "./components/Cursor.vue";
import { useAgent } from "./composables/useAgent";
import { useMusic } from "./features/sounds/composables/useMusic";
import { useHowler } from "./features/sounds/composables/useHowler";
import { useRouteObserver, path, projectVisible } from "./composables/useRouteObserver";
import Home from "./features/home/components/Home.vue";
import Project from "./features/projects/components/Project.vue";
import ChatPage from "./features/chat/ChatPage.vue";
import AdminPanel from "./features/admin/components/AdminPanel.vue";
import { loadSiteContent } from "./composables/useSiteContent";
import { useProjectTransition } from "./composables/useProjectTransition";
import { useScroll } from "./composables/useScroll";
import ProjectBackground from "./features/projects/components/ProjectBackground.vue";
import { useClickSound } from "./features/sounds/composables/useClickSounds";
import { renderer } from "./three/core/renderer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLegacyAdminRoute } from "./composables/useLegacyAdminRoute";
//import { useHoverSound } from "./features/sounds/composables/useHoverSounds";

const { isTransitioning } = useProjectTransition();

const isChatRoute = computed(() => path.value === "/chat" || path.value.startsWith("/chat/"));

useTranslations();
usePreloader();
useMusic();
useHowler();
useScroll();
useRouteObserver();
useLegacyAdminRoute();
useClickSound();
loadSiteContent();
//useHoverSound();
const { isTouch } = useAgent();

watch(
  [isChatRoute, projectVisible],
  ([onChat, onProject]) => {
    renderer.setIsActive(!onChat && !onProject);
    if (!onChat && !onProject) {
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  },
  { immediate: true },
);
</script>

<template>
  <Header />

  <div v-show="!isChatRoute" class="app-shell">
    <div :class="{ 'home-wrapper-projectIsReady': projectVisible }">
      <Home />
    </div>

    <ProjectBackground />
    <div
      class="project-wrapper"
      :class="{
        'project-wrapper-visible': projectVisible,
        'project-wrapper-transitioning': isTransitioning,
      }"
    >
      <div class="project-content">
        <Project />
      </div>
    </div>

    <Cursor v-if="!isTouch" />
  </div>

  <ChatPage v-if="isChatRoute" class="app-chat-layer" />
  <MobileNav v-show="!projectVisible" />
  <AdminPanel />
</template>

<style lang="scss">
.app-chat-layer {
  position: fixed;
  top: var(--height-header);
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
}

.home-wrapper-projectIsReady {
  visibility: hidden;
  position: fixed;
  inset: 0;
}

.project-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: var(--z-index-layout-project);
  visibility: hidden;
  pointer-events: none;

  &-visible {
    visibility: visible;
    pointer-events: auto;
    position: static;
  }
}

.project-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

html.admin-panel-open {
  overflow: hidden;
}
</style>
