import { useEffect, useRef, useState, type RefObject } from 'react'
import { BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, NotFoundException } from '@zxing/library'

export interface DecodedCode {
  text: string
  format: 'barcode' | 'qr'
}

const FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.QR_CODE,
]

export function createReader() {
  const hints = new Map<DecodeHintType, unknown>([
    [DecodeHintType.POSSIBLE_FORMATS, FORMATS],
    [DecodeHintType.TRY_HARDER, true],
  ])
  return new BrowserMultiFormatReader(hints, 250)
}

function toDecoded(text: string, format: BarcodeFormat): DecodedCode {
  return { text, format: format === BarcodeFormat.QR_CODE ? 'qr' : 'barcode' }
}

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof Error ? err.name : ''
  if (name === 'NotAllowedError') return 'Geen toegang tot de camera. Sta cameratoegang toe in je browser.'
  if (name === 'NotFoundError') return 'Geen camera gevonden op dit apparaat.'
  if (!window.isSecureContext) return 'De camera werkt alleen via HTTPS of localhost.'
  return 'De camera kon niet gestart worden.'
}

/** Start de achtercamera op `videoRef` en meldt de eerste gevonden barcode of QR-code. */
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

    const reader = createReader()
    let done = false
    let cancelled = false
    setError(null)

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } },
        video,
        (result, err) => {
          if (result && !done) {
            done = true
            navigator.vibrate?.(60)
            onDecodeRef.current(toDecoded(result.getText(), result.getBarcodeFormat()))
          } else if (err && !(err instanceof NotFoundException)) {
            console.debug('ZXing:', err)
          }
        },
      )
      .then(() => {
        // Unmount tijdens het opstarten: de stream is pas nu gekoppeld, dus alsnog stoppen.
        if (cancelled) reader.reset()
        else setReady(true)
      })
      .catch((err) => {
        if (!cancelled) setError(cameraErrorMessage(err))
      })

    return () => {
      cancelled = true
      done = true
      reader.reset()
      setReady(false)
    }
  }, [videoRef, enabled])

  return { error, ready }
}

/** Probeert een barcode of QR-code te vinden in een (foto-)afbeelding. */
export async function decodeImage(imageUrl: string): Promise<DecodedCode | null> {
  try {
    const result = await createReader().decodeFromImageUrl(imageUrl)
    return toDecoded(result.getText(), result.getBarcodeFormat())
  } catch {
    return null
  }
}
