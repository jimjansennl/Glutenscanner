import { DUTCH_WORDS, LANG_NAME, WORDS, type WordLang } from '../data/ingredientWords'
import { fold } from '../lib/fold'

/** Eén stukje van de vertaalde tekst. */
export interface Piece {
  /** Wat we laten zien. */
  text: string
  /** 'nl' = vertaald, 'raw' = woord dat we niet kenden, 'sep' = leesteken of spatie. */
  kind: 'nl' | 'raw' | 'sep'
  /** De originele woorden (gelijkgemaakt), om gluten te kunnen markeren. */
  source: string[]
}

export interface Translation {
  lang: WordLang
  langName: string
  pieces: Piece[]
  /** Deel van de woorden dat we kenden (0–1). */
  known: number
}

/** Langste woordcombinatie in de lijsten. */
const MAX_PHRASE = 6

interface Dict {
  map: Map<string, string>
  words: Set<string>
}

/** Woorden die in elke taal hetzelfde zijn. */
const SHARED: Record<string, string> = { gluten: 'gluten', lactose: 'lactose', dextrose: 'dextrose', maltodextrine: 'maltodextrine', maltodextrin: 'maltodextrine' }

const DICTS = new Map<WordLang, Dict>()
function dict(lang: WordLang): Dict {
  let d = DICTS.get(lang)
  if (!d) {
    const map = new Map<string, string>()
    const words = new Set<string>()
    for (const [k, v] of Object.entries({ ...SHARED, ...WORDS[lang] })) {
      const key = fold(k).replace(/['’]/g, ' ').replace(/\s+/g, ' ').trim()
      map.set(key, v)
      for (const w of key.split(' ')) if (w.length >= 4) words.add(w)
    }
    d = { map, words }
    DICTS.set(lang, d)
  }
  return d
}
const DUTCH = new Set(DUTCH_WORDS.map(fold))

type Token = { text: string; word: boolean }
function tokenize(text: string): Token[] {
  return [...text.matchAll(/(\p{L}+)|([^\p{L}]+)/gu)].map((m) => ({ text: m[0], word: !!m[1] }))
}

/** Raadt de taal van een ingrediëntenlijst. Geeft null als hij Nederlands is of onbekend. */
export function guessLang(text: string): WordLang | null {
  const words = tokenize(text)
    .filter((t) => t.word)
    .map((t) => fold(t.text))
    .filter((w) => w.length >= 4)
  if (words.length === 0) return null
  const dutch = words.filter((w) => DUTCH.has(w)).length
  let best: WordLang | null = null
  let bestScore = 0
  for (const lang of Object.keys(WORDS) as WordLang[]) {
    const { words: known } = dict(lang)
    const score = words.filter((w) => known.has(w) && !DUTCH.has(w)).length
    if (score > bestScore) {
      best = lang
      bestScore = score
    }
  }
  if (!best || bestScore < 2 || bestScore <= dutch) return null
  return best
}

/** Vertaalt een ingrediëntenlijst woord voor woord naar het Nederlands, met vaste combinaties eerst. */
export function translateIngredients(text: string): Translation | null {
  const lang = guessLang(text)
  if (!lang) return null
  const { map } = dict(lang)
  const tokens = tokenize(text)
  const pieces: Piece[] = []
  let words = 0
  let known = 0

  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (!t.word) {
      let sep = t.text.replace(/_/g, '')
      // Na een vertaald woord wordt een Franse apostrof ("d'œuf") een spatie.
      const prev = pieces[pieces.length - 1]
      if (prev?.kind === 'nl') sep = sep.replace(/^['’]/, prev.text ? ' ' : '')
      pieces.push({ text: sep, kind: 'sep', source: [] })
      i++
      continue
    }
    // Langste combinatie: woorden met alleen spaties of apostrofs ertussen.
    let match: { end: number; nl: string; source: string[] } | null = null
    const source: string[] = []
    let j = i
    let key = ''
    while (j < tokens.length && source.length < MAX_PHRASE) {
      const w = tokens[j]
      if (!w.word) break
      source.push(fold(w.text))
      key = source.join(' ')
      const nl = map.get(key)
      if (nl !== undefined) match = { end: j + 1, nl, source: [...source] }
      const sep = tokens[j + 1]
      if (!sep || sep.word || !/^[\s'’_]+$/.test(sep.text)) break
      j += 2
    }
    if (match) {
      const n = match.source.length
      words += n
      known += n
      pieces.push({ text: match.nl, kind: 'nl', source: match.source })
      i = match.end
    } else {
      words++
      pieces.push({ text: t.text, kind: 'raw', source: [fold(t.text)] })
      i++
    }
  }
  return { lang, langName: LANG_NAME[lang], pieces, known: words ? known / words : 0 }
}
