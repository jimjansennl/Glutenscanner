/**
 * De camera werkt alleen op een beveiligde verbinding (https), en niet als de site in een
 * frame van een onbeveiligde pagina zit. Dat gebeurt bij "doorsturen met maskering" van
 * een domeinnaam. Dan sturen we door naar het beveiligde adres.
 */
export const SECURE_URL = 'https://www.glutenscanner.nl'

const LOCAL = ['localhost', '127.0.0.1', '[::1]']

function pathPart() {
  return window.location.pathname + window.location.search + window.location.hash
}

/** Geeft true als we de pagina verlaten; dan hoeft de app niet te starten. */
export function ensureSecureContext(): boolean {
  if (window.isSecureContext || LOCAL.includes(window.location.hostname)) return false
  const target = window.location.protocol === 'https:' ? window.location.href : SECURE_URL + pathPart()
  if (window.top !== window.self) {
    // In een frame van een onbeveiligde pagina. Browsers blokkeren doorsturen hier vaak zonder
    // tik; we proberen het, maar starten de app toch, zodat de knop "Open de scanner" verschijnt.
    try {
      window.top?.location.replace(target)
    } catch {
      // Geblokkeerd: de knop in de scanner lost het op met één tik.
    }
    return false
  }
  window.location.replace(target)
  return true
}
