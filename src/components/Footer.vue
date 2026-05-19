<script setup lang="ts">
import Social from "./Social.vue";
import NotchSection from "./NotchSection.vue";

interface Props {
  withSocial?: boolean;
}

const { withSocial = true } = defineProps<Props>();
</script>

<template>
  <footer class="footer">
    <NotchSection class="footer-notch" />
    <div class="footer-content">
      <div class="footer-top">
        <Social v-if="withSocial" />
      </div>
      <div class="footer-credits">
        <p>© {{ new Date().getFullYear() }} Obed Prince Kofi Yesu</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: var(--color-background-300, var(--color-beige-400));
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;

  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    max-width: calc(var(--breakpoint-xxxl));
    padding: var(--space-md) var(--space-outer);
    padding-bottom: calc(var(--space-md) + 72px);

    @include mixins.mq("lg") {
      padding-bottom: var(--space-md);
    }
  }

  &-top {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
  }

  &-credits {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    font-size: var(--font-size-sm);
    color: var(--color-text-300);

    @include mixins.mq("lg") {
      display: flex;
    }
  }

  &-notch {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    color: var(--color-background-300, var(--color-beige-400));
    --icon-color: var(--color-background-300, var(--color-beige-400));
  }
}
</style>
