/** Stand van de scanner: barcode (leest vanzelf) of etiket/menukaart (met sluiterknop). */
export type ScanMode = 'barcode' | 'text'

const KEY = 'glutenscanner.scanmode'

/** Laatst gekozen stand; standaard barcode, want dat is in de winkel het meest. */
export function loadScanMode(): ScanMode {
  try {
    return localStorage.getItem(KEY) === 'text' ? 'text' : 'barcode'
  } catch {
    return 'barcode'
  }
}

export function saveScanMode(mode: ScanMode) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    // Opslaan lukt niet (privémodus): dan geldt de keuze alleen nu.
  }
}
