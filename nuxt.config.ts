// One file per product keeps translations manageable as forms are added.
const localeFiles = (code: string) =>
  ['common', 'legal', 'ch-zurich', 'modelo-210', 'anlage-v'].map((name) => `${code}/${name}.json`)

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // The signup form only appears when the server can actually deliver it. Decided at
      // build time: add SMTP_USER and SMTP_PASS on Vercel, redeploy, and the form turns on.
      // Without them visitors get a plain "write to us" link instead of a form that fails.
      signupEnabled: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    },
  },

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
    // Readers look for the familiar words in the address too ("Impressum", "Aviso legal").
    customRoutes: 'config',
    pages: {
      'legal-notice': { de: '/impressum', es: '/aviso-legal' },
      privacy: { de: '/datenschutz', es: '/privacidad' },
    },
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

  // The legal page used to live at /legal; keep old links and bookmarks working.
  routeRules: {
    '/legal': { redirect: { to: '/legal-notice', statusCode: 301 } },
    '/de/legal': { redirect: { to: '/de/impressum', statusCode: 301 } },
    '/es/legal': { redirect: { to: '/es/aviso-legal', statusCode: 301 } },
    '/uk/legal': { redirect: { to: '/uk/legal-notice', statusCode: 301 } },
    '/ru/legal': { redirect: { to: '/ru/legal-notice', statusCode: 301 } },
  },

  // Pages are prerendered; only the signup route under /api runs on the server.
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/de', '/uk', '/ru', '/es'] },
  },
})
