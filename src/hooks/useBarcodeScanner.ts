import { useEffect, useRef, useState, type RefObject } from 'react'
import { BarcodeDetector as BarcodeDetectorPonyfill, prepareZXingModule, type BarcodeFormat } from 'barcode-detector/ponyfill'
import zxingWasmUrl from 'zxing-wasm/reader/zxing_reader.wasm?url'

export interface DecodedCode {
  text: string
  format: 'barcode' | 'qr'
}

const FORMATS: BarcodeFormat[] = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']

/** Elke ~120 ms een frame: snel genoeg om direct te reageren, zuinig met de batterij. */
const SCAN_INTERVAL_MS = 120

/** Een code telt pas na twee gelijke lezingen binnen deze tijd: voorkomt misreads. */
const CONFIRM_WINDOW_MS = 1500

/** Uitsnede rond het kader (fractie van het zichtbare camerabeeld). */
const CROP = { width: 0.86, height: 0.5 }

/** Langste zijde van wat we aan de lezer geven; groter is trager zonder betere herkenning. */
const MAX_DECODE_SIDE = 1280

// De zxing-wasm-lezer zelf meeleveren in plaats van van een CDN te laden.
prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? zxingWasmUrl : prefix + path),
  },
})

interface Detector {
  detect(source: ImageBitmapSource): Promise<{ rawValue: string; format: string }[]>
}

let detectorPromise: Promise<Detector> | null = null

/**
 * Ingebouwde BarcodeDetector als die alle formaten kent (Chrome op Android),
 * anders de zxing-cpp ponyfill (o.a. Safari op iPhone).
 */
function getDetector(): Promise<Detector> {
  detectorPromise ??= (async () => {
    const Native = (globalThis as { BarcodeDetector?: typeof BarcodeDetectorPonyfill }).BarcodeDetector
    if (Native) {
      try {
        const supported = await Native.getSupportedFormats()
        if (['ean_13', 'qr_code'].every((f) => supported.includes(f as BarcodeFormat))) {
          return new Native({ formats: FORMATS })
        }
      } catch {
        // val terug op de ponyfill
      }
    }
    return new BarcodeDetectorPonyfill({ formats: FORMATS })
  })()
  return detectorPromise
}

function toDecoded(text: string, format: string): DecodedCode {
  return { text: text.trim(), format: format === 'qr_code' ? 'qr' : 'barcode' }
}

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : ''
  if (name === 'NotAllowedError') return 'Geen toegang tot de camera. Sta cameratoegang toe in je browser.'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'Geen camera gevonden op dit apparaat.'
  if (!window.isSecureContext) return 'De camera werkt alleen via HTTPS of localhost.'
  return 'De camera kon niet gestart worden.'
}

/**
 * Tekent het deel van het videobeeld dat de gebruiker in het kader ziet.
 * De video staat op object-cover, dus eerst het zichtbare deel bepalen.
 */
function drawCrop(video: HTMLVideoElement, canvas: HTMLCanvasElement, full: boolean) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const ew = video.clientWidth || vw
  const eh = video.clientHeight || vh
  // Zichtbaar deel van de video bij object-cover
  const scale = Math.max(ew / vw, eh / vh)
  const visW = ew / scale
  const visH = eh / scale
  const w = full ? visW : visW * CROP.width
  const h = full ? visH : Math.min(visH, visW * CROP.height)
  const sx = (vw - w) / 2
  const sy = (vh - h) / 2
  const down = Math.min(1, MAX_DECODE_SIDE / Math.max(w, h))
  canvas.width = Math.round(w * down)
  canvas.height = Math.round(h * down)
  canvas.getContext('2d', { willReadFrequently: true })!.drawImage(video, sx, sy, w, h, 0, 0, canvas.width, canvas.height)
}

/** Start de achtercamera op `videoRef` en meldt de eerste zeker gelezen barcode of QR-code. */
export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  onDecode: (code: DecodedCode) => void,
  enabled = true,
) {
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const onDecodeRef = useRef(onDecode)
  useEffect(() => {
    onDecodeRef.current = onDecode
  }, [onDecode])

  useEffect(() => {
    const video = videoRef.current
    if (!enabled || !video) return

    let cancelled = false
    let stream: MediaStream | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    const canvas = document.createElement('canvas')
    let last: { text: string; at: number } | null = null
    let tick = 0
    setError(null)

    async function scanLoop() {
      if (cancelled || !video) return
      try {
        if (video.readyState >= 2 && video.videoWidth) {
          const detector = await getDetector()
          // Meestal alleen het kader; elke 4e keer het hele beeld als vangnet.
          drawCrop(video, canvas, ++tick % 4 === 0)
          const [hit] = await detector.detect(canvas)
          if (hit?.rawValue && !cancelled) {
            const now = Date.now()
            if (last && last.text === hit.rawValue && now - last.at < CONFIRM_WINDOW_MS) {
              cancelled = true
              navigator.vibrate?.(60)
              onDecodeRef.current(toDecoded(hit.rawValue, hit.format))
              return
            }
            last = { text: hit.rawValue, at: now }
          }
        }
      } catch (err) {
        console.debug('Barcode:', err)
      }
      if (!cancelled) timer = setTimeout(scanLoop, SCAN_INTERVAL_MS)
    }

    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        })
        if (cancelled) return
        // Doorlopend scherpstellen waar het toestel dat ondersteunt (Android).
        const track = stream.getVideoTracks()[0]
        const caps = track.getCapabilities?.() as (MediaTrackCapabilities & { focusMode?: string[] }) | undefined
        if (caps?.focusMode?.includes('continuous')) {
          track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] }).catch(() => {})
        }
        video.srcObject = stream
        video.setAttribute('playsinline', 'true')
        video.muted = true
        await video.play()
        if (cancelled) return
        setReady(true)
        getDetector() // wasm alvast laden terwijl de gebruiker richt
        scanLoop()
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err))
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timer)
      stream?.getTracks().forEach((t) => t.stop())
      if (video.srcObject === stream) video.srcObject = null
      setReady(false)
    }
  }, [videoRef, enabled])

  return { error, ready }
}

/** Probeert een barcode of QR-code te vinden in een (foto-)afbeelding. */
export async function decodeImage(imageUrl: string): Promise<DecodedCode | null> {
  try {
    const blob = await (await fetch(imageUrl)).blob()
    const bitmap = await createImageBitmap(blob)
    const [hit] = await (await getDetector()).detect(bitmap)
    bitmap.close()
    return hit?.rawValue ? toDecoded(hit.rawValue, hit.format) : null
  } catch {
    return null
  }
}
