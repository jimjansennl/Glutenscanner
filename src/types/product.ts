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

/** Etiket (verpakt product) of menukaart (restaurant): bepaalt welke risico's we zoeken. */
export type AnalysisContext = 'label' | 'menu'

export interface GlutenAnalysis {
  status: GlutenStatus
  /** Harde gluten-bronnen (leiden tot 'danger'). */
  matches: GlutenMatch[]
  /** Sporen en verdachte termen (leiden tot 'warning'). */
  warnings: GlutenMatch[]
  /** Korte, mensleesbare uitleg waarom deze status gekozen is. */
  reasons: string[]
  /** Concrete vragen/adviezen, vooral voor restaurants. */
  tips: string[]
  /** Product draagt een glutenvrij-claim; die gaat boven database-tekst. */
  certified?: boolean
  /** Termen uit de database die de claim tegenspreken (waarschijnlijk vervuilde data). */
  conflicts?: string[]  /** Ingrediëntenlijst noemt "glutenvrij" én een harde glutenbron. */
  contradictory?: boolean
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
  /** Alleen bij foto/tekst: etiket of menukaart. */
  context?: AnalysisContext
}
