<script setup lang="ts">
// "Tell me when it is ready" signup. The form posts to our own server route, which
// emails the signup to the owner's inbox. With `choose`, the visitor also says which
// form they need, which is the question the hub page exists to answer.
const props = defineProps<{ product?: string; choose?: boolean }>()

const { t, locale } = useI18n()
const id = useId()
const address = useAppConfig().contactEmail
// False until the server has a mail login (see runtimeConfig in nuxt.config.ts).
const enabled = useRuntimeConfig().public.signupEnabled
const { track } = useAnalytics()

const options = ['modelo210', 'anlageV', 'chOther', 'other'] as const
const email = ref('')
const note = ref('')
const website = ref('')
const chosen = ref<string>(props.product ?? 'modelo210')
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')

// Fallback while the form is off: the same answers, sent from the visitor's own mail app.
const mailto = computed(() => {
  const form = t(`interest.options.${chosen.value}`)
  const body = [t('interest.mail.greeting'), '', note.value.trim(), '', `[${chosen.value} / ${locale.value}]`]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
  return `mailto:${address}?subject=${encodeURIComponent(`Dix.Tax: ${form}`)}&body=${encodeURIComponent(body)}`
})

async function submit() {
  state.value = 'sending'
  try {
    await $fetch('/api/interest', {
      method: 'POST',
      body: { email: email.value, note: note.value, product: chosen.value, locale: locale.value, website: website.value },
    })
    state.value = 'done'
    track('signup_sent', { product: chosen.value, via: 'form' })
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div v-if="!enabled" class="grid w-full gap-4">
    <UiField v-if="choose" :label="t('interest.which')">
      <select v-model="chosen" class="ui-control">
        <option v-for="o in options" :key="o" :value="o">{{ t(`interest.options.${o}`) }}</option>
      </select>
    </UiField>

    <UiField :label="t('interest.note')">
      <textarea
        v-model="note"
        rows="3"
        maxlength="1000"
        class="ui-control"
        :placeholder="t('interest.notePlaceholder')"
      />
    </UiField>

    <UiButton
      variant="primary"
      :href="mailto"
      class="justify-self-start"
      @click="track('signup_sent', { product: chosen, via: 'mail' })"
    >
      {{ t('interest.mail.submit') }}
    </UiButton>
    <p class="text-2xs leading-snug text-ink-soft">{{ t('interest.mail.hint') }}</p>
  </div>

  <p
    v-else-if="state === 'done'"
    class="rounded-r-md border-l-[3px] border-ok bg-ok-tint px-4.5 py-4 font-medium"
    role="status"
  >
    {{ t('interest.done') }}
  </p>

  <form v-else class="grid w-full gap-4" @submit.prevent="submit">
    <UiField v-if="choose" :label="t('interest.which')">
      <select v-model="chosen" class="ui-control">
        <option v-for="o in options" :key="o" :value="o">{{ t(`interest.options.${o}`) }}</option>
      </select>
    </UiField>

    <UiField :label="t('interest.email')">
      <input
        v-model="email"
        type="email"
        required
        autocomplete="email"
        inputmode="email"
        class="ui-control"
        placeholder="name@example.com"
      />
    </UiField>

    <UiField :label="t('interest.note')">
      <textarea
        v-model="note"
        rows="3"
        maxlength="1000"
        class="ui-control"
        :placeholder="t('interest.notePlaceholder')"
      />
    </UiField>

    <!-- Honeypot, hidden from people and assistive technology -->
    <div class="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label :for="`${id}-w`">Website</label>
      <input :id="`${id}-w`" v-model="website" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <UiButton type="submit" variant="primary" :disabled="state === 'sending'" class="justify-self-start">
      {{ state === 'sending' ? t('interest.sending') : t('interest.submit') }}
    </UiButton>
    <p v-if="state === 'error'" class="text-xs font-medium text-warn" role="alert">
      {{ t('interest.error') }} <a :href="`mailto:${address}`">{{ address }}</a>
    </p>
    <p class="text-2xs leading-snug text-ink-soft">{{ t('interest.consent') }}</p>
  </form>
</template>
