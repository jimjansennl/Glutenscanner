import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle, Loader2, ScanText, Sparkles, X } from 'lucide-react'
import type { AnalysisContext } from '../../types/product'
import { decodeImage, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { isOcrAvailable, recognizeText, type OcrProgress } from '../../services/ocr'

type StepState = 'pending' | 'active' | 'done' | 'skipped'

/** Onder deze Tesseract-zekerheid (0–100) laten we de gebruiker de tekst eerst controleren. */
const MIN_CONFIDENCE = 45

interface Props {
  imageUrl: string
  image: Blob
  onCode: (code: DecodedCode) => void
  onText: (text: string, context: AnalysisContext) => void
  onCancel: () => void
}

function Step({ state, label }: { state: StepState; label: string }) {
  const icon = {
    pending: <Circle size={18} className="text-white/30" />,
    active: <Loader2 size={18} className="animate-spin text-safe" />,
    done: <CheckCircle2 size={18} className="text-safe" />,
    skipped: <Circle size={18} className="text-white/30" />,
  }[state]
  return (
    <li className={`flex items-center gap-3 text-sm ${state === 'pending' || state === 'skipped' ? 'text-white/50' : ''}`}>
      {icon}
      {label}
    </li>
  )
}

/** Voortgang over beide OCR-fasen samen: laden telt voor 30%, lezen voor 70%. */
function overallProgress(p: OcrProgress | null): number {
  if (!p) return 0
  return p.stage === 'loading' ? p.progress * 0.3 : 0.3 + p.progress * 0.7
}

/**
 * Scanningscherm na een foto: zoekt eerst naar een barcode/QR in de afbeelding,
 * daarna leest OCR de tekst en gaat die direct naar de gluten-parser. Is de tekst
 * slecht leesbaar of faalt OCR, dan kan de gebruiker de tekst controleren of typen.
 */
export function PhotoAnalysis({ imageUrl, image, onCode, onText, onCancel }: Props) {
  const [codeStep, setCodeStep] = useState<StepState>('active')
  const [loadStep, setLoadStep] = useState<StepState>('pending')
  const [readStep, setReadStep] = useState<StepState>('pending')
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [manual, setManual] = useState<null | 'unclear' | 'failed'>(null)
  const [text, setText] = useState('')
  const [context, setContext] = useState<AnalysisContext>('menu')
  const callbacks = useRef({ onCode, onText, context })
  useEffect(() => {
    callbacks.current = { onCode, onText, context }
  }, [onCode, onText, context])

  useEffect(() => {
    const { onCode } = callbacks.current
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
        setManual('failed')
        return
      }
      setLoadStep('active')
      try {
        const result = await recognizeText(image, (p) => {
          if (cancelled) return
          setProgress(p)
          if (p.stage === 'recognizing') {
            setLoadStep('done')
            setReadStep('active')
          }
        })
        if (cancelled) return
        setLoadStep('done')
        setReadStep('done')
        if (result.text.length >= 3 && result.confidence >= MIN_CONFIDENCE) {
          // Context van dít moment: de gebruiker kan tijdens het lezen nog wisselen.
          callbacks.current.onText(result.text, callbacks.current.context)
        } else {
          setText(result.text)
          setManual('unclear')
        }
      } catch {
        if (cancelled) return
        setLoadStep('skipped')
        setReadStep('skipped')
        setManual('failed')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [image, imageUrl])

  const busy = manual === null
  const percent = Math.round(overallProgress(progress) * 100)
  const statusLabel =
    codeStep === 'active'
      ? 'Zoeken naar barcode…'
      : progress?.stage === 'recognizing'
        ? `Tekst lezen… ${percent}%`
        : `Tekstherkenning laden… ${percent}%`

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <header className="relative flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold">
          <ScanText size={20} className="text-safe" />
          Foto analyseren
        </h1>
        <button
          onClick={onCancel}
          className="absolute right-4 rounded-full bg-white/10 p-2.5 active:bg-white/20"
          aria-label="Annuleren"
        >
          <X size={22} />
        </button>
      </header>

      <div className="relative mx-4 min-h-0 flex-1 overflow-hidden rounded-[28px] bg-surface">
        <img src={imageUrl} alt="Vastgelegde foto" className="h-full w-full object-contain" />
        {busy && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-safe/15 via-transparent to-safe/15" />
            <span className="absolute inset-x-0 h-1 animate-scanline bg-safe shadow-[0_0_24px_6px] shadow-safe/70" />
            <span
              className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 text-[15px] font-semibold tabular-nums backdrop-blur-xl"
              aria-live="polite"
            >
              {statusLabel}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex self-center rounded-full bg-surface p-1" role="tablist" aria-label="Soort tekst">
          {(
            [
              ['menu', 'Menukaart'],
              ['label', 'Etiket'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={context === id}
              onClick={() => setContext(id)}
              className={`rounded-full px-5 py-2 text-[15px] font-semibold transition-colors ${
                context === id ? 'bg-white text-black' : 'text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Blok gecentreerd, regels onderling uitgelijnd zodat de vinkjes in één lijn staan. */}
        <div className="flex flex-col items-center gap-3 rounded-[22px] bg-surface p-4">
          <ul className="flex flex-col gap-2">
            <Step state="done" label="Foto vastgelegd" />
            <Step state={codeStep} label="Zoeken naar barcode of QR-code" />
            <Step state={loadStep} label="Tekstherkenning laden" />
            <Step state={readStep} label={context === 'menu' ? 'Menukaart lezen' : 'Ingrediënten lezen'} />
          </ul>
          {busy && codeStep !== 'active' && (
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-safe transition-[width] duration-300" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>

        {manual && (
          <form
            className="animate-slide-up flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (text.trim()) onText(text, context)
            }}
          >
            <p className="flex flex-col items-center gap-1 text-center text-sm text-white/70">
              <Sparkles size={16} className="text-warning" />
              {manual === 'unclear'
                ? 'De tekst was niet goed leesbaar. Controleer en vul aan wat we gelezen hebben.'
                : 'Tekstherkenning kon niet starten (eerste keer is internet nodig). Typ of plak de tekst zelf.'}
              {context === 'menu' && (
                <span className="text-xs text-muted">We letten ook op sauzen, frituur en kruisbesmetting.</span>
              )}
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder={
                context === 'menu'
                  ? 'Bijv. Caesar salade met croutons en dressing'
                  : 'Bijv. tarwebloem, suiker, kan sporen van gerst bevatten'
              }
              className="w-full resize-none rounded-[22px] bg-surface p-3 text-center text-[17px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-safe"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-full bg-safe py-3.5 text-[17px] font-semibold text-black active:opacity-80 disabled:opacity-40"
            >
              Analyseer tekst
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
