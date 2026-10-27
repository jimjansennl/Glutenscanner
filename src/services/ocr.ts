/**
 * OCR-koppelpunt voor foto's van etiketten en menukaarten.
 *
 * De UI roept alleen `recognizeText` aan. Een echte engine (bijv. tesseract.js
 * in de browser, of een Supabase Edge Function met een vision-API) kan hier
 * worden ingeplugd zonder de schermen aan te passen.
 */
export interface OcrResult {
  text: string
  /** 0–1, indien de engine dit levert. */
  confidence?: number
}

export class OcrUnavailableError extends Error {
  constructor() {
    super('Tekstherkenning is nog niet beschikbaar')
    this.name = 'OcrUnavailableError'
  }
}

export type OcrEngine = (image: Blob) => Promise<OcrResult>

let engine: OcrEngine | null = null

export function registerOcrEngine(next: OcrEngine) {
  engine = next
}

export function isOcrAvailable(): boolean {
  return engine !== null
}

export async function recognizeText(image: Blob): Promise<OcrResult> {
  if (!engine) throw new OcrUnavailableError()
  return engine(image)
}
