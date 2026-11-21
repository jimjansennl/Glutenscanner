import { DISH_PARTS } from '../data/dishParts'
import { DECLARATION_WORD, glutenGrainsIn, nearGlutenWords } from './glutenParser'
import { isKnownWord } from './knownWords'

export interface DishPick {
  id: string
  /** Lijkt op dit andere onderdeel (bijv. orzo ↔ rijst). */
  alt?: string
}

export interface DishAnswer {
  food: boolean
  several: boolean
  dish: string
  parts: DishPick[]
}

export type DishError = 'offline' | 'limiet' | 'mislukt'

/** Maakt de foto klein (max 1024 px) en geeft hem als base64-JPEG, zonder "data:"-stukje. */
export async function shrink(image: Blob, max = 1024, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(image)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}

/** Laat de AI de foto bekijken. Gooit een DishError bij geen internet, te druk of een fout. */
export async function askDish(base64: string, signal?: AbortSignal): Promise<DishAnswer> {
  if (!navigator.onLine) throw 'offline' satisfies DishError
  let res: Response
  try {
    res = await fetch('/api/gerecht', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
      signal,
    })
  } catch (e) {
    if (signal?.aborted) throw e
    throw (navigator.onLine ? 'mislukt' : 'offline') satisfies DishError
  }
  if (res.status === 429) throw 'limiet' satisfies DishError
  if (!res.ok) throw 'mislukt' satisfies DishError
  const data = (await res.json()) as DishAnswer
  return { ...data, parts: (data.parts ?? []).filter((p) => p.id in DISH_PARTS) }
}

/** Foto zonder internet: bewaren en bekijken zodra er weer internet is. */
const WAIT_KEY = 'glutenscanner.gerecht.wacht'

export interface WaitingDish {
  at: number
  image: string
}

export function saveWaiting(image: string) {
  try {
    localStorage.setItem(WAIT_KEY, JSON.stringify({ at: Date.now(), image } satisfies WaitingDish))
  } catch {
    // Telefoon vol: dan bekijken we hem later gewoon niet.
  }
}

export function loadWaiting(): WaitingDish | null {
  try {
    const raw = localStorage.getItem(WAIT_KEY)
    const w = raw ? (JSON.parse(raw) as WaitingDish) : null
    // Na een dag is het eten allang op.
    return w && Date.now() - w.at < 24 * 3600_000 ? w : null
  } catch {
    return null
  }
}

export function clearWaiting() {
  try {
    localStorage.removeItem(WAIT_KEY)
  } catch {
    // niets
  }
}

/**
 * Is dit een bord eten in plaats van een etiket of menukaart? Alleen als er (bijna) geen echte
 * woorden op staan. Wat de camera in de structuur van eten "leest" zijn geen bestaande woorden.
 * Staat er "Ingrediënten" of een glutenwoord, of lijkt het op een menukaart, dan nooit: de
 * tekstuitslag is dan veiliger.
 */
export function looksLikeDish(text: string, confidence: number): boolean {
  if (DECLARATION_WORD.test(text) || glutenGrainsIn(text).length > 0 || nearGlutenWords(text).length > 0) return false
  const words = text.match(/\p{L}{3,}/gu) ?? []
  if (words.length < 4) return true
  const known = words.filter((w) => w.length >= 4 && isKnownWord(w))
  if (known.length >= 4) return false
  // Slecht leesbaar en geen ingrediënten: eerst de AI laten kijken. Ziet die geen eten, dan lezen we de tekst alsnog.
  return known.length / words.length < 0.15 || confidence < 45
}
