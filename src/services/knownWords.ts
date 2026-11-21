import { FOOD_ROOTS } from '../data/foodWords'
import { DUTCH_WORDS, WORDS } from '../data/ingredientWords'
import { fold } from '../lib/fold'

/**
 * Kent de app elk woord van een ingrediëntenlijst? Een onbekend woord op een foto kan een
 * leesfout van de camera zijn ("tarvebloem"), en dan mag de uitslag niet groen zijn.
 */

const known = new Set<string>()
const add = (text: string) => {
  for (const w of fold(text).split(/[^a-z]+/)) if (w.length >= 2) known.add(w)
}
FOOD_ROOTS.forEach(add)
DUTCH_WORDS.forEach(add)
for (const lang of Object.values(WORDS)) for (const [k, v] of Object.entries(lang)) add(`${k} ${v}`)

/** Tussenletters in samenstellingen: rijst-e-bloem, kip-pen-vel, smaak-s-versterker. */
const LINKS = ['', 's', 'e', 'en', 'n']
const memo = new Map<string, boolean>()

/** Bestaat het woord, of is het aan elkaar gezet uit bekende woorden? */
function splits(w: string): boolean {
  if (known.has(w)) return true
  // Meervoud en verkleinwoord: aardbei-en, stokje-s, kruid-en.
  for (const end of ['en', 's', 'e', 'n', 'tje', 'tjes', 'je', 'jes', "'s"])
    if (w.length - end.length >= 3 && w.endsWith(end) && known.has(w.slice(0, -end.length))) return true
  const hit = memo.get(w)
  if (hit !== undefined) return hit
  let ok = false
  for (let i = 3; i <= w.length - 3 && !ok; i++) {
    if (!known.has(w.slice(0, i))) continue
    for (const l of LINKS) {
      const rest = w.slice(i)
      if (rest.startsWith(l) && rest.length - l.length >= 3 && splits(rest.slice(l.length))) {
        ok = true
        break
      }
    }
  }
  memo.set(w, ok)
  return ok
}

export function isKnownWord(raw: string): boolean {
  const w = fold(raw).replace(/[^a-z0-9]/g, '')
  if (w.length <= 2) return true // korte stukjes (ui, ei, en) en losse letters
  if (/^e?\d+[a-z]?$/.test(w)) return true // E-nummers, getallen
  if (/^\d/.test(w)) return true // "35%", "1,8"
  return splits(w)
}

/** De woorden uit de lijst die de app niet kent (zonder dubbelen). */
export function unknownWords(texts: string[]): string[] {
  const out = new Set<string>()
  for (const t of texts) for (const w of t.split(/[^\p{L}\d]+/u)) if (w && !isKnownWord(w)) out.add(w)
  return [...out]
}
