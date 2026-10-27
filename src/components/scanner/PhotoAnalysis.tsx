import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle, Loader2, ScanText, Sparkles, X } from 'lucide-react'
import { decodeImage, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { isOcrAvailable, recognizeText } from '../../services/ocr'

type StepState = 'pending' | 'active' | 'done' | 'skipped'

interface Props {
  imageUrl: string
  image: Blob
  onCode: (code: DecodedCode) => void
  onText: (text: string) => void
  onCancel: () => void
}

function Step({ state, label }: { state: StepState; label: string }) {
  const icon = {
    pending: <Circle size={18} className="text-white/30" />,
    active: <Loader2 size={18} className="animate-spin text-brand-500" />,
    done: <CheckCircle2 size={18} className="text-brand-500" />,
    skipped: <Circle size={18} className="text-white/30" />,
  }[state]
  return (
    <li className={`flex items-center gap-3 text-sm ${state === 'pending' || state === 'skipped' ? 'text-white/50' : ''}`}>
      {icon}
      {label}
    </li>
  )
}

/**
 * Scanningscherm na een foto: zoekt eerst naar een barcode/QR in de afbeelding,
 * daarna tekstherkenning (OCR). Zolang er geen OCR-engine is geregistreerd kan de
 * gebruiker de tekst zelf invoeren, zodat de rest van de flow al werkt.
 */
export function PhotoAnalysis({ imageUrl, image, onCode, onText, onCancel }: Props) {
  const [codeStep, setCodeStep] = useState<StepState>('active')
  const [ocrStep, setOcrStep] = useState<StepState>('pending')
  const [manual, setManual] = useState(false)
  const [text, setText] = useState('')
  const callbacks = useRef({ onCode, onText })
  useEffect(() => {
    callbacks.current = { onCode, onText }
  }, [onCode, onText])

  useEffect(() => {
    const { onCode, onText } = callbacks.current
    let cancelled = false
    ;(async () => {
      const code = await decodeImage(imageUrl)
      if (cancelled) return
      if (code) {
        setCodeStep('done')
        onCode(code)
        return
      }
      setCodeStep('skipped')

      if (!isOcrAvailable()) {
        setOcrStep('skipped')
        setManual(true)
        return
      }
      setOcrStep('active')
      try {
        const { text } = await recognizeText(image)
        if (cancelled) return
        setOcrStep('done')
        if (text.trim()) onText(text)
        else setManual(true)
      } catch {
        if (!cancelled) {
          setOcrStep('skipped')
          setManual(true)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [image, imageUrl])

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-950 text-white">
      <header className="flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="flex items-center gap-2 font-semibold">
          <ScanText size={20} className="text-brand-500" />
          Foto analyseren
        </h1>
        <button onClick={onCancel} className="rounded-full bg-white/10 p-2.5 active:bg-white/20" aria-label="Annuleren">
          <X size={22} />
        </button>
      </header>

      <div className="relative mx-4 min-h-0 flex-1 overflow-hidden rounded-3xl bg-black">
        <img src={imageUrl} alt="Vastgelegde foto" className="h-full w-full object-contain" />
        {!manual && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/10" />
            <span className="absolute inset-x-0 h-1 animate-scanline bg-brand-500 shadow-[0_0_24px_6px] shadow-brand-500/70" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ul className="flex flex-col gap-2 rounded-2xl bg-white/5 p-4">
          <Step state="done" label="Foto vastgelegd" />
          <Step state={codeStep} label="Zoeken naar barcode of QR-code" />
          <Step state={ocrStep} label="Tekst herkennen (ingrediënten / menukaart)" />
        </ul>

        {manual && (
          <form
            className="animate-slide-up flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (text.trim()) onText(text)
            }}
          >
            <p className="flex items-start gap-2 text-sm text-white/70">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-amber-400" />
              Automatische tekstherkenning komt binnenkort. Typ of plak de ingrediënten of het gerecht van de menukaart.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Bijv. tarwebloem, suiker, kan sporen van gerst bevatten"
              className="w-full resize-none rounded-2xl bg-white/10 p-3 text-[15px] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-2xl bg-brand-600 py-3.5 font-semibold active:bg-brand-700 disabled:opacity-40"
            >
              Analyseer tekst
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
