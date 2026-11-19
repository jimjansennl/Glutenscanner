import { readJson, writeJson } from '../lib/storage'
import { fold } from '../lib/fold'
import type { GlutenStatus, RecipeChange, ScanResult } from '../types/product'

/**
 * Producten die je met een barcode scande, per barcode onthouden (alleen op dit toestel).
 * - Zo zien we het als het recept verandert: fabrikanten passen soms stilletjes iets aan.
 * - "Onze vaste producten": producten die je met een ster bewaart.
 */
const KEY = 'glutenscanner.products.v1'
const MAX = 300

export interface KnownProduct {
  barcode: string
  name: string
  ingredients: string
  status: GlutenStatus
  lastSeen: number
  starred: boolean
  /** Laatste uitslag, om hem vanuit de lijst te openen. */
  result: ScanResult
}

function load(): Record<string, KnownProduct> {
  const data = readJson<Record<string, KnownProduct>>(KEY, {})
  return data && typeof data === 'object' ? data : {}
}

function save(data: Record<string, KnownProduct>) {
  const items = Object.values(data)
  if (items.length > MAX) {
    // Te veel: de oudste zonder ster eruit.
    items
      .filter((p) => !p.starred)
      .sort((a, b) => a.lastSeen - b.lastSeen)
      .slice(0, items.length - MAX)
      .forEach((p) => delete data[p.barcode])
  }
  writeJson(KEY, data)
}

/** Ingrediënten als losse, gelijkgemaakte stukjes: "Tarwebloem (45%)" → "tarwebloem". */
function parts(text: string): string[] {
  return text
    .replace(/_/g, '')
    .split(/[,;:()[\].•]+/)
    .map((p) => fold(p).replace(/\d+([.,]\d+)?\s*%/g, '').replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 1 && !/^(ingredi\w*|zutaten|ingredients?)$/.test(p))
}

/** Vergelijkt de ingrediënten met de vorige keer en onthoudt de nieuwe uitslag. */
export function rememberProduct(result: ScanResult, status: GlutenStatus): RecipeChange | undefined {
  const product = result.product
  if (!product?.barcode || !product.ingredientsText) return undefined
  const data = load()
  const before = data[product.barcode]
  let change: RecipeChange | undefined
  if (before?.ingredients) {
    const oldParts = parts(before.ingredients)
    const newParts = parts(product.ingredientsText)
    const added = newParts.filter((p) => !oldParts.includes(p))
    const removed = oldParts.filter((p) => !newParts.includes(p))
    if (added.length || removed.length) {
      change = { since: before.lastSeen, added: added.slice(0, 8), removed: removed.slice(0, 8), statusBefore: before.status }
    }
  }
  data[product.barcode] = {
    barcode: product.barcode,
    name: product.name,
    ingredients: product.ingredientsText,
    status,
    lastSeen: Date.now(),
    starred: before?.starred ?? false,
    result: { ...result, imageUrl: undefined, recipeChange: undefined },
  }
  save(data)
  return change
}

export function isStarred(barcode: string): boolean {
  return load()[barcode]?.starred ?? false
}

/** Ster aan of uit. Een product dat we nog niet kenden, wordt ook bewaard. */
export function setStarred(result: ScanResult, status: GlutenStatus, starred: boolean) {
  const product = result.product
  if (!product?.barcode) return
  const data = load()
  const known = data[product.barcode]
  data[product.barcode] = known
    ? { ...known, starred }
    : {
        barcode: product.barcode,
        name: product.name,
        ingredients: product.ingredientsText ?? '',
        status,
        lastSeen: Date.now(),
        starred,
        result: { ...result, imageUrl: undefined, recipeChange: undefined },
      }
  save(data)
}

/** Onze vaste producten, op naam. */
export function starredProducts(): KnownProduct[] {
  return Object.values(load())
    .filter((p) => p.starred)
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'))
}
