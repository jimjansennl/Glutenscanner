import { useEffect, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react'
import { Barcode, Camera, Images, Zap, ZapOff } from 'lucide-react'
import { useBarcodeScanner, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { BottomNav, type NavTab } from '../ui/BottomNav'

const CORNERS = [
  'left-3 top-3 border-l-4 border-t-4 rounded-tl-md',
  'right-3 top-3 border-r-4 border-t-4 rounded-tr-md',
  'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-md',
  'bottom-3 right-3 border-b-4 border-r-4 rounded-br-md',
]

interface Props {
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

export function ScannerView({ onNavigate, onCode, onPhoto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // Eén scherm voor alles: barcodes worden altijd vanzelf gelezen, de sluiterknop is voor etiket of menu.
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

        {/* Kader in het midden van het beeld, waar ook de barcodelezer kijkt; de schaduw dimt de rest. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-[3/2] w-[76%] max-w-md rounded-3xl border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
            {CORNERS.map((pos) => (
              <span key={pos} className={`absolute h-7 w-7 border-accent ${pos}`} />
            ))}
            {ready && (
              <span className="absolute inset-x-6 h-0.5 animate-scanline rounded-full bg-accent shadow-[0_0_12px_2px] shadow-accent" />
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 px-4">
          {error ? (
            <Pill className="bg-danger/90">{error}</Pill>
          ) : !ready ? (
            <Pill>Camera starten…</Pill>
          ) : (
            <p className="flex flex-col items-start gap-1 rounded-2xl bg-neutral-700/75 px-4 py-2.5 text-[15px] leading-snug backdrop-blur-xl">
              <span className="flex items-center gap-2">
                <Barcode size={18} className="shrink-0 text-accent" />
                Barcode: richt de camera erop.
              </span>
              <span className="flex items-center gap-2">
                <Camera size={18} className="shrink-0 text-accent" />
                Etiket of menu: maak een foto.
              </span>
            </p>
          )}

          <div className="mt-1 grid w-full max-w-xs grid-cols-3 items-center">
            <span className="justify-self-start">{torchButton}</span>
            <button
              onClick={snapshot}
              disabled={!ready}
              className="justify-self-center rounded-full border-[5px] border-white p-1 disabled:opacity-40"
              aria-label="Foto maken van etiket of menukaart"
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
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        </div>
      </div>

      <BottomNav active="scan" onSelect={onNavigate} />
    </div>
  )
}
