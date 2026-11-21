import type { OffProduct } from './openFoodFacts'

/**
 * De meest gescande Nederlandse producten, bewaard op de telefoon. Zo geeft een barcode ook
 * zonder internet (kelder van de supermarkt) meteen een uitslag.
 *
 * De telefoon haalt de lijst zelf op bij Open Food Facts (in stukjes) en bewaart hem in de
 * opslag van de browser (Cache Storage, ruim genoeg; localStorage is te klein). Een lijst die bij
 * het bouwen is gemaakt (/offline/products-nl.json) gebruiken we alleen als de telefoon er zelf
 * nog geen heeft.
 */
const BUILD_URL = '/offline/products-nl.json'
const CACHE = 'eigen-productlijst'
const OWN_URL = '/offline/eigen-lijst.json'
// Open Food Facts staat maximaal 10 zoekopdrachten per minuut toe: daarom 6 stukken met een pauze.
const PAGES = 6
const PAGE_SIZE = 500
const PAUSE_MS = 6500
const MAX_AGE = 14 * 24 * 3600 * 1000
const FIELDS = [
  'code', 'product_name', 'product_name_nl', 'brands', 'ingredients_text', 'ingredients_text_nl', 'ingredients_text_en',
  'allergens', 'allergens_tags', 'traces', 'traces_tags', 'labels', 'labels_tags', 'last_modified_t',
].join(',')

interface Pack {
  at: number
  products: Record<string, OffProduct>
}

let pack: Promise<Pack | null> | null = null

async function readOwn(): Promise<Pack | null> {
  if (typeof caches === 'undefined') return null
  const res = await (await caches.open(CACHE)).match(OWN_URL)
  return res ? ((await res.json()) as Pack) : null
}

async function readBuild(): Promise<Pack | null> {
  const res = await fetch(BUILD_URL)
  if (!res.ok || !res.headers.get('content-type')?.includes('json')) return null
  return (await res.json()) as Pack
}

function load(): Promise<Pack | null> {
  pack ??= (async () => {
    const own = await readOwn().catch(() => null)
    if (own && Object.keys(own.products).length > 0) return own
    const built = await readBuild().catch(() => null)
    return built && Object.keys(built.products).length > 0 ? built : own
  })()
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

let running: Promise<number> | null = null

/**
 * Haalt de lijst opnieuw op bij Open Food Facts en bewaart hem. Geeft het aantal producten terug.
 * `onProgress`: 0 tot 1. Mislukt een stukje, dan houden we wat we al hebben.
 */
export function refreshOfflineProducts(onProgress?: (part: number) => void): Promise<number> {
  running ??= (async () => {
    const products: Record<string, OffProduct> = {}
    for (let page = 1; page <= PAGES; page++) {
      if (page > 1) await new Promise((r) => setTimeout(r, PAUSE_MS))
      const params = new URLSearchParams({
        countries_tags: 'en:netherlands',
        sort_by: 'unique_scans_n',
        page_size: String(PAGE_SIZE),
        page: String(page),
        fields: FIELDS,
        // Herkenbaar voor de service worker: deze grote lijsten niet nog eens apart bewaren.
        app: 'offline',
      })
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, { signal: AbortSignal.timeout(30000) })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { products?: (OffProduct & { code?: string })[] }
        for (const p of data.products ?? []) {
          if (!p.code || !(p.ingredients_text || p.ingredients_text_nl || p.ingredients_text_en)) continue
          const { code, ...rest } = p
          products[code] = rest
        }
      } catch {
        break
      }
      onProgress?.(page / PAGES)
    }
    const count = Object.keys(products).length
    if (count > 0 && typeof caches !== 'undefined') {
      const fresh: Pack = { at: Date.now(), products }
      await (await caches.open(CACHE)).put(OWN_URL, new Response(JSON.stringify(fresh), { headers: { 'content-type': 'application/json' } }))
      pack = Promise.resolve(fresh)
    }
    return count
  })().finally(() => {
    running = null
  })
  return running
}

/** Bij het openen: heeft de telefoon nog geen (verse) lijst, dan op de achtergrond ophalen. */
export function prefetchOfflineProducts() {
  if (typeof navigator === 'undefined' || !navigator.onLine) return
  setTimeout(async () => {
    const own = await readOwn().catch(() => null)
    if (own && Object.keys(own.products).length > 0 && Date.now() - own.at < MAX_AGE) return
    refreshOfflineProducts().catch(() => {})
  }, 8000)
}
