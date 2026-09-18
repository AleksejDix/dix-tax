<script setup lang="ts">
// The row under the header while the reader is inside a country: where they are, and the rest
// of that country's pages. Not sticky, so the scroll padding for the anchors stays as it is.
const { t } = useI18n()
const { product, trail, sections } = useProductNav()

const sectionLink = 'py-1 text-xs font-medium text-ink no-underline hover:text-blue aria-[current=page]:text-blue-deep'
</script>

<template>
  <div v-if="product" class="no-print border-b border-rule bg-surface">
    <div class="wrap flex flex-wrap items-center justify-between gap-x-8 gap-y-1.5 py-2.5">
      <nav :aria-label="t('nav.here')">
        <ol class="flex flex-wrap items-center gap-x-2 text-2xs text-ink-soft">
          <li v-for="(crumb, i) in trail" :key="crumb.label" class="flex items-center gap-2">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="text-ink-soft no-underline hover:text-blue">
              {{ crumb.label }}
            </NuxtLink>
            <span v-else aria-current="page" class="font-semibold text-ink">{{ crumb.label }}</span>
            <span v-if="i < trail.length - 1" aria-hidden="true">&rsaquo;</span>
          </li>
        </ol>
      </nav>

      <nav v-if="sections.length" :aria-label="t('nav.menu')" class="flex flex-wrap gap-x-6">
        <template v-for="s in sections" :key="s.key">
          <NuxtLink v-if="s.to" :to="s.to" :class="sectionLink">{{ s.label }}</NuxtLink>
          <NuxtLink v-else :to="s.anchor" custom>
            <template #default="{ href, navigate }">
              <a :href="href" :class="sectionLink" @click="navigate">{{ s.label }}</a>
            </template>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </div>
</template>
