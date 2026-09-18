import type { RouterConfig } from '@nuxt/schema'

// The stylesheet asks for smooth scrolling so that an anchor glides to its heading. Without
// this file every page change inherits it as well: `scrollTo` with the default `auto` takes
// its behaviour from the CSS, so the browser animates its way back to the top and the whole
// page appears to slide on every navigation.
//
// Matches `scroll-padding-top` in main.css, which only applies to scrolling the browser does
// itself; the router computes its own offset.
const HEADER = 88

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return { ...savedPosition, behavior: 'instant' }
    if (to.hash) return { el: to.hash, top: HEADER, behavior: 'smooth' }
    if (to.path === from.path) return
    return { left: 0, top: 0, behavior: 'instant' }
  },
}
