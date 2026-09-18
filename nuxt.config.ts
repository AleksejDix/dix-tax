// Vercel builds preview deployments in production mode, so the robots module would call
// them indexable. It honours this variable (setting `site.indexable` below had no effect),
// so derive it from Vercel's environment: only the production deployment may be indexed.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
  process.env.NUXT_SITE_INDEXABLE = 'false'
}

import tailwindcss from '@tailwindcss/vite'

// One file per product keeps translations manageable as forms are added.
const localeFiles = (code: string) =>
  ['common', 'legal', 'ch-zurich', 'modelo-210', 'anlage-v'].map((name) => `${code}/${name}.json`)

// Paths retired when the site moved from form names to the country the property stands in
// (docs/adr/0001-site-navigation.md). Old links, bookmarks and search results keep working,
// in every language. A two letter code is never a path segment: `de`, `es`, `uk` and `ru`
// are locale prefixes, and `fr` and `it` follow when those languages are added.
const MOVED: Record<string, string> = {
  '/ch/zurich': '/switzerland',
  '/ch/zurich/guide': '/switzerland/guide',
  '/ch/zurich/calculator': '/switzerland/calculator',
  '/modelo-210': '/spain',
  '/anlage-v': '/germany',
}

const LOCALE_PREFIXES = ['', '/de', '/uk', '/ru', '/es']

const movedRules = Object.fromEntries(
  LOCALE_PREFIXES.flatMap((prefix) =>
    Object.entries(MOVED).map(([from, to]) => [
      `${prefix}${from}`,
      { redirect: { to: `${prefix}${to}`, statusCode: 301 } },
    ]),
  ),
)

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },

  // @nuxtjs/seo brings robots, sitemap, schema.org, link checking and seo-utils in one
  // module, so those are no longer listed separately.
  modules: ['@nuxtjs/i18n', '@nuxt/fonts', 'nuxt-security', '@nuxtjs/seo'],

  css: ['~/assets/css/main.css'],

  // Read by every part of the SEO suite.
  site: {
    url: 'https://dix.tax',
    name: 'dix.tax',
    description: 'Tax forms for people who own property in a country they do not live in.',
    defaultLocale: 'en',
  },

  // The social images are drawn by `scripts/og-images.mjs` and committed, so the build and
  // the request path stay untouched and nothing new has to be allowed in the content
  // security policy. Generating them at request time would undo both.
  ogImage: { enabled: false },

  // The person behind the site, once, for the structured data on every page.
  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'dix.tax',
      url: 'https://dix.tax',
    },
  },

  // Security headers, a content security policy and limits for the one server route.
  // The defaults are strict; only what this site needs is opened up.
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        // PostHog's EU endpoint is the only third party the browser may talk to. Its library is
        // bundled with the site, so no third-party script has to be allowed.
        'connect-src': ["'self'", 'https://eu.i.posthog.com'],
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
      // Analytics stays off until a PostHog project key exists (NUXT_PUBLIC_POSTHOG_KEY).
      // The key is public by design: it can only send events, not read them.
      posthogKey: process.env.NUXT_PUBLIC_POSTHOG_KEY || '',
      posthogHost: process.env.NUXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
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

  routeRules: {
    ...movedRules,
    // The legal page used to live at /legal; keep old links and bookmarks working.
    '/legal': { redirect: { to: '/legal-notice', statusCode: 301 } },
    '/de/legal': { redirect: { to: '/de/impressum', statusCode: 301 } },
    '/es/legal': { redirect: { to: '/es/aviso-legal', statusCode: 301 } },
    '/uk/legal': { redirect: { to: '/uk/legal-notice', statusCode: 301 } },
    '/ru/legal': { redirect: { to: '/ru/legal-notice', statusCode: 301 } },
    // A person signs up once. Five tries a minute stops scripts without blocking anyone real.
    '/api/interest': { security: { rateLimiter: { tokensPerInterval: 5, interval: 60_000 } } },
  },

  // Tailwind v4 is a Vite plugin; the theme lives in app/assets/css/main.css.
  vite: {
    plugins: [tailwindcss()],
  },

  // Pages are prerendered; only the signup route under /api runs on the server.
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/de', '/uk', '/ru', '/es'] },
  },
})
