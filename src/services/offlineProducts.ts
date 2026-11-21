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
// Open Food Facts staat maximaal 10 zoekopdrachten per minuut toe: daarom een pauze tussen de stukken.
// Pagina's tot we ±3000 producten mét ingrediënten hebben (veel producten hebben er geen).
const TARGET = 3000
const MAX_PAGES = 20
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
    // Begin met wat er al bewaard is: een mislukte poging maakt de lijst nooit kleiner.
    const old = await readOwn().catch(() => null)
    const products: Record<string, OffProduct> = { ...(old?.products ?? {}) }
    const seen = new Set<string>()
    let fails = 0
    for (let page = 1; page <= MAX_PAGES && seen.size < TARGET; page++) {
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
      let got: (OffProduct & { code?: string })[]
      try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, { signal: AbortSignal.timeout(30000) })
        if (!res.ok) throw new Error(String(res.status))
        got = ((await res.json()) as { products?: (OffProduct & { code?: string })[] }).products ?? []
        fails = 0
      } catch {
        // Te druk of even geen bereik: wacht wat langer en probeer dezelfde pagina nog eens.
        if (++fails > 2) break
        page--
        await new Promise((r) => setTimeout(r, PAUSE_MS * 2))
        continue
      }
      for (const p of got) {
        if (!p.code || !(p.ingredients_text || p.ingredients_text_nl || p.ingredients_text_en)) continue
        const { code, ...rest } = p
        seen.add(code)
        products[code] = rest
      }
      await save(products)
      onProgress?.(Math.min(1, seen.size / TARGET))
      if (got.length === 0) break
    }
    return Object.keys(products).length
  })().finally(() => {
    running = null
  })
  return running
}

async function save(products: Record<string, OffProduct>) {
  if (typeof caches === 'undefined' || Object.keys(products).length === 0) return
  const next: Pack = { at: Date.now(), products }
  await (await caches.open(CACHE)).put(OWN_URL, new Response(JSON.stringify(next), { headers: { 'content-type': 'application/json' } }))
  pack = Promise.resolve(next)
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
