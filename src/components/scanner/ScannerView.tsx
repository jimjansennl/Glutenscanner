import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import { Barcode, Camera, Images, Infinity as InfinityIcon, ScanBarcode, Sparkles, Zap, ZapOff } from 'lucide-react'
import { useBarcodeScanner, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { BottomNav, type NavTab } from '../ui/BottomNav'

export type ScanMode = 'barcode' | 'photo'

const CORNERS = [
  'left-3 top-3 border-l-4 border-t-4 rounded-tl-md',
  'right-3 top-3 border-r-4 border-t-4 rounded-tr-md',
  'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-md',
  'bottom-3 right-3 border-b-4 border-r-4 rounded-br-md',
]

interface Props {
  mode: ScanMode
  onModeChange: (mode: ScanMode) => void
  onNavigate: (tab: NavTab) => void
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

export function ScannerView({ mode, onModeChange, onNavigate, onCode, onPhoto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // Ook in fotomodus blijft barcode/QR-herkenning actief: een code in beeld wint altijd.
  const { error, ready } = useBarcodeScanner(videoRef, onCode)
  const torch = useTorch(videoRef, ready)

  function snapshot() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    navigator.vibrate?.(30)
    canvas.toBlob((blob) => blob && onPhoto(blob), 'image/jpeg', 0.92)
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onPhoto(file)
    e.target.value = ''
  }

  const torchButton = torch.supported && (
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
  )

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <header className="flex h-14 shrink-0 items-end justify-center pb-2 pt-[env(safe-area-inset-top)]">
        <h1 className="text-[19px] font-semibold">Glutenscanner</h1>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />

        {/* Kader; de grote box-shadow dimt alles eromheen. */}
        <div className={`pointer-events-none absolute inset-0 flex items-center justify-center pt-16 ${mode === 'photo' ? 'pb-56' : 'pb-28'}`}>
          {mode === 'barcode' ? (
            <div className="relative aspect-[3/2] w-[76%] rounded-3xl border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              {CORNERS.map((pos) => (
                <span key={pos} className={`absolute h-7 w-7 border-accent ${pos}`} />
              ))}
              {ready && (
                <span className="absolute inset-x-6 h-0.5 animate-scanline rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent" />
              )}
            </div>
          ) : (
            <div className="aspect-[6/5] max-h-full w-[86%] rounded-[32px] border-2 border-accent/80 shadow-[0_0_24px_2px_rgba(31,164,99,0.45),0_0_0_9999px_rgba(0,0,0,0.2)]" />
          )}
        </div>

        <div className="absolute inset-x-0 top-4 flex justify-center">
          <div className="flex rounded-full bg-neutral-700/75 p-1 backdrop-blur-xl" role="tablist" aria-label="Scanmodus">
            {(
              [
                ['photo', 'Foto', Camera],
                ['barcode', 'Barcode', ScanBarcode],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => onModeChange(id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[17px] font-semibold transition-colors ${
                  mode === id ? 'bg-accent text-white' : 'text-white/80'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 px-4">
          {error ? (
            <Pill className="bg-danger/90">{error}</Pill>
          ) : mode === 'barcode' ? (
            <>
              <Pill>
                <InfinityIcon size={18} className="text-accent" />
                Onbeperkt gratis scannen
              </Pill>
              <Pill>
                <Barcode size={18} className="text-accent" />
                {ready ? 'Richt de camera op de barcode.' : 'Camera starten…'}
              </Pill>
            </>
          ) : (
            <>
              <Pill>Richt op de ingrediëntenlijst of menukaart en tik op de sluiterknop</Pill>
              <Pill className="text-[15px]">
                <Sparkles size={18} />
                Tekstherkenning
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">Gratis</span>
              </Pill>
            </>
          )}

          {mode === 'photo' ? (
            <div className="mt-2 grid w-full max-w-xs grid-cols-3 items-center">
              <span className="justify-self-start">{torchButton}</span>
              <button
                onClick={snapshot}
                disabled={!ready}
                className="justify-self-center rounded-full border-[5px] border-white p-1 disabled:opacity-40"
                aria-label="Foto maken"
              >
                <span className="block h-[68px] w-[68px] rounded-full bg-white transition-transform active:scale-90" />
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-14 w-14 items-center justify-center justify-self-end rounded-full bg-neutral-800/80 backdrop-blur-xl active:bg-neutral-700"
                aria-label="Foto uit galerij kiezen"
              >
                <Images size={24} />
              </button>
            </div>
          ) : (
            torchButton && <div className="mt-1">{torchButton}</div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
      </div>

      <BottomNav active="scan" onSelect={onNavigate} />
    </div>
  )
}
