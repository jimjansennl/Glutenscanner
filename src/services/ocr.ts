/**
 * Client-side tekstherkenning (OCR) voor foto's van etiketten en menukaarten,
 * met Tesseract.js. Alles draait in de browser: de foto verlaat het toestel niet.
 *
 * Tesseract en het taalmodel worden pas bij de eerste foto geladen (dynamic import),
 * zodat de app zelf snel blijft. Het model wordt daarna door de browser bewaard.
 */
import type { PSM, Worker as TesseractWorker } from 'tesseract.js'
import { enhanceForOcr } from './enhance'

export interface OcrResult {
  text: string
  /** 0–100 zoals Tesseract die levert. */
  confidence: number
  /** Woorden die de camera niet goed kon lezen (lage zekerheid per woord), kleine letters. */
  unsure?: string[]
}

/** Onder deze zekerheid (per woord) twijfelt de camera aan het woord. */
const WORD_UNSURE = 75

type Page = { blocks: { paragraphs: { lines: { words: { text: string; confidence: number }[] }[] }[] }[] | null }

function unsureWords(data: Page): string[] {
  const out = new Set<string>()
  for (const b of data.blocks ?? [])
    for (const p of b.paragraphs)
      for (const l of p.lines)
        for (const w of l.words) {
          const t = w.text.replace(/[^\p{L}]/gu, '')
          if (t.length >= 4 && w.confidence < WORD_UNSURE) out.add(t.toLowerCase())
        }
  return [...out]
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
/** Vanaf deze zekerheid en hoeveelheid tekst is de eerste poging goed genoeg. */
const GOOD_CONFIDENCE = 65
const ENOUGH_LETTERS = 40

const letters = (t: string) => (t.match(/\p{L}/gu) ?? []).length
/** Zekerheid telt pas mee als er ook echt tekst gelezen is ("95% zeker" van niets zegt niets). */
const score = (t: string, conf: number) => conf * Math.min(1, letters(t) / ENOUGH_LETTERS)

/** Wordt gevuld zodra Tesseract geladen is (het pakket laden we pas bij de eerste foto). */
let psm: typeof import('tesseract.js').PSM

let workerPromise: Promise<TesseractWorker> | null = null
let reportProgress: ((p: OcrProgress) => void) | null = null

function getWorker(): Promise<TesseractWorker> {
  workerPromise ??= import('tesseract.js')
    .then(async (mod) => {
      psm = mod.PSM
      const { createWorker } = mod
      const worker = await createWorker(LANGS, 1, {
        // Alles komt van onze eigen site (public/tesseract), niet van een externe server.
        // Zo werkt het ook offline zodra de bestanden één keer geladen zijn.
        workerPath: '/tesseract/worker.min.js',
        corePath: '/tesseract',
        langPath: '/tesseract/lang',
        // Direct vanaf ons adres starten (niet via een blob), dan kan de offline-opslag meekijken.
        workerBlobURL: false,
        logger: (m) => {
          const stage: OcrStage = m.status === 'recognizing text' ? 'recognizing' : 'loading'
          reportProgress?.({ stage, progress: m.progress })
        },
      })
      // Standaard leest Tesseract alles als één blok. Verpakkingen en menukaarten hebben
      // kolommen: met automatische indeling raken de regels niet door elkaar.
      await worker.setParameters({ tessedit_pageseg_mode: psm.AUTO })
      return worker
    })
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
      const { data } = await worker.recognize(image, {}, { text: true, blocks: true })
      return { text: data.text.trim(), confidence: data.confidence, unsure: unsureWords(data) }
    }
    // Eerst de opgeknapte foto met kolom-indeling; is dat zwak, dan als één blok en daarna
    // de gewone foto. We nemen de uitkomst met de meeste goed gelezen tekst.
    const enhanced = enhanceForOcr(bitmap)
    const attempts: [HTMLCanvasElement | (() => HTMLCanvasElement), PSM][] = [
      [enhanced, psm.AUTO],
      [enhanced, psm.SINGLE_BLOCK],
      [() => plainImage(bitmap!), psm.AUTO],
    ]
    let best: OcrResult & { score: number } = { text: '', confidence: 0, score: -1 }
    for (const [img, mode] of attempts) {
      await worker.setParameters({ tessedit_pageseg_mode: mode })
      const { data } = await worker.recognize(typeof img === 'function' ? img() : img, {}, { text: true, blocks: true })
      const text = data.text.trim()
      const s = score(text, data.confidence)
      if (s > best.score) best = { text, confidence: data.confidence, unsure: unsureWords(data), score: s }
      if (best.confidence >= GOOD_CONFIDENCE && letters(best.text) >= ENOUGH_LETTERS) break
    }
    await worker.setParameters({ tessedit_pageseg_mode: psm.AUTO })
    return { text: best.text, confidence: best.confidence, unsure: best.unsure }
  } finally {
    bitmap?.close()
    reportProgress = null
  }
}
