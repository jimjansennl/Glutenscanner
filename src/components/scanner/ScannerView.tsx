import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { Barcode, Camera, FileText, Images, Menu, ScanBarcode, Zap, ZapOff } from 'lucide-react'
import { SECURE_URL } from '../../services/secureContext'
import { useBarcodeScanner, type DecodedCode, type SeenBox } from '../../hooks/useBarcodeScanner'
import { BottomNav, type NavTab } from '../ui/BottomNav'
import { captureArea } from '../../services/capture'
import { loadScanMode, saveScanMode, type ScanMode } from '../../services/scanMode'

const CORNERS = [
  'left-3 top-3 border-l-4 border-t-4 rounded-tl-xl',
  'right-3 top-3 border-r-4 border-t-4 rounded-tr-xl',
  'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-xl',
  'bottom-3 right-3 border-b-4 border-r-4 rounded-br-xl',
]

interface Props {
  onNavigate: (tab: NavTab) => void
  /** Logo: naar de website. */
  onHome: () => void
  onMenu: () => void
  onCode: (code: DecodedCode) => void
  /** textOnly: foto gemaakt in de stand etiket/menu, dan niet eerst naar een barcode zoeken. */
  onPhoto: (image: Blob, textOnly: boolean) => void
}

function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex max-w-[92%] items-center justify-center gap-2 rounded-full bg-neutral-700/75 px-4 py-2 text-center text-[15px] leading-snug backdrop-blur-xl ${className}`}
    >
      {children}
    </p>
  )
}

/** Zaklamp via de camera-track; alleen zichtbaar als het toestel 'torch' ondersteunt. */
function useTorch(videoRef: RefObject<HTMLVideoElement | null>, ready: boolean) {
  const [supported, setSupported] = useState(false)
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!ready) return
    const track = (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()[0]
    const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined
    setSupported(!!caps?.torch)
  }, [ready, videoRef])

  async function toggle() {
    const track = (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()[0]
    if (!track) return
    try {
      await track.applyConstraints({ advanced: [{ torch: !on } as MediaTrackConstraintSet] })
      setOn(!on)
    } catch {
      setSupported(false)
    }
  }

  return { supported, on, toggle }
}

/** Hoe lang een gezien barcodekader blijft staan als de code even uit beeld is. */
const SEEN_HOLD_MS = 700

/** Ruimte (px) die de knoppen onderin innemen: het etiketkader eindigt daarboven. */
const CONTROLS_SPACE = 164

/** Barcodekader: breed en laag in het midden (fracties van het camerabeeld). */
const BARCODE_FRAME = { left: 0.08, top: 0.2, width: 0.84, height: 0.3 }

/** De foto pakt iets ruimer dan het kader, zodat er geen letters afvallen. */
const MARGIN = 0.03

export function ScannerView({ onNavigate, onHome, onMenu, onCode, onPhoto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [seen, setSeen] = useState<SeenBox | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [mode, setMode] = useState<ScanMode>(loadScanMode)
  const frameRef = useRef<HTMLDivElement>(null)
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Stand barcode: leest vanzelf. Stand etiket/menu: camera blijft aan, geen barcodes, wel de sluiterknop.
  const { error, ready } = useBarcodeScanner(
    videoRef,
    onCode,
    true,
    (box) => {
      if (!box) return
      setSeen(box)
      clearTimeout(hold.current)
      hold.current = setTimeout(() => setSeen(null), SEEN_HOLD_MS)
    },
    mode === 'barcode',
  )
  useEffect(() => () => clearTimeout(hold.current), [])
  const torch = useTorch(videoRef, ready)

  function choose(next: ScanMode) {
    if (next === mode) return
    navigator.vibrate?.(10)
    clearTimeout(hold.current)
    setSeen(null)
    setMode(next)
    saveScanMode(next)
  }

  async function snapshot() {
    const video = videoRef.current
    if (!video || !video.videoWidth || capturing) return
    setCapturing(true)
    navigator.vibrate?.(30)
    try {
      // Precies wat er in het kader staat (plus wat rand), gemeten op het scherm.
      const v = video.getBoundingClientRect()
      const f = frameRef.current!.getBoundingClientRect()
      const left = Math.max(0, (f.left - v.left) / v.width - MARGIN)
      const top = Math.max(0, (f.top - v.top) / v.height - MARGIN)
      const blob = await captureArea(video, {
        left,
        top,
        width: Math.min(1 - left, f.width / v.width + MARGIN * 2),
        height: Math.min(1 - top, f.height / v.height + MARGIN * 2),
      })
      onPhoto(blob, true)
    } catch {
      setCapturing(false)
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onPhoto(file, mode === 'text')
    e.target.value = ''
  }

  const torchButton = torch.supported ? (
    <button
      onClick={torch.toggle}
      className={`flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-xl ${
        torch.on ? 'bg-white text-black' : 'bg-neutral-800/80 text-white active:bg-neutral-700'
      }`}
      aria-label={torch.on ? 'Zaklamp uit' : 'Zaklamp aan'}
      aria-pressed={torch.on}
    >
      {torch.on ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
    </button>
  ) : (
    <span className="block h-14 w-14" />
  )

  // Keuze met alleen icoontjes: streepjes = barcode (vanzelf), blaadje = etiket of menukaart.
  const modeSwitch = (
    <div role="radiogroup" aria-label="Wat wil je scannen?" className="flex rounded-full bg-neutral-800/80 p-1 backdrop-blur-xl">
      {(
        [
          ['barcode', Barcode, 'Barcode'],
          ['text', FileText, 'Etiket of menukaart'],
        ] as const
      ).map(([m, Icon, label]) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          aria-label={label}
          onClick={() => choose(m)}
          className={`flex h-11 w-14 items-center justify-center rounded-full transition-colors ${
            mode === m ? 'bg-accent text-black' : 'text-white/70 active:bg-white/10'
          }`}
        >
          <Icon size={23} />
        </button>
      ))}
    </div>
  )

  // Kader: groot voor etiket of menukaart (tot net boven de knoppen), breed en laag voor een
  // barcode, en strak om een gevonden barcode heen.
  const PAD = 0.04
  const pct = (n: number) => `${n * 100}%`
  const frame: CSSProperties =
    mode === 'text'
      ? { left: '6%', right: '6%', top: '3%', bottom: CONTROLS_SPACE }
      : seen
        ? {
            left: pct(Math.max(0, seen.left - PAD)),
            top: pct(Math.max(0, seen.top - PAD)),
            width: pct(Math.min(1, seen.width + PAD * 2)),
            height: pct(Math.min(1, seen.height + PAD * 2)),
          }
        : {
            left: pct(BARCODE_FRAME.left),
            top: pct(BARCODE_FRAME.top),
            width: pct(BARCODE_FRAME.width),
            height: pct(BARCODE_FRAME.height),
          }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      {/* Kop: logo links (naar de website), menu rechts. */}
      <header className="flex h-14 shrink-0 items-end justify-between px-3 pb-1.5 pt-[env(safe-area-inset-top)]">
        <button onClick={onHome} className="flex items-center gap-2 rounded-xl p-1 active:opacity-70" aria-label="Naar de website van Glutenscanner">
          <span className="flex h-8 w-8 rotate-[-6deg] items-center justify-center rounded-[10px] bg-accent text-white shadow-lg shadow-accent/30">
            <ScanBarcode size={17} />
          </span>
          <span className="font-display text-[19px] font-bold tracking-tight">glutenscanner</span>
        </button>
        <button onClick={onMenu} className="rounded-full p-2 active:bg-white/10" aria-label="Menu openen">
          <Menu size={26} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />

        {/* Het kader beweegt soepel van groot naar om de barcode heen; de schaduw dimt de rest. */}
        <div
          ref={frameRef}
          className={`pointer-events-none absolute rounded-[28px] transition-all duration-300 ease-out ${
            seen ? 'border-[3px] border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]' : 'shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]'
          }`}
          style={frame}
        >
          {CORNERS.map((pos) => (
            <span key={pos} className={`absolute h-9 w-9 border-accent ${pos}`} />
          ))}
          {ready && !seen && (
            <span className="absolute inset-x-6 h-0.5 animate-scanline rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent" />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
          {error && !window.isSecureContext ? (
            // Geen beveiligde verbinding: geen techtaal, maar één knop naar de scanner die wél werkt.
            <a
              href={SECURE_URL}
              target="_top"
              className="flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-[18px] font-semibold text-white shadow-xl shadow-accent/30 active:scale-95"
            >
              <ScanBarcode size={22} />
              Open de scanner
            </a>
          ) : error ? (
            <Pill className="!bg-danger/90">{error}</Pill>
          ) : !ready ? (
            <Pill>Camera starten…</Pill>
          ) : capturing ? (
            <Pill className="!bg-accent/90">
              <Camera size={18} />
              Foto maken, even stilhouden…
            </Pill>
          ) : seen ? (
            <Pill className="!bg-accent/90">
              <ScanBarcode size={18} />
              Barcode gevonden, even stilhouden…
            </Pill>
          ) : null}

          {/* Etiket/menu: de keuze staat net boven de sluiterknop. Barcode: in de rij zelf. */}
          {mode === 'text' && modeSwitch}

          <div className="grid w-full max-w-xs grid-cols-3 items-center">
            <span className="justify-self-start">{torchButton}</span>
            {mode === 'text' ? (
              <button
                onClick={snapshot}
                disabled={!ready || capturing}
                className="justify-self-center rounded-full border-4 border-white p-1 disabled:opacity-40"
                aria-label="Foto maken van etiket of menukaart"
              >
                <span className="block h-[60px] w-[60px] rounded-full bg-white transition-transform active:scale-90" />
              </button>
            ) : (
              <span className="justify-self-center">{modeSwitch}</span>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-14 w-14 items-center justify-center justify-self-end rounded-full bg-neutral-800/80 backdrop-blur-xl active:bg-neutral-700"
              aria-label="Foto uit galerij kiezen"
            >
              <Images size={24} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
      </div>

      <BottomNav active="scan" onSelect={onNavigate} />
    </div>
  )
}
