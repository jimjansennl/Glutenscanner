import type { OffProduct } from './openFoodFacts'

/**
 * De meest gescande Nederlandse producten, bewaard op de telefoon (bij het bouwen opgehaald,
 * zie scripts/fetch-popular.mjs). Zo geeft een barcode ook zonder internet meteen een uitslag.
 */
const URL = '/offline/products-nl.json'
const LAST_KEY = 'glutenscanner.offline.loaded'

interface Pack {
  at: number
  products: Record<string, OffProduct>
}

let pack: Promise<Pack | null> | null = null

function load(): Promise<Pack | null> {
  pack ??= fetch(URL)
    .then((r) => (r.ok ? (r.json() as Promise<Pack>) : null))
    .catch(() => null)
  return pack
}

/** Zoek een barcode in de bewaarde lijst. `at`: wanneer de lijst gemaakt is. */
export async function offlineProduct(barcode: string): Promise<{ product: OffProduct; at: number } | null> {
  const p = await load()
  const product = p?.products[barcode]
  return product ? { product, at: p.at } : null
}

/** Hoeveel producten er bewaard zijn en van wanneer (voor Instellingen). */
export async function offlineInfo(): Promise<{ count: number; at: number } | null> {
  const p = await load()
  return p ? { count: Object.keys(p.products).length, at: p.at } : null
}

/** Eén keer per week de lijst alvast ophalen (de service worker bewaart hem). */
export function prefetchOfflineProducts() {
  if (typeof navigator === 'undefined' || !navigator.onLine) return
  try {
    const last = Number(localStorage.getItem(LAST_KEY) ?? 0)
    if (Date.now() - last < 7 * 24 * 3600 * 1000) return
    setTimeout(() => {
      fetch(URL, { cache: 'reload' })
        .then((r) => {
          if (r.ok) localStorage.setItem(LAST_KEY, String(Date.now()))
        })
        .catch(() => {})
    }, 8000)
  } catch {
    // Geen opslag: niet erg.
  }
}
