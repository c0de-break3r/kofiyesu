<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue";
import { computed, onMounted, ref, watch } from "vue";
import { t } from "../i18n/utils/translate";
import { lenis } from "../composables/useScroll";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeaderTheme } from "../composables/useHeaderTheme";
import { path, projectId } from "../composables/useRouteObserver";
import { useRouter } from "../composables/useRouter";

type NavSection = "home" | "about" | "projects" | "chat";

const router = useRouter();

const scrollSections: Exclude<NavSection, "chat">[] = ["home", "about", "projects"];

const sections: NavSection[] = ["home", "about", "projects", "chat"];

const activeLink = ref<NavSection | null>(null);
const isMounted = ref(false);

const barStyle = ref({ transform: "", width: "" });
const ITEM_WIDTH = 108;

const { isDarkTheme, hasScrolledIntoView } = useHeaderTheme();

const ariaLabels: Record<NavSection, string> = {
  home: t("home"),
  about: t("about"),
  projects: t("projects"),
  chat: t("chat"),
};

const isChatRoute = computed(() => path.value === "/chat" || path.value.startsWith("/chat/"));

const updateBarPosition = () => {
  const index = sections.indexOf(activeLink.value as NavSection);
  if (index < 0) {
    barStyle.value = { transform: "", width: "" };
    return;
  }
  barStyle.value = {
    transform: `translateX(${index * ITEM_WIDTH}px)`,
    width: `${ITEM_WIDTH}px`,
  };
};

const handleNav = (section: NavSection) => {
  if (section === "chat") {
    router.push("/chat");
    activeLink.value = "chat";
    updateBarPosition();
    return;
  }

  if (section === "home") {
    lenis.value?.scrollTo(0);
    return;
  }

  lenis.value?.scrollTo(`#${section}`);
};

watch(isChatRoute, (onChat) => {
  if (onChat) {
    activeLink.value = "chat";
    updateBarPosition();
  }
});

watch(path, () => {
  if (!isChatRoute.value && activeLink.value === "chat") {
    activeLink.value = null;
    updateBarPosition();
  }
});

onMounted(() => {
  scrollSections.forEach((section) => {
    const trigger = section === "home" ? "#hero" : `#${section}`;
    ScrollTrigger.create({
      trigger,
      start: section === "home" ? "top 40%" : section === "about" ? "top 22.5%" : "top center",
      end: "bottom center",
      onEnter: () => {
        if (!isChatRoute.value) {
          activeLink.value = section;
          updateBarPosition();
        }
      },
      onEnterBack: () => {
        if (!isChatRoute.value) {
          activeLink.value = section;
          updateBarPosition();
        }
      },
      onLeave: () => {
        if (!isChatRoute.value) activeLink.value = null;
      },
      onLeaveBack: () => {
        if (!isChatRoute.value) activeLink.value = null;
      },
    });
  });

  if (isChatRoute.value) {
    activeLink.value = "chat";
    updateBarPosition();
  }

  ScrollTrigger.refresh();
  isMounted.value = true;
});
</script>

<template>
  <div :class="['header-home', { 'header-home-mounted': isMounted, 'header-home-isProjectPage': projectId !== null }]">
    <div :class="['header-home-links', { 'header-home-links-dark': isDarkTheme }]">
      <div
        :class="[
          'header-home-bar',
          {
            'header-home-bar-active':
              (activeLink !== null && hasScrolledIntoView) || activeLink === 'chat',
            'header-home-bar-dark': isDarkTheme,
          },
        ]"
        :style="barStyle"
      />
      <HeaderLink
        v-for="section in sections"
        :key="section"
        :is-active="activeLink === section && (hasScrolledIntoView || section === 'chat')"
        :class="[
          'header-home-link',
          {
            'header-home-link-active':
              activeLink === section && (hasScrolledIntoView || section === 'chat'),
          },
          'children-unclickable',
        ]"
        :is-dark-theme="isDarkTheme"
        :aria-label="ariaLabels[section]"
        data-sound="click"
        data-hoversound="hover"
        @click="handleNav(section)"
      >
        {{ ariaLabels[section] }}
      </HeaderLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-home {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-index-header-home);
  height: var(--height-header);
  align-items: center;
  justify-content: center;
  display: none;
  opacity: 0;
  transition:
    opacity 0.3s ease-in-out,
    transform var(--transition-route-duration) var(--transition-route-ease);

  &-isProjectPage {
    transform: translateX(-50%) translateY(-100%);
  }

  &-mounted {
    opacity: 1;
  }

  @include mixins.mq("lg") {
    display: flex;
  }

  &-links {
    position: relative;
    display: flex;
    padding: 3px;
    background-color: var(--color-beige-500);
    border-radius: 100px;
    color: var(--color-text-400);
    transition:
      color 0.1s ease-in-out,
      background-color 0.1s ease-in-out;

    &-dark {
      background-color: var(--color-dark-blue-500);
      color: var(--color-white-400);
    }
  }

  &-bar {
    position: absolute;
    top: 3px;
    left: 3px;
    height: calc(100% - 6px);
    background: var(--color-orange-400);
    border-radius: 100px;
    transition:
      transform 0.3s var(--ease-smooth),
      opacity 0.1s ease-in-out,
      background-color 0.1s ease-in-out,
      width 0.3s var(--ease-smooth);
    z-index: 1;
    opacity: 0;

    &-dark {
      background-color: var(--color-cyan-500);
    }

    &-active {
      opacity: 1;
    }
  }

  &-link {
    position: relative;
    z-index: 2;
    letter-spacing: 0.02em;
    font-weight: 700;
    border: none;
    background: none;
    transition: color 0.1s ease-in-out;
    font-size: var(--font-size-sm);
    width: 108px;
    white-space: nowrap;
    text-transform: capitalize;

    @include mixins.mq("xl") {
      font-size: var(--font-size-md);
    }

    &-active {
      color: var(--color-white-400);
    }
  }
}
</style>
