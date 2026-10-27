import { useRef, useState, type ChangeEvent } from 'react'
import { Barcode, Camera, FileText, ImageUp, QrCode, X, type LucideIcon } from 'lucide-react'
import { useBarcodeScanner, type DecodedCode } from '../../hooks/useBarcodeScanner'

type Mode = 'barcode' | 'qr' | 'text'

const MODES: { id: Mode; label: string; icon: LucideIcon; hint: string; frame: string }[] = [
  {
    id: 'barcode',
    label: 'Barcode',
    icon: Barcode,
    hint: 'Richt op de streepjescode (EAN/UPC)',
    frame: 'aspect-[16/9] w-[82%]',
  },
  { id: 'qr', label: 'QR-code', icon: QrCode, hint: 'Houd de QR-code binnen het kader', frame: 'aspect-square w-[64%]' },
  {
    id: 'text',
    label: 'Tekst',
    icon: FileText,
    hint: 'Ingrediënten of menukaart in beeld en druk op de knop',
    frame: 'aspect-[3/4] w-[84%]',
  },
]

interface Props {
  onCode: (code: DecodedCode) => void
  onPhoto: (image: Blob) => void
  onClose: () => void
}

export function ScannerView({ onCode, onPhoto, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>('barcode')
  const { error, ready } = useBarcodeScanner(videoRef, onCode)
  const active = MODES.find((m) => m.id === mode)!

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
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-24">
        <div
          className={`relative rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all duration-300 ${active.frame}`}
        >
          {(['left-0 top-0 border-l-4 border-t-4 rounded-tl-3xl', 'right-0 top-0 border-r-4 border-t-4 rounded-tr-3xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-3xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-3xl',
          ] as const).map((pos) => (
            <span key={pos} className={`absolute h-10 w-10 border-white ${pos}`} />
          ))}
          {ready && mode !== 'text' && (
            <span className="absolute inset-x-4 h-0.5 animate-scanline rounded-full bg-brand-500 shadow-[0_0_12px_2px] shadow-brand-500" />
          )}
        </div>
      </div>

      <header className="relative flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-sm font-semibold backdrop-blur">Glutenscanner</span>
        <button
          onClick={onClose}
          className="rounded-full bg-black/40 p-2.5 backdrop-blur active:bg-black/60"
          aria-label="Scanner sluiten"
        >
          <X size={22} />
        </button>
      </header>

      <div className="relative mt-auto flex flex-col items-center gap-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-10">
        {error ? (
          <p className="max-w-xs rounded-2xl bg-red-600/90 px-4 py-3 text-center text-sm font-medium">{error}</p>
        ) : (
          <p className="text-center text-sm font-medium text-white/90">{ready ? active.hint : 'Camera starten…'}</p>
        )}

        <div className="flex rounded-full bg-white/10 p-1 backdrop-blur" role="tablist">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === id ? 'bg-white text-gray-900' : 'text-white/80'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid w-full max-w-xs grid-cols-3 items-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="justify-self-start rounded-full bg-white/10 p-3.5 backdrop-blur active:bg-white/20"
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
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-900 active:scale-95 active:bg-gray-200">
              <Camera size={28} />
            </span>
          </button>
          <span />
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
    </div>
  )
}
