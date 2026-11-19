/**
 * Client-side tekstherkenning (OCR) voor foto's van etiketten en menukaarten,
 * met Tesseract.js. Alles draait in de browser: de foto verlaat het toestel niet.
 *
 * Tesseract en het taalmodel worden pas bij de eerste foto geladen (dynamic import),
 * zodat de app zelf snel blijft. Het model wordt daarna door de browser bewaard.
 */
import type { Worker as TesseractWorker } from 'tesseract.js'
import { enhanceForOcr } from './enhance'

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

/** Langste zijde voor de gewone (niet opgeknapte) versie. */
const MAX_SIDE = 2000
/** Onder deze zekerheid lezen we ook de gewone foto en nemen we de beste. */
const RETRY_BELOW = 75

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

/** Gewone versie: alleen verkleinen en grijs maken. Vangnet als opknappen niet helpt. */
function plainImage(bitmap: ImageBitmap): HTMLCanvasElement {
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')!
  ctx.filter = 'grayscale(1) contrast(1.15)'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

export function isOcrAvailable(): boolean {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof WebAssembly !== 'undefined'
}

export async function recognizeText(image: Blob, onProgress?: (p: OcrProgress) => void): Promise<OcrResult> {
  if (!isOcrAvailable()) throw new OcrUnavailableError()
  reportProgress = onProgress ?? null
  let bitmap: ImageBitmap | null = null
  try {
    onProgress?.({ stage: 'loading', progress: 0 })
    const workerP = getWorker()
    bitmap = await createImageBitmap(image).catch(() => null)
    const worker = await workerP
    if (!bitmap) {
      // Oude browser zonder createImageBitmap: origineel lezen.
      const { data } = await worker.recognize(image)
      return { text: data.text.trim(), confidence: data.confidence }
    }
    // Opgeknapte foto: schaduw en glans weg, scherper, zwart op wit.
    const { data } = await worker.recognize(enhanceForOcr(bitmap))
    let best: OcrResult = { text: data.text.trim(), confidence: data.confidence }
    if (best.confidence < RETRY_BELOW) {
      const plain = await worker.recognize(plainImage(bitmap))
      if (plain.data.confidence > best.confidence) best = { text: plain.data.text.trim(), confidence: plain.data.confidence }
    }
    return best
  } finally {
    bitmap?.close()
    reportProgress = null
  }
}
