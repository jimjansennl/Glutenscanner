import type { Product } from '../types/product'
import type { OffProductFields } from './glutenParser'

const FIELDS = [
  'product_name',
  'product_name_nl',
  'brands',
  'image_front_small_url',
  'ingredients_text',
  'ingredients_text_nl',
  'ingredients_text_en',
  'allergens',
  'allergens_tags',
  'traces',
  'traces_tags',
  'labels_tags',
  'labels',
  'categories_tags',
  'last_modified_t',
].join(',')

export interface OffProduct extends OffProductFields {
  product_name?: string
  product_name_nl?: string
  brands?: string
  image_front_small_url?: string
  /** Van algemeen naar specifiek, bijv. ["en:snacks", "en:biscuits", "en:shortbread"]. */
  categories_tags?: string[]
  code?: string
  /** Laatst bijgewerkt (seconden sinds 1970). */
  last_modified_t?: number
}

export class ProductNotFoundError extends Error {
  constructor(barcode: string) {
    super(`Product ${barcode} niet gevonden in Open Food Facts`)
    this.name = 'ProductNotFoundError'
  }
}

export async function fetchProduct(barcode: string, signal?: AbortSignal): Promise<OffProduct> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`,
    { signal },
  )
  if (res.status === 404) throw new ProductNotFoundError(barcode)
  if (!res.ok) throw new Error(`Open Food Facts gaf status ${res.status}`)

  const data: { status: number; product?: OffProduct } = await res.json()
  if (data.status !== 1 || !data.product) throw new ProductNotFoundError(barcode)
  return data.product
}

export function toProduct(barcode: string, off: OffProduct): Product {
  return {
    barcode,
    name: off.product_name_nl || off.product_name || 'Onbekend product',
    brand: off.brands?.split(',')[0]?.trim() || undefined,
    imageUrl: off.image_front_small_url,
    ingredientsText: off.ingredients_text_nl || off.ingredients_text || off.ingredients_text_en,
    categories: off.categories_tags,
    updatedAt: off.last_modified_t ? off.last_modified_t * 1000 : undefined,
  }
}

/** EAN-8, UPC-A, EAN-13 en GTIN-14 zijn allemaal 8–14 cijfers. */
export function isProductBarcode(value: string): boolean {
  return /^\d{8,14}$/.test(value.trim())
}

/**
 * Zoekt glutenvrije producten in dezelfde soort als `categories` (de meest specifieke eerst).
 * Eerst in Nederland, anders wereldwijd. Alleen de soort gaat naar Open Food Facts, verder niets.
 */
export async function fetchGlutenFreeAlternatives(
  categories: string[],
  exclude: string,
  signal?: AbortSignal,
): Promise<OffProduct[]> {
  const tries = [...categories].reverse().slice(0, 3)
  for (const category of tries) {
    for (const country of ['en:netherlands', '']) {
      const params = new URLSearchParams({
        categories_tags: category,
        labels_tags: 'en:no-gluten',
        fields: `code,${FIELDS}`,
        page_size: '24',
        sort_by: 'unique_scans_n',
      })
      if (country) params.set('countries_tags', country)
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?${params}`, { signal })
      if (!res.ok) continue
      const data: { products?: OffProduct[] } = await res.json()
      const found = (data.products ?? []).filter((p) => p.code && p.code !== exclude && (p.product_name_nl || p.product_name))
      if (found.length > 0) return found
    }
  }
  return []
}
