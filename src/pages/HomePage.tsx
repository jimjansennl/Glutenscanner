import { useState, type ReactNode } from 'react'
import { Barcode, Camera, Infinity as InfinityIcon, Languages, ScanBarcode, Search } from 'lucide-react'
import type { HistoryItem } from '../services/history'
import type { GlutenStatus } from '../types/product'

interface Props {
  history: HistoryItem[]
  onScan: (mode: 'barcode' | 'photo') => void
  onBarcode: (barcode: string) => void
  onTravelCard: () => void
  onOpenHistory: (item: HistoryItem) => void
  onClearHistory: () => void
}

const STATUS_DOT: Record<GlutenStatus, { dot: string; label: string }> = {
  safe: { dot: 'bg-safe', label: 'Glutenvrij' },
  danger: { dot: 'bg-danger', label: 'Bevat gluten' },
  warning: { dot: 'bg-warning', label: 'Twijfel' },
}

const timeFormat = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function SecondaryCard({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-[22px] bg-surface p-4 text-center active:bg-surface-raised"
    >
      {icon}
      <span className="text-[17px] font-semibold leading-tight">{title}</span>
      <span className="text-[13px] leading-snug text-muted">{subtitle}</span>
    </button>
  )
}

export function HomePage({ history, onScan, onBarcode, onTravelCard, onOpenHistory, onClearHistory }: Props) {
  const [code, setCode] = useState('')
  const validCode = /^\d{8,14}$/.test(code.trim())

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex flex-col items-center gap-1 pt-6 text-center">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">Glutenscanner</h1>
        <p className="flex items-center gap-1.5 text-[15px] text-muted">
          <InfinityIcon size={16} className="text-safe" />
          Gratis en onbeperkt scannen
        </p>
      </header>

      <button
        onClick={() => onScan('barcode')}
        className="relative flex flex-col items-center overflow-hidden rounded-[28px] bg-surface px-6 py-7 text-center transition-transform active:scale-[0.98]"
      >
        <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 -translate-y-1/3 rounded-full bg-safe/20 blur-3xl" aria-hidden />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-safe/15 ring-2 ring-safe shadow-[0_0_32px_-4px] shadow-safe/60">
          <ScanBarcode size={38} className="text-safe" />
        </span>
        <span className="relative mt-5 text-2xl font-bold tracking-tight">Scan barcode</span>
        <span className="relative mt-1 text-[15px] text-muted">EAN, UPC of QR-code. Direct resultaat.</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <SecondaryCard
          onClick={() => onScan('photo')}
          icon={
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
              <Camera size={24} className="text-warning" />
            </span>
          }
          title="Foto / Menu"
          subtitle="Etiket of menukaart"
        />
        <SecondaryCard
          onClick={onTravelCard}
          icon={
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
              <Languages size={24} className="text-sky-400" />
            </span>
          }
          title="Reiskaart"
          subtitle="Uitleg voor de bediening, 7 talen"
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (validCode) onBarcode(code.trim())
        }}
        className="flex items-center gap-2 rounded-full bg-surface p-1.5 focus-within:ring-2 focus-within:ring-safe"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-muted">
          <Barcode size={20} />
        </span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          inputMode="numeric"
          placeholder="Barcode invoeren"
          className="min-w-0 flex-1 bg-transparent py-2 text-center text-[17px] placeholder:text-muted focus:outline-none"
          aria-label="Barcode"
        />
        <button
          type="submit"
          disabled={!validCode}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-safe text-black disabled:bg-surface-raised disabled:text-muted"
          aria-label="Zoeken"
        >
          <Search size={20} />
        </button>
      </form>

      {history.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-center text-[13px] font-medium uppercase tracking-wide text-muted">Recent gescand</h2>
          <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
            {history.slice(0, 5).map((item) => {
              const status = STATUS_DOT[item.result.analysis.status]
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onOpenHistory(item)}
                    className="flex w-full flex-col items-center gap-0.5 px-4 py-3 text-center active:bg-surface-raised"
                  >
                    <span className="max-w-full truncate text-[17px]">{item.title}</span>
                    <span className="flex items-center gap-1.5 text-[13px] text-muted">
                      <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                      {status.label} · {timeFormat.format(item.scannedAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <button onClick={onClearHistory} className="self-center py-1 text-[13px] text-muted active:text-white">
            Geschiedenis wissen
          </button>
        </section>
      )}

      <section className="mt-auto flex justify-center gap-2 pt-2 text-[13px]">
        {Object.values(STATUS_DOT).map(({ dot, label }) => (
          <span key={label} className="flex items-center justify-center gap-1.5 rounded-full bg-surface px-3 py-2 text-muted">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </section>
    </main>
  )
}
