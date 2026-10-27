/**
 * Client-side tekstherkenning (OCR) voor foto's van etiketten en menukaarten,
 * met Tesseract.js. Alles draait in de browser: de foto verlaat het toestel niet.
 *
 * Tesseract en het taalmodel worden pas bij de eerste foto geladen (dynamic import),
 * zodat de app zelf snel blijft. Het model wordt daarna door de browser bewaard.
 */
import type { Worker as TesseractWorker } from 'tesseract.js'

export interface OcrResult {
  text: string
  /** 0–100 zoals Tesseract die levert. */
  confidence: number
}

export type OcrStage = 'loading' | 'recognizing'

export interface OcrProgress {
  stage: OcrStage
  /** 0–1 binnen de huidige fase. */
  progress: number
}

export class OcrUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Tekstherkenning kon niet worden gestart', { cause })
    this.name = 'OcrUnavailableError'
  }
}

/**
 * Nederlands + Engels. De parser normaliseert accenten, dus Spaanse, Italiaanse en
 * Franse termen (trigo, frumento, blé) worden ook met deze modellen goed herkend.
 */
const LANGS = ['nld', 'eng']

/** Langste zijde in pixels: groot genoeg voor kleine etiketletters, klein genoeg voor snelheid. */
const MAX_SIDE = 2000

let workerPromise: Promise<TesseractWorker> | null = null
let reportProgress: ((p: OcrProgress) => void) | null = null

function getWorker(): Promise<TesseractWorker> {
  workerPromise ??= import('tesseract.js')
    .then(({ createWorker }) =>
      createWorker(LANGS, 1, {
        logger: (m) => {
          const stage: OcrStage = m.status === 'recognizing text' ? 'recognizing' : 'loading'
          reportProgress?.({ stage, progress: m.progress })
        },
      }),
    )
    .catch((err) => {
      workerPromise = null // volgende poging opnieuw proberen (bijv. na netwerkfout)
      throw new OcrUnavailableError(err)
    })
  return workerPromise
}

/** Verkleint en maakt grijs: sneller en meestal betere herkenning van kleine letters. */
async function prepareImage(image: Blob): Promise<HTMLCanvasElement | Blob> {
  try {
    const bitmap = await createImageBitmap(image)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')!
    ctx.filter = 'grayscale(1) contrast(1.15)'
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    return canvas
  } catch {
    return image // oude browser zonder createImageBitmap: origineel gebruiken
  }
}

export function isOcrAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined'
}

export async function recognizeText(image: Blob, onProgress?: (p: OcrProgress) => void): Promise<OcrResult> {
  if (!isOcrAvailable()) throw new OcrUnavailableError()
  reportProgress = onProgress ?? null
  try {
    onProgress?.({ stage: 'loading', progress: 0 })
    const [worker, prepared] = await Promise.all([getWorker(), prepareImage(image)])
    const { data } = await worker.recognize(prepared)
    return { text: data.text.trim(), confidence: data.confidence }
  } finally {
    reportProgress = null
  }
}
