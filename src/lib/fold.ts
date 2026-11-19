/**
 * Accenten en hoofdletters gelijkmaken ("BLÉ" → "ble"), zodat zoeken in elke taal werkt,
 * en weer terug naar het echte woord om te laten zien.
 */
const MARKS = /[̀-ͯ]/g

export function fold(s: string): string {
  return s.normalize('NFD').replace(MARKS, '').toLowerCase()
}

/** Woordenboek gelijkgemaakt woord → woord zoals het er echt staat (kleine letters). */
export function originalWords(texts: (string | undefined)[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const t of texts) {
    if (!t) continue
    for (const w of t.match(/[\p{L}-]+/gu) ?? []) {
      const key = fold(w)
      if (!map.has(key)) map.set(key, w.toLowerCase())
    }
  }
  return map
}

/**
 * Vindt woorden in een tekst, ongeacht accenten en hoofdletters.
 * Geeft stukken [begin, eind) in de originele tekst terug, met het gevonden zoekwoord.
 */
export function findSpans(text: string, terms: string[]): { start: number; end: number; term: string }[] {
  if (terms.length === 0) return []
  // Gelijkgemaakte tekst met per teken de plek in het origineel.
  let flat = ''
  const at: number[] = []
  for (let i = 0; i < text.length; i++) {
    const f = fold(text[i])
    for (let k = 0; k < f.length; k++) at.push(i)
    flat += f
  }
  at.push(text.length)
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const sorted = [...new Set(terms.map(fold))].sort((a, b) => b.length - a.length)
  const re = new RegExp(`(?<!\\p{L})(${sorted.map(esc).join('|')})(?!\\p{L})`, 'gu')
  const spans: { start: number; end: number; term: string }[] = []
  for (const m of flat.matchAll(re)) {
    const start = at[m.index]
    const end = at[m.index + m[0].length - 1] + 1
    spans.push({ start, end, term: m[0] })
  }
  return spans
}
