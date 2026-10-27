import { useRef, useState, type ChangeEvent } from 'react'
import { Barcode, Camera, ChevronRight, FileText, QrCode, ScanBarcode, Search, ShieldCheck } from 'lucide-react'

interface Props {
  onScan: () => void
  onPhoto: (image: Blob) => void
  onBarcode: (barcode: string) => void
}

const SUPPORTED = [
  { icon: Barcode, label: 'EAN / UPC' },
  { icon: QrCode, label: 'QR-codes' },
  { icon: FileText, label: 'Etiket & menu' },
]

export function HomePage({ onScan, onPhoto, onBarcode }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const validCode = /^\d{8,14}$/.test(code.trim())

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onPhoto(file)
    e.target.value = ''
  }

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2">
        <span className="rounded-xl bg-brand-600 p-2 text-white">
          <ShieldCheck size={20} />
        </span>
        <span className="text-lg font-bold tracking-tight">Glutenscanner</span>
      </header>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-700 p-6 text-white shadow-xl shadow-brand-700/20">
        <ScanBarcode className="absolute -right-6 -top-6 text-white/10" size={160} aria-hidden />
        <h1 className="relative text-3xl font-extrabold leading-tight tracking-tight">
          Weet in één scan
          <br />
          of het glutenvrij is.
        </h1>
        <p className="relative mt-2 text-white/80">Barcode, QR-code of een foto van de ingrediënten.</p>
        <button
          onClick={onScan}
          className="relative mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-lg font-bold text-brand-700 shadow-lg active:scale-[0.98]"
        >
          <ScanBarcode size={24} />
          Start scannen
        </button>
      </section>

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 active:bg-gray-50"
      >
        <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
          <Camera size={22} />
        </span>
        <span className="flex-1">
          <span className="block font-semibold">Foto van etiket of menukaart</span>
          <span className="block text-sm text-gray-500">Analyseer ingrediënten en gerechten</span>
        </span>
        <ChevronRight className="text-gray-400" size={20} />
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (validCode) onBarcode(code.trim())
        }}
        className="flex items-center gap-2 rounded-2xl bg-white p-2 pl-4 shadow-sm ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-brand-500"
      >
        <Barcode size={20} className="shrink-0 text-gray-400" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          placeholder="Barcode handmatig invoeren"
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] focus:outline-none"
          aria-label="Barcode"
        />
        <button
          type="submit"
          disabled={!validCode}
          className="rounded-xl bg-brand-600 p-2.5 text-white disabled:bg-gray-200 disabled:text-gray-400"
          aria-label="Zoeken"
        >
          <Search size={20} />
        </button>
      </form>

      <ul className="mt-auto grid grid-cols-3 gap-2">
        {SUPPORTED.map(({ icon: Icon, label }) => (
          <li key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/60 py-3 text-xs font-medium text-gray-600">
            <Icon size={20} className="text-brand-600" />
            {label}
          </li>
        ))}
      </ul>
    </main>
  )
}
