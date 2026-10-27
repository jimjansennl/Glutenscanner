import type { ScanResult } from '../types/product'
import type { DecodedCode } from '../hooks/useBarcodeScanner'
import { analyzeOffProduct, analyzeText } from './glutenParser'
import { fetchProduct, isProductBarcode, ProductNotFoundError, toProduct } from './openFoodFacts'

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
    const reason =
      err instanceof ProductNotFoundError
        ? 'Product niet gevonden in Open Food Facts. Controleer het etiket of maak een foto van de ingrediënten.'
        : 'Productdata kon niet worden opgehaald. Controleer je internetverbinding.'
    return {
      source: 'barcode',
      rawValue: code,
      analysis: { status: 'warning', matches: [], warnings: [], reasons: [reason] },
    }
  }
}

/** Barcode → productlookup; overige QR-inhoud wordt als tekst geanalyseerd. */
export async function analyzeCode(code: DecodedCode, signal?: AbortSignal): Promise<ScanResult> {
  if (isProductBarcode(code.text)) {
    const result = await analyzeBarcode(code.text, signal)
    return { ...result, source: code.format }
  }
  return { source: code.format, rawValue: code.text, analysis: analyzeText(code.text) }
}
