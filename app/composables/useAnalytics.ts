// The only door through which usage events leave the page. Keep the list short and the
// properties coarse: a country code or a form name is fine, anything a person typed is not.
type Events = {
  calculator_started: Record<string, never>
  property_completed: { country: string; kind: string; usage: string; currency: string; properties: number }
  sheet_printed: { properties: number }
  note_copied: Record<string, never>
  signup_sent: { product: string; via: 'form' | 'mail' }
}

export function useAnalytics() {
  const { $analytics } = useNuxtApp()
  const { locale } = useI18n()

  function track<E extends keyof Events>(event: E, properties?: Events[E]) {
    $analytics?.capture(event, { ...properties, locale: locale.value })
  }

  return { track }
}
