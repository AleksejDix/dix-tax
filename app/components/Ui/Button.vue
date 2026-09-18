<script setup lang="ts">
// The one button in the product. It renders a link when it goes somewhere and a button
// when it does something, so nothing has to fake the other with a click handler.
//
// `primary` is the step forward and there is at most one of it on a screen. `quiet` is
// everything else. `light` is the same shape on a dark band.
const props = withDefaults(
  defineProps<{
    to?: string | { path: string; hash?: string }
    href?: string
    type?: 'button' | 'submit'
    variant?: 'primary' | 'quiet' | 'light' | 'marker'
    size?: 'md' | 'sm'
    disabled?: boolean
    block?: boolean
  }>(),
  { to: undefined, href: undefined, type: 'button', variant: 'quiet', size: 'md', disabled: false, block: false },
)

const VARIANTS = {
  primary: 'border-blue-deep bg-blue-deep text-white hover:border-ink hover:bg-ink hover:text-white',
  quiet: 'border-rule bg-transparent text-ink hover:border-blue hover:text-blue-deep',
  light: 'border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white',
  // The step forward on a dark band: the highlighter yellow, with ink on it.
  marker: 'border-marker bg-marker text-ink hover:border-white hover:bg-white hover:text-ink',
} as const

const SIZES = {
  md: 'min-h-13 px-6 py-3 text-base',
  sm: 'min-h-10 px-3.5 py-1.5 text-xs',
} as const

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-sm border-[1.5px] font-semibold leading-tight',
  'no-underline transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
  VARIANTS[props.variant],
  SIZES[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
  </NuxtLink>
  <a v-else-if="href" :href="href" :class="classes">
    <slot />
  </a>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
