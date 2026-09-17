// Anonymous usage counts with PostHog, and nothing at all until a project key exists.
//
// What this deliberately does NOT do: no cookies and nothing stored on the device
// (persistence is memory only), no session recording, no automatic capture of clicks or
// form fields, no person profiles, no remotely loaded scripts. Events are sent only through
// `useAnalytics().track`, so every property that leaves the page is visible in the code.
// Amounts, addresses and free text are never passed to it.
import type { PostHog } from 'posthog-js'

export default defineNuxtPlugin(async () => {
  const { posthogKey, posthogHost } = useRuntimeConfig().public
  let client: PostHog | undefined

  const dnt = navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1'

  if (posthogKey && !dnt) {
    // Imported only when analytics is on, so the library is not even downloaded otherwise.
    const { default: posthog } = await import('posthog-js')
    posthog.init(posthogKey, {
      api_host: posthogHost,
      ui_host: 'https://eu.posthog.com',
      persistence: 'memory',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      disable_session_recording: true,
      disable_surveys: true,
      advanced_disable_flags: true,
      disable_external_dependency_loading: true,
      respect_dnt: true,
    })
    client = posthog
  }

  return { provide: { analytics: client } }
})
