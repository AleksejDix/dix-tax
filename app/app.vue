<script setup lang="ts">
const { t } = useI18n()
const head = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: head.value.link,
  meta: head.value.meta,
  titleTemplate: (title?: string) => (title ? `${title} | dix.tax` : t('meta.title')),
}))

useSeoMeta({
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogType: 'website',
})

// Default link preview; pages with their own picture call this again with their own name.
useSocialImage('home')
</script>

<template>
  <div class="app">
    <a href="#main" class="skip">{{ t('nav.skip') }}</a>
    <SiteHeader />
    <SiteProductBar />
    <main id="main">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.skip {
  position: absolute;
  left: 1rem;
  top: -4rem;
  z-index: 100;
  padding: 0.6rem 1rem;
  background: var(--ink);
  color: #fff;
  border-radius: var(--radius);
}

.skip:focus {
  top: 1rem;
}
</style>
