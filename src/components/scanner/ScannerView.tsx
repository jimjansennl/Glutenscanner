import { useRef, type ChangeEvent } from 'react'
import { Camera, ImageUp } from 'lucide-react'
import { useBarcodeScanner, type DecodedCode } from '../../hooks/useBarcodeScanner'
import { BottomNav, type NavTab } from '../ui/BottomNav'

export type ScanMode = 'barcode' | 'photo'

const MODES: Record<ScanMode, { hint: string; frame: string }> = {
  barcode: { hint: 'Richt op de barcode of QR-code', frame: 'aspect-[16/10] w-[82%]' },
  photo: { hint: 'Ingrediënten of menukaart in beeld, dan de sluiterknop', frame: 'aspect-[3/4] w-[80%]' },
}

const CORNERS = [
  'left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-[28px]',
  'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-[28px]',
  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[28px]',
  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[28px]',
]

interface Props {
  mode: ScanMode
  onNavigate: (tab: NavTab) => void
  onCode: (code: DecodedCode) => void
  onPhoto: (image: Blob) => void
}

export function ScannerView({ mode, onNavigate, onCode, onPhoto }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  // Ook in fotomodus blijft barcode/QR-herkenning actief: een code in beeld wint altijd.
  const { error, ready } = useBarcodeScanner(videoRef, onCode)
  const active = MODES[mode]

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

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />

      {/* Kader met donkere omgeving: de enorme box-shadow dimt alles buiten het kader. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-40">
        <div className={`relative rounded-[28px] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-300 ${active.frame}`}>
          {CORNERS.map((pos) => (
            <span key={pos} className={`absolute h-12 w-12 ${mode === 'barcode' ? 'border-safe' : 'border-warning'} ${pos}`} />
          ))}
          {ready && mode === 'barcode' && (
            <span className="absolute inset-x-5 h-0.5 animate-scanline rounded-full bg-safe shadow-[0_0_14px_3px] shadow-safe" />
          )}
        </div>
      </div>

      <header className="relative flex justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-black/50 px-4 py-1.5 text-[15px] font-semibold backdrop-blur-xl">
          {mode === 'barcode' ? 'Barcode scan' : 'Foto / Menu scan'}
        </span>
      </header>

      <div className="relative mt-auto flex flex-col items-center gap-5 px-4 pb-4 pt-10">
        {error ? (
          <p className="max-w-xs rounded-2xl bg-danger/90 px-4 py-3 text-center text-sm font-medium">{error}</p>
        ) : (
          <p className="rounded-full bg-black/50 px-4 py-2 text-center text-[15px] backdrop-blur-xl">
            {ready ? active.hint : 'Camera starten…'}
          </p>
        )}

        {mode === 'photo' && (
          <div className="grid w-full max-w-xs grid-cols-3 items-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="justify-self-start rounded-full bg-white/15 p-3.5 backdrop-blur-xl active:bg-white/25"
              aria-label="Foto uit galerij kiezen"
            >
              <ImageUp size={24} />
            </button>
            <button
              onClick={snapshot}
              disabled={!ready}
              className="justify-self-center rounded-full border-4 border-white p-1 disabled:opacity-40"
              aria-label="Foto maken voor tekstanalyse"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform active:scale-90">
                <Camera size={28} />
              </span>
            </button>
            <span />
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>

      <BottomNav active={mode} onSelect={onNavigate} />
    </div>
  )
}
