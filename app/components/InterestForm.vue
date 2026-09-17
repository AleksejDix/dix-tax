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
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <div v-if="!enabled" class="form">
    <label v-if="choose" class="field">
      <span>{{ t('interest.which') }}</span>
      <select v-model="chosen">
        <option v-for="o in options" :key="o" :value="o">{{ t(`interest.options.${o}`) }}</option>
      </select>
    </label>

    <label class="field">
      <span>{{ t('interest.note') }}</span>
      <textarea v-model="note" rows="3" maxlength="1000" :placeholder="t('interest.notePlaceholder')" />
    </label>

    <a class="btn btn-primary" :href="mailto">{{ t('interest.mail.submit') }}</a>
    <p class="consent">{{ t('interest.mail.hint') }}</p>
  </div>

  <p v-else-if="state === 'done'" class="done" role="status">{{ t('interest.done') }}</p>

  <form v-else class="form" @submit.prevent="submit">
    <label v-if="choose" class="field">
      <span>{{ t('interest.which') }}</span>
      <select v-model="chosen">
        <option v-for="o in options" :key="o" :value="o">{{ t(`interest.options.${o}`) }}</option>
      </select>
    </label>

    <label class="field">
      <span>{{ t('interest.email') }}</span>
      <input v-model="email" type="email" required autocomplete="email" inputmode="email" placeholder="name@example.com" />
    </label>

    <label class="field">
      <span>{{ t('interest.note') }}</span>
      <textarea v-model="note" rows="3" maxlength="1000" :placeholder="t('interest.notePlaceholder')" />
    </label>

    <!-- Honeypot, hidden from people and assistive technology -->
    <div class="trap" aria-hidden="true">
      <label :for="`${id}-w`">Website</label>
      <input :id="`${id}-w`" v-model="website" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <button type="submit" class="btn btn-primary" :disabled="state === 'sending'">
      {{ state === 'sending' ? t('interest.sending') : t('interest.submit') }}
    </button>
    <p v-if="state === 'error'" class="error" role="alert">
      {{ t('interest.error') }} <a :href="`mailto:${address}`">{{ address }}</a>
    </p>
    <p class="consent">{{ t('interest.consent') }}</p>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field > span {
  font-size: var(--step--1);
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  min-height: 2.9rem;
  padding: 0.6rem 0.75rem;
  background: var(--field);
  border: 0;
  border-bottom: 2px solid var(--field-strong);
  border-radius: 4px 4px 0 0;
  font: inherit;
  color: inherit;
}

textarea {
  resize: vertical;
  line-height: 1.45;
}

input::placeholder,
textarea::placeholder {
  color: color-mix(in srgb, var(--ink-soft) 65%, transparent);
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 0;
  border-bottom-color: var(--blue-deep);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 30%, transparent);
  background: var(--surface);
}

.trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.btn {
  justify-self: start;
}

.btn:disabled {
  opacity: 0.6;
  cursor: progress;
}

.consent {
  font-size: 0.8125rem;
  line-height: 1.45;
  color: var(--ink-soft);
}

.error {
  font-size: var(--step--1);
  font-weight: 500;
  color: var(--warn);
}

.done {
  padding: 1rem 1.1rem;
  border-left: 3px solid var(--ok);
  background: color-mix(in srgb, var(--ok) 8%, white);
  border-radius: 0 var(--radius) var(--radius) 0;
  font-weight: 500;
}
</style>
