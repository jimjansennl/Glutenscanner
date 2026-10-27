import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Circle, Loader2, ScanText, Sparkles, X } from 'lucide-react'
import type { AnalysisContext } from '../../types/product'
import { decodeImage, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { isOcrAvailable, recognizeText } from '../../services/ocr'

type StepState = 'pending' | 'active' | 'done' | 'skipped'

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
  const [context, setContext] = useState<AnalysisContext>('menu')
  const callbacks = useRef({ onCode, onText, context })
  useEffect(() => {
    callbacks.current = { onCode, onText, context }
  }, [onCode, onText, context])

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
        if (text.trim()) onText(text, callbacks.current.context)
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
        {!manual && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-brand-500/10" />
            <span className="absolute inset-x-0 h-1 animate-scanline bg-brand-500 shadow-[0_0_24px_6px] shadow-brand-500/70" />
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
        <div className="flex justify-center rounded-[22px] bg-surface p-4">
          <ul className="flex flex-col gap-2">
            <Step state="done" label="Foto vastgelegd" />
            <Step state={codeStep} label="Zoeken naar barcode of QR-code" />
            <Step state={ocrStep} label={context === 'menu' ? 'Menukaart lezen' : 'Ingrediënten lezen'} />
          </ul>
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
              {context === 'menu'
                ? 'Typ of plak het gerecht van de menukaart. We letten ook op sauzen, frituur en kruisbesmetting.'
                : 'Typ of plak de ingrediënten van het etiket.'}
              <span className="text-xs text-muted">Automatische tekstherkenning komt binnenkort.</span>
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={
                context === 'menu'
                  ? 'Bijv. Caesar salade met croutons en dressing'
                  : 'Bijv. tarwebloem, suiker, kan sporen van gerst bevatten'
              }
              className="w-full resize-none rounded-[22px] bg-surface p-3 text-center text-[17px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
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
