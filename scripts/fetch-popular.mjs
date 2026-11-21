// Haalt bij het bouwen op Vercel de meest gescande Nederlandse producten op uit Open Food Facts.
// De app bewaart die lijst, zodat een barcode ook zonder internet (kelder van de supermarkt)
// meteen een uitslag geeft. Lukt het ophalen niet, dan gaat het bouwen gewoon door.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'

const OUT_DIR = 'public/offline'
const OUT = `${OUT_DIR}/products-nl.json`
const PAGES = 15
const PAGE_SIZE = 200
const FIELDS = [
  'code', 'product_name', 'product_name_nl', 'brands', 'ingredients_text', 'ingredients_text_nl',
  'ingredients_text_en', 'allergens', 'allergens_tags', 'traces', 'traces_tags', 'labels', 'labels_tags', 'last_modified_t',
].join(',')

mkdirSync(OUT_DIR, { recursive: true })

// Alleen op Vercel (of als je het zelf vraagt): lokaal is er vaak geen internet.
if (!process.env.VERCEL && !process.env.FETCH_POPULAR) {
  if (!existsSync(OUT)) writeFileSync(OUT, JSON.stringify({ at: 0, products: {} }))
  console.log('fetch-popular: overgeslagen (niet op Vercel)')
  process.exit(0)
}

const products = {}
for (let page = 1; page <= PAGES; page++) {
  const params = new URLSearchParams({
    countries_tags: 'en:netherlands',
    sort_by: 'unique_scans_n',
    page_size: String(PAGE_SIZE),
    page: String(page),
    fields: FIELDS,
  })
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, {
      headers: { 'User-Agent': 'Glutenscanner/1.0 (www.glutenscanner.nl)' },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    for (const p of data.products ?? []) {
      if (!p.code || !(p.ingredients_text || p.ingredients_text_nl || p.ingredients_text_en)) continue
      // Lege velden weg: scheelt ruimte.
      products[p.code] = Object.fromEntries(Object.entries(p).filter(([k, v]) => k !== 'code' && v !== '' && !(Array.isArray(v) && v.length === 0)))
    }
    console.log(`fetch-popular: pagina ${page}, totaal ${Object.keys(products).length}`)
  } catch (err) {
    console.warn(`fetch-popular: pagina ${page} mislukt (${err.message})`)
    break
  }
}
writeFileSync(OUT, JSON.stringify({ at: Date.now(), products }))
console.log(`fetch-popular: ${Object.keys(products).length} producten bewaard`)
