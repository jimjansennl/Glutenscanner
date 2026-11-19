/**
 * Uitslag voelen: groen = 1 tikje, oranje = 2, rood = 3.
 * Android: gewoon trillen. iPhone (Safari kent geen trillen): sinds iOS 18 geeft een
 * schakelaartje (<input type="checkbox" switch>) een tikje als je het omzet. Dat doen we
 * onzichtbaar. Werkt dat niet (oudere iOS), dan gebeurt er gewoon niets.
 */
export type Feel = 'safe' | 'warning' | 'danger'

const TAPS: Record<Feel, number> = { safe: 1, warning: 2, danger: 3 }
const GAP_MS = 180

function iosTick() {
  const label = document.createElement('label')
  const input = document.createElement('input')
  input.type = 'checkbox'
  input.setAttribute('switch', '')
  label.style.position = 'fixed'
  label.style.opacity = '0'
  label.style.pointerEvents = 'none'
  label.setAttribute('aria-hidden', 'true')
  label.appendChild(input)
  document.body.appendChild(label)
  label.click()
  label.remove()
}

export function feel(kind: Feel) {
  const taps = TAPS[kind]
  if (typeof navigator.vibrate === 'function') {
    // [aan, pauze, aan, ...]: rood iets langer zodat je het verschil voelt.
    const on = kind === 'danger' ? 120 : 50
    const pattern: number[] = []
    for (let i = 0; i < taps; i++) pattern.push(on, i < taps - 1 ? 90 : 0)
    if (navigator.vibrate(pattern.slice(0, -1))) return
  }
  for (let i = 0; i < taps; i++) setTimeout(iosTick, i * GAP_MS)
}
