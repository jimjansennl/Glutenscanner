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
].join(',')

export interface OffProduct extends OffProductFields {
  product_name?: string
  product_name_nl?: string
  brands?: string
  image_front_small_url?: string
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
  }
}

/** EAN-8, UPC-A, EAN-13 en GTIN-14 zijn allemaal 8–14 cijfers. */
export function isProductBarcode(value: string): boolean {
  return /^\d{8,14}$/.test(value.trim())
}
