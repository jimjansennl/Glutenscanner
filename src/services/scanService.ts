import type { ScanResult } from '../types/product'
import type { DecodedCode } from '../hooks/useBarcodeScanner'
import { analyzeOffProduct, analyzeText } from './glutenParser'
import { fetchProduct, isProductBarcode, ProductNotFoundError, toProduct } from './openFoodFacts'
import { offlineProduct } from './offlineProducts'

/** Zoekt een barcode op in Open Food Facts en analyseert het product op gluten. */
export async function analyzeBarcode(barcode: string, signal?: AbortSignal): Promise<ScanResult> {
  const code = barcode.trim()
  try {
    const off = await fetchProduct(code, signal)
    return {
      source: 'barcode',
      rawValue: code,
      product: toProduct(code, off),
      analysis: analyzeOffProduct(off),
    }
  } catch (err) {
    if (signal?.aborted) throw err
    // Geen internet (of de database reageert niet): kijk in de bewaarde lijst met populaire producten.
    if (!(err instanceof ProductNotFoundError)) {
      const saved = await offlineProduct(code)
      if (saved) {
        return {
          source: 'barcode',
          rawValue: code,
          product: toProduct(code, saved.product),
          analysis: analyzeOffProduct(saved.product),
          offlineAt: saved.at,
        }
      }
    }
    const reason =
      err instanceof ProductNotFoundError
        ? 'Product niet gevonden in Open Food Facts. Controleer het etiket of maak een foto van de ingrediënten.'
        : 'Productdata kon niet worden opgehaald. Controleer je internetverbinding.'
    return {
      source: 'barcode',
      rawValue: code,
      analysis: { status: 'warning', matches: [], warnings: [], reasons: [reason], tips: [] },
    }
  }
}

/**
 * Nieuwe QR-codes op verpakkingen (GS1 Digital Link) hebben de barcode in de link,
 * bijvoorbeeld https://merk.nl/01/08712345678906. Die halen we eruit.
 */
function barcodeFromLink(text: string): string | null {
  const gtin = text.match(/\/01\/(\d{8,14})(?=[/?#]|$)/)?.[1]
  if (!gtin) return null
  return gtin.length === 14 && gtin.startsWith('0') ? gtin.slice(1) : gtin
}

/** Barcode → productlookup; een gewone link is nooit "glutenvrij"; overige QR-tekst wordt geanalyseerd. */
export async function analyzeCode(code: DecodedCode, signal?: AbortSignal): Promise<ScanResult> {
  const barcode = isProductBarcode(code.text) ? code.text.trim() : barcodeFromLink(code.text)
  if (barcode) {
    const result = await analyzeBarcode(barcode, signal)
    return { ...result, source: code.format }
  }
  if (/^(https?:\/\/|www\.)/i.test(code.text.trim())) {
    return {
      source: code.format,
      rawValue: code.text,
      analysis: {
        status: 'warning',
        matches: [],
        warnings: [],
        reasons: ['Deze QR-code is een link. Er staan geen ingrediënten in. Scan de streepjescode of maak een foto van de ingrediënten.'],
        tips: [],
      },
    }
  }
  return { source: code.format, rawValue: code.text, analysis: analyzeText(code.text) }
}
