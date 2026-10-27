import { useState } from 'react'
import { Barcode, Camera, ChevronRight, Infinity as InfinityIcon, ScanBarcode, Search } from 'lucide-react'

interface Props {
  onScan: (mode: 'barcode' | 'photo') => void
  onBarcode: (barcode: string) => void
}

export function HomePage({ onScan, onBarcode }: Props) {
  const [code, setCode] = useState('')
  const validCode = /^\d{8,14}$/.test(code.trim())

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="px-1 pt-6">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">Glutenscanner</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[15px] text-muted">
          <InfinityIcon size={16} className="text-safe" />
          Gratis en onbeperkt scannen
        </p>
      </header>

      <button
        onClick={() => onScan('barcode')}
        className="group relative overflow-hidden rounded-[28px] bg-surface p-6 text-left active:scale-[0.98] transition-transform"
      >
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-safe/20 blur-3xl" aria-hidden />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-safe/15 ring-2 ring-safe shadow-[0_0_32px_-4px] shadow-safe/60">
          <ScanBarcode size={32} className="text-safe" />
        </span>
        <span className="relative mt-5 block text-2xl font-bold tracking-tight">Scan barcode</span>
        <span className="relative mt-1 block text-[15px] text-muted">EAN, UPC of QR-code. Direct resultaat.</span>
      </button>

      <button
        onClick={() => onScan('photo')}
        className="flex items-center gap-4 rounded-[22px] bg-surface p-4 text-left active:bg-surface-raised"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
          <Camera size={24} className="text-warning" />
        </span>
        <span className="flex-1">
          <span className="block text-[17px] font-semibold">Foto / Menu scan</span>
          <span className="block text-[13px] text-muted">Ingrediënten of menukaart fotograferen</span>
        </span>
        <ChevronRight className="text-muted" size={20} />
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (validCode) onBarcode(code.trim())
        }}
        className="flex items-center gap-2 rounded-[22px] bg-surface p-2 pl-4 focus-within:ring-2 focus-within:ring-safe"
      >
        <Barcode size={20} className="shrink-0 text-muted" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          placeholder="Barcode invoeren"
          className="min-w-0 flex-1 bg-transparent py-2 text-[17px] placeholder:text-muted focus:outline-none"
          aria-label="Barcode"
        />
        <button
          type="submit"
          disabled={!validCode}
          className="rounded-full bg-safe p-2.5 text-black disabled:bg-surface-raised disabled:text-muted"
          aria-label="Zoeken"
        >
          <Search size={20} />
        </button>
      </form>

      <section className="mt-auto grid grid-cols-3 gap-2 text-center text-[13px]">
        {[
          ['bg-safe', 'Glutenvrij'],
          ['bg-danger', 'Bevat gluten'],
          ['bg-warning', 'Twijfel'],
        ].map(([dot, label]) => (
          <span key={label} className="flex items-center justify-center gap-1.5 rounded-full bg-surface py-2 text-muted">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </section>
    </main>
  )
}
