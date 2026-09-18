<script setup lang="ts">
// "Write to me before the next deadline."
//
// This is the one thing a visitor gets in return for an address, and the only reason most of
// them would hand one over: these forms come round once a year and are easy to forget. It
// asks for nothing but the address, and it appears where the value has just been delivered,
// under the finished sheet.
//
// Nothing sends the reminder automatically. The request lands in the owner's inbox with the
// date on it and a person writes the message, which is why the promise here is deliberately
// small: one message, before that date, and then nothing.
const props = defineProps<{ product: Product['key'] }>()

const { t, locale, localeProperties } = useI18n()
const { track } = useAnalytics()
const id = useId()
const today = useToday()

// The form only appears when the server can actually deliver it, on the same reasoning as the
// signup form: better no promise than one that fails quietly.
const enabled = useRuntimeConfig().public.signupEnabled

const next = computed(() => nextDeadline(props.product, today.value))
const date = computed(() =>
  next.value ? formatDeadlineDate(next.value.date, localeProperties.value.language) : '',
)
const iso = computed(() => (next.value ? next.value.date.toISOString().slice(0, 10) : ''))

const email = ref('')
const website = ref('')
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')

async function submit() {
  state.value = 'sending'
  try {
    await $fetch('/api/interest', {
      method: 'POST',
      body: {
        kind: 'reminder',
        product: props.product,
        deadline: iso.value,
        email: email.value,
        locale: locale.value,
        website: website.value,
      },
    })
    state.value = 'done'
    track('signup_sent', { product: props.product, via: 'form' })
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <UiCard v-if="enabled && next" tone="accent" class="grid max-w-[40rem] gap-3.5">
    <h2 class="text-lg">{{ t('reminder.title') }}</h2>

    <p v-if="state === 'done'" class="text-xs font-medium text-ok">{{ t('reminder.done') }}</p>

    <template v-else>
      <p class="text-xs text-ink-soft">{{ t('reminder.body', { date }) }}</p>
      <form class="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" @submit.prevent="submit">
        <UiField :label="t('interest.email')" :label-for="id">
          <input
            :id="id"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="ui-control"
            placeholder="name@example.com"
          />
        </UiField>
        <!-- Real visitors never see this, so anything that fills it is not a visitor. -->
        <input v-model="website" type="text" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
        <UiButton type="submit" variant="primary" :disabled="state === 'sending'">
          {{ state === 'sending' ? t('interest.sending') : t('reminder.submit') }}
        </UiButton>
      </form>
      <p class="text-2xs leading-snug text-ink-soft">{{ t('reminder.consent') }}</p>
      <p v-if="state === 'error'" class="text-2xs text-warn">{{ t('interest.error') }}</p>
    </template>
  </UiCard>
</template>
