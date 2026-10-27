import { readJson, writeJson } from '../lib/storage'
import type { ScanResult } from '../types/product'

const KEY = 'glutenscanner.history.v1'
const MAX_ITEMS = 15

export interface HistoryItem {
  id: string
  scannedAt: number
  title: string
  result: ScanResult
}

function titleFor(result: ScanResult): string {
  if (result.product) return result.product.name
  if (result.source === 'photo') return result.context === 'menu' ? 'Menukaart' : 'Etiket'
  return result.rawValue ? `Code ${result.rawValue}` : 'Scan'
}

export function loadHistory(): HistoryItem[] {
  const items = readJson<HistoryItem[]>(KEY, [])
  return Array.isArray(items) ? items : []
}

/** Voegt een scan vooraan toe; dezelfde barcode wordt niet dubbel bewaard. */
export function addToHistory(result: ScanResult): HistoryItem[] {
  // Blob-URL's van foto's zijn na herladen ongeldig, dus die bewaren we niet.
  const stored: ScanResult = { ...result, imageUrl: undefined }
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    scannedAt: Date.now(),
    title: titleFor(result),
    result: stored,
  }
  const barcode = result.product?.barcode
  const rest = loadHistory().filter((h) => !barcode || h.result.product?.barcode !== barcode)
  const next = [item, ...rest].slice(0, MAX_ITEMS)
  writeJson(KEY, next)
  return next
}

export function clearHistory(): void {
  writeJson(KEY, [])
}
