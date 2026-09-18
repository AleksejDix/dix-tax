<script setup lang="ts">
// The row under the header: where the reader is, and the rest of that country's pages. It is
// on every page, including the hub, so that moving between them never changes the height of
// what sits under the header. Not sticky, so the scroll padding for the anchors stays as it is.
const { t } = useI18n()
const { trail, sections } = useProductNav()

const sectionLink = 'text-xs font-medium text-ink no-underline hover:text-blue aria-[current=page]:text-blue-deep'

// The same trail the reader sees, handed to the crawler. One crumb is the hub itself, which
// is not a trail, so nothing is claimed there.
useSchemaOrg(
  computed(() =>
    trail.value.length > 1
      ? [
          defineBreadcrumb({
            itemListElement: trail.value.map((crumb) => ({ name: crumb.label, item: crumb.to })),
          }),
        ]
      : [],
  ),
)
</script>

<template>
  <div class="no-print border-b border-rule bg-surface">
    <!-- A fixed height that cannot wrap, at any width: a country page carries section links
         that the hub does not, and without this the row grew and pushed the whole page down by
         ten pixels on the way in. Cramped strips scroll sideways instead of growing. -->
    <div
      class="wrap flex h-11 items-center justify-between gap-x-8 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <nav :aria-label="t('nav.here')">
        <ol class="flex items-center gap-x-2 text-2xs text-ink-soft">
          <li v-for="(crumb, i) in trail" :key="crumb.label" class="flex items-center gap-2">
            <NuxtLink v-if="crumb.to" :to="crumb.to" class="text-ink-soft no-underline hover:text-blue">
              {{ crumb.label }}
            </NuxtLink>
            <span v-else aria-current="page" class="font-semibold text-ink">{{ crumb.label }}</span>
            <span v-if="i < trail.length - 1" aria-hidden="true">&rsaquo;</span>
          </li>
        </ol>
      </nav>

      <nav v-if="sections.length" :aria-label="t('nav.menu')" class="flex items-center gap-x-6">
        <template v-for="s in sections" :key="s.key">
          <NuxtLink v-if="s.to" :to="s.to" :class="sectionLink">{{ s.label }}</NuxtLink>
          <NuxtLink v-else :to="s.anchor" custom>
            <template #default="{ href, navigate }">
              <a :href="href ?? undefined" :class="sectionLink" @click="navigate">{{ s.label }}</a>
            </template>
          </NuxtLink>
        </template>
      </nav>
    </div>
  </div>
</template>
