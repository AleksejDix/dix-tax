// One file per product keeps translations manageable as forms are added.
const localeFiles = (code: string) =>
  ['common', 'ch-zurich', 'modelo-210', 'anlage-v'].map((name) => `${code}/${name}.json`)

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#173f8a' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },

  i18n: {
    baseUrl: 'https://dix.tax',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en', name: 'English', files: localeFiles('en') },
      { code: 'de', language: 'de-CH', name: 'Deutsch', files: localeFiles('de') },
      { code: 'uk', language: 'uk-UA', name: 'Українська', files: localeFiles('uk') },
      { code: 'ru', language: 'ru', name: 'Русский', files: localeFiles('ru') },
      { code: 'es', language: 'es', name: 'Español', files: localeFiles('es') },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },

  // Only the handwritten notes use a webfont; all other text is the system font.
  fonts: {
    defaults: {
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    },
    families: [
      { name: 'Caveat', provider: 'google', weights: [500, 600] },
    ],
  },

  // Everything is computed in the browser, so the whole site can be prerendered.
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/de', '/uk', '/ru', '/es'] },
  },
})
