import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import { Camera, Images, Menu, ScanBarcode, Zap, ZapOff } from 'lucide-react'
import { SECURE_URL } from '../../services/secureContext'
import { useBarcodeScanner, type DecodedCode, type SeenBox } from '../../hooks/useBarcodeScanner'
import { BottomNav, type NavTab } from '../ui/BottomNav'
import { captureArea } from '../../services/capture'

const CORNERS = [
  'left-3 top-3 border-l-4 border-t-4 rounded-tl-xl',
  'right-3 top-3 border-r-4 border-t-4 rounded-tr-xl',
  'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-xl',
  'bottom-3 right-3 border-b-4 border-r-4 rounded-br-xl',
]

interface Props {
  onNavigate: (tab: NavTab) => void
  onMenu: () => void
  onCode: (code: DecodedCode) => void
  onPhoto: (image: Blob) => void
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

/** Het grote kader op het scherm (fracties van het camerabeeld). */
const FRAME = { left: 0.06, top: 0.04, width: 0.88, height: 0.72 }
/** De foto pakt iets ruimer dan het kader, zodat er geen letters afvallen. */
const MARGIN = 0.03

export function ScannerView({ onNavigate, onMenu, onCode, onPhoto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [seen, setSeen] = useState<SeenBox | null>(null)
  const [capturing, setCapturing] = useState(false)
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Eén scherm: barcodes worden altijd vanzelf gelezen; de sluiterknop is voor etiket en menukaart.
  const { error, ready } = useBarcodeScanner(videoRef, onCode, true, (box) => {
    if (!box) return
    setSeen(box)
    clearTimeout(hold.current)
    hold.current = setTimeout(() => setSeen(null), SEEN_HOLD_MS)
  })
  useEffect(() => () => clearTimeout(hold.current), [])
  const torch = useTorch(videoRef, ready)

  async function snapshot() {
    const video = videoRef.current
    if (!video || !video.videoWidth || capturing) return
    setCapturing(true)
    navigator.vibrate?.(30)
    try {
      const left = Math.max(0, FRAME.left - MARGIN)
      const top = Math.max(0, FRAME.top - MARGIN)
      const blob = await captureArea(video, {
        left,
        top,
        width: Math.min(1 - left, FRAME.width + MARGIN * 2),
        height: Math.min(1 - top, FRAME.height + MARGIN * 2),
      })
      onPhoto(blob)
    } catch {
      setCapturing(false)
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onPhoto(file)
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

  // Kader: groot (past een menukaart in), of strak om een gevonden barcode heen.
  const PAD = 0.04
  const frame = seen
    ? {
        left: `${Math.max(0, seen.left - PAD) * 100}%`,
        top: `${Math.max(0, seen.top - PAD) * 100}%`,
        width: `${Math.min(1, seen.width + PAD * 2) * 100}%`,
        height: `${Math.min(1, seen.height + PAD * 2) * 100}%`,
      }
    : {
        left: `${FRAME.left * 100}%`,
        top: `${FRAME.top * 100}%`,
        width: `${FRAME.width * 100}%`,
        height: `${FRAME.height * 100}%`,
      }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <header className="relative flex h-14 shrink-0 items-end justify-center pb-2 pt-[env(safe-area-inset-top)]">
        <button
          onClick={onMenu}
          className="absolute bottom-1 left-2 rounded-full p-2 active:bg-white/10"
          aria-label="Menu openen"
        >
          <Menu size={26} />
        </button>
        <h1 className="text-[19px] font-semibold">Glutenscanner</h1>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />

        {/* Het kader beweegt soepel van groot naar om de barcode heen; de schaduw dimt de rest. */}
        <div
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

        <div className="absolute inset-x-0 bottom-9 flex flex-col items-center gap-3 px-4">
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

          <div className="mt-1 grid w-full max-w-xs grid-cols-3 items-center">
            <span className="justify-self-start">{torchButton}</span>
            <div className="relative justify-self-center">
              <button
                onClick={snapshot}
                disabled={!ready || capturing}
                className="block rounded-full border-[5px] border-white p-1 disabled:opacity-40"
                aria-label="Foto maken van etiket of menukaart"
              >
                <span className="block h-[68px] w-[68px] rounded-full bg-white transition-transform active:scale-90" />
              </button>
              {/* Klein woordje zoals 'FOTO' in de iPhone-camera; een barcode gaat vanzelf. */}
              <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-white/70">
                Etiket of menu
              </span>
            </div>
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
