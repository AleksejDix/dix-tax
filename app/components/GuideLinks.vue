<script setup lang="ts">
// The guides that belong to one country, linked from its page. It is also how they reach the
// prerenderer: `crawlLinks` follows these, so every guide is built in every language without
// a list of routes to keep in step.
const props = defineProps<{ country: Product['key'] }>()

const { t } = useI18n()
const localePath = useLocalePath()

const guides = computed(() => GUIDES.filter((g) => g.country === props.country))
</script>

<template>
  <nav v-if="guides.length" :aria-label="t('guides.kicker')" class="grid gap-3">
    <NuxtLink
      v-for="g in guides"
      :key="g.key"
      :to="localePath(g.path)"
      class="group grid gap-1 border-t border-rule pt-3 no-underline"
    >
      <span class="text-2xs text-ink-soft">{{ t('guides.kicker') }}</span>
      <span class="font-semibold text-ink group-hover:text-blue">{{ t(`guides.${g.key}.title`) }}</span>
      <span class="text-xs text-ink-soft">{{ t(`guides.${g.key}.lead`) }}</span>
    </NuxtLink>
  </nav>
</template>
