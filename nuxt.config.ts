// One file per product keeps translations manageable as forms are added.
const localeFiles = (code: string) =>
  ['common', 'legal', 'ch-zurich', 'modelo-210', 'anlage-v'].map((name) => `${code}/${name}.json`)

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts', 'nuxt-security', '@nuxtjs/robots', '@nuxtjs/sitemap'],

  css: ['~/assets/css/main.css'],

  // Used by the sitemap and robots modules. Preview deployments are not the production
  // site, so they are kept out of search engines automatically.
  site: {
    url: 'https://dix.tax',
    name: 'Dix.Tax',
  },

  // Security headers, a content security policy and limits for the one server route.
  // The defaults are strict; only what this site needs is opened up.
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'none'"],
        'upgrade-insecure-requests': true,
      },
      // Nothing embeds this site and it embeds nothing.
      xFrameOptions: 'DENY',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        'display-capture': [],
      },
    },
    // Nuxt 4 compiles with oxc, which ignores this esbuild-based option and warns about it.
    removeLoggers: false,
    // The only thing visitors can post is the signup form: keep bodies small.
    requestSizeLimiter: { maxRequestSizeInBytes: 20_000, maxUploadFileRequestInBytes: 20_000 },
  },


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
    // A person signs up once. Five tries a minute stops scripts without blocking anyone real.
    '/api/interest': { security: { rateLimiter: { tokensPerInterval: 5, interval: 60_000 } } },
  },

  // Pages are prerendered; only the signup route under /api runs on the server.
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/de', '/uk', '/ru', '/es'] },
  },
})
