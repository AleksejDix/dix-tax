<script setup lang="ts">
// Trust signals that are true today, plus reviews once they exist in app.config.
const { t } = useI18n()
const { objects } = useList()
const items = computed(() => objects('trust.items', ['title', 'body']))
const reviews = useAppConfig().reviews
</script>

<template>
  <UiSection :title="t('trust.title')" title-id="trust-title" tone="surface" bordered>
    <ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
      <li v-for="(item, i) in items" :key="i" class="border-t-[3px] border-blue-deep pt-4">
        <h3>{{ item.title }}</h3>
        <p class="mt-2.5 text-xs text-ink-soft">{{ item.body }}</p>
      </li>
    </ul>
    <div v-if="reviews.length" class="mt-10 rounded-r-md border-l-4 border-ok bg-ok-tint px-6 py-5">
      <h3 class="mb-1.5 text-base">{{ t('trust.reviewTitle') }}</h3>
      <p v-for="(r, i) in reviews" :key="i">
        {{ t('trust.reviewedBy', { name: r.name, firm: r.firm, date: r.date }) }}
      </p>
    </div>
  </UiSection>
</template>
