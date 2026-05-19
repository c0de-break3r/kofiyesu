<script setup lang="ts">
import HeaderLink from "./HeaderLink.vue";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
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

const barStyle = ref({ transform: "translateX(0)", width: "0" });
const linkEls = ref<Partial<Record<NavSection, HTMLElement>>>({});
let scrollTriggers: ScrollTrigger[] = [];

const { isDarkTheme } = useHeaderTheme();

const ariaLabels: Record<NavSection, string> = {
  home: t("home"),
  about: t("about"),
  projects: t("projects"),
  chat: t("chat"),
};

const isChatRoute = computed(() => path.value === "/chat" || path.value.startsWith("/chat/"));

const isLinkActive = (section: NavSection) => activeLink.value === section;

const isBarVisible = () => activeLink.value !== null;

const setLinkRef = (section: NavSection) => (el: unknown) => {
  if (!el) {
    delete linkEls.value[section];
    return;
  }
  const node =
    el && typeof el === "object" && "$el" in el
      ? (el as { $el: HTMLElement }).$el
      : (el as HTMLElement);
  linkEls.value[section] = node;
};

const updateBarPosition = () => {
  const section = activeLink.value;
  if (!section) {
    barStyle.value = { transform: "translateX(0)", width: "0" };
    return;
  }

  const el = linkEls.value[section];
  if (!el) return;

  barStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
  };
};

const onResize = () => updateBarPosition();

const handleNav = (section: NavSection) => {
  if (section === "chat") {
    router.push("/chat");
    activeLink.value = "chat";
    updateBarPosition();
    return;
  }

  activeLink.value = section;
  updateBarPosition();

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
    const scrollTop = lenis.value?.scroll ?? window.scrollY ?? 0;
    activeLink.value = scrollTop < 80 ? "home" : null;
    nextTick(updateBarPosition);
    ScrollTrigger.refresh();
  }
});

watch(activeLink, () => nextTick(updateBarPosition));

onMounted(() => {
  scrollTriggers = [];
  scrollSections.forEach((section) => {
    const trigger = section === "home" ? "#hero" : `#${section}`;
    scrollTriggers.push(
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
      }),
    );
  });

  if (isChatRoute.value) {
    activeLink.value = "chat";
  } else if ((lenis.value?.scroll ?? window.scrollY ?? 0) < 80) {
    activeLink.value = "home";
  }

  window.addEventListener("resize", onResize);
  ScrollTrigger.refresh();
  nextTick(updateBarPosition);
  isMounted.value = true;
});

onUnmounted(() => {
  scrollTriggers.forEach((st) => st.kill());
  scrollTriggers = [];
  window.removeEventListener("resize", onResize);
});
</script>

<template>
  <div :class="['header-home', { 'header-home-mounted': isMounted, 'header-home-isProjectPage': projectId !== null }]">
    <div :class="['header-home-links', { 'header-home-links-dark': isDarkTheme }]">
      <div
        :class="[
          'header-home-bar',
          {
            'header-home-bar-active': isBarVisible(),
            'header-home-bar-dark': isDarkTheme,
          },
        ]"
        :style="barStyle"
      />
      <HeaderLink
        v-for="section in sections"
        :key="section"
        :ref="setLinkRef(section)"
        compact
        :is-active="isLinkActive(section)"
        :class="[
          'header-home-link',
          { 'header-home-link-active': isLinkActive(section) },
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
    pointer-events: auto;
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
    z-index: 2;

    &-active {
      color: var(--color-white-400);
    }
  }
}
</style>
