/**
 * Wisselen tussen scanner en website.
 * - Desktop met muis: de website, behalve met "#app" in het adres.
 * - Telefoon en tablet: "/" is de scanner. Het logo opent de website (zelfde adres "/",
 *   met een vlaggetje in de geschiedenis), zodat de terugknop weer bij de scanner uitkomt.
 *   Andere adressen (/glutengids, /vragen, ...) zijn altijd de website.
 */
export const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

export function isDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function siteFlag(): boolean {
  return (window.history.state as { site?: boolean } | null)?.site === true
}

export function showWebsite(): boolean {
  if (isDesktop()) return window.location.hash !== '#app'
  return window.location.pathname !== '/' || siteFlag()
}

function navigate(state: unknown, href: string) {
  window.history.pushState(state, '', href)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}

/** Opent de website (vanuit de scanner, via het logo). */
export function openWebsite(path = '/') {
  navigate({ site: true }, path)
}

/** Opent de scanner (vanuit de website op de telefoon). */
export function openScanner() {
  if (isDesktop()) navigate(null, '/#app')
  else navigate(null, '/')
}
