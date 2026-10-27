export type GlutenStatus = 'safe' | 'danger' | 'warning'

/** Waar in de productdata een match is gevonden. */
export type MatchSource = 'ingredients' | 'allergens' | 'traces' | 'text'

export interface GlutenMatch {
  /** Nette naam van de gluten-bron, bijv. "Tarwe". */
  label: string
  /** De letterlijke term zoals die in de tekst voorkwam. */
  term: string
  source: MatchSource
}

export interface GlutenAnalysis {
  status: GlutenStatus
  /** Harde gluten-bronnen (leiden tot 'danger'). */
  matches: GlutenMatch[]
  /** Sporen en verdachte termen (leiden tot 'warning'). */
  warnings: GlutenMatch[]
  /** Korte, mensleesbare uitleg waarom deze status gekozen is. */
  reasons: string[]
}

export interface Product {
  barcode: string
  name: string
  brand?: string
  imageUrl?: string
  ingredientsText?: string
}

export type ScanSource = 'barcode' | 'qr' | 'photo' | 'manual'

export interface ScanResult {
  source: ScanSource
  analysis: GlutenAnalysis
  product?: Product
  /** Ruwe inhoud: barcode, QR-tekst of (OCR-)tekst. */
  rawValue?: string
  imageUrl?: string
}
