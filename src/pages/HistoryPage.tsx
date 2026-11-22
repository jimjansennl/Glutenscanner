import { useState } from 'react'
import { shareUrl } from '../services/shareList'
import { History, Star, ShieldCheck, Share2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import type { HistoryItem } from '../services/history'
import type { GlutenStatus, ScanResult } from '../types/product'

type Filter = 'all' | GlutenStatus

const FILTERS: { id: Filter; label: string; dot?: string }[] = [
  { id: 'all', label: 'Alles' },
  { id: 'safe', label: 'Glutenvrij', dot: 'bg-safe' },
  { id: 'danger', label: 'Bevat gluten', dot: 'bg-danger' },
  { id: 'warning', label: 'Twijfel', dot: 'bg-warning' },
]

const STATUS_LABEL: Record<GlutenStatus, { dot: string; label: string }> = {
  safe: { dot: 'bg-safe', label: 'Glutenvrij' },
  danger: { dot: 'bg-danger', label: 'Bevat gluten' },
  warning: { dot: 'bg-warning', label: 'Twijfel' },
}

const timeFormat = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

interface Props {
  items: HistoryItem[]
  /** Status volgens het actieve veiligheidsprofiel. */
  statusOf: (item: HistoryItem) => GlutenStatus
  onOpen: (item: HistoryItem) => void
  onClear: () => void
  /** Mijn vaste producten (met ster), met status volgens het profiel. */
  starred: { barcode: string; name: string; status: GlutenStatus; result: ScanResult; checked?: boolean }[]
  onOpenResult: (result: ScanResult) => void
}

/** De lijst delen met opa en oma, school of een vriendinnetje: één link, geen account. */
function ShareList({ starred }: { starred: Props['starred'] }) {
  const [open, setOpen] = useState(false)
  const [who, setWho] = useState('')
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = shareUrl({
      who: who.trim() || undefined,
      at: Date.now(),
      items: starred.map((p) => ({ name: p.name, brand: p.result.product?.brand, status: p.status, checked: p.checked })),
    })
    const text = who.trim() ? `Dit mag ${who.trim()} eten:` : 'Onze glutenvrije boodschappen:'
    try {
      if (navigator.share) await navigator.share({ title: 'Mijn vaste producten', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
      }
    } catch {
      // Delen afgebroken.
    }
  }
  if (!open)
    return (
      <div className="mb-3 flex justify-center">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold active:bg-white/20">
          <Share2 size={16} />
          Deel de lijst met opa, oma of school
        </button>
      </div>
    )
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-[22px] bg-surface p-4">
      <label className="text-[14px] text-muted" htmlFor="share-who">
        Voor wie is de lijst? (mag leeg)
      </label>
      <input
        id="share-who"
        value={who}
        onChange={(e) => setWho(e.target.value)}
        placeholder="Bijvoorbeeld je voornaam"
        maxLength={30}
        className="rounded-xl bg-surface-raised px-4 py-3 text-[17px] outline-none ring-accent focus:ring-2"
      />
      <button onClick={share} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[17px] font-bold text-black active:opacity-80">
        <Share2 size={18} />
        {copied ? 'Link gekopieerd!' : 'Deel de link'}
      </button>
      <p className="text-center text-[13px] text-muted">De ontvanger ziet een nette lijst. Er is geen app of account nodig.</p>
    </div>
  )
}

export function HistoryPage({ items, statusOf, onOpen, onClear, starred, onOpenResult }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const count = (f: Filter) => (f === 'all' ? items.length : items.filter((i) => statusOf(i) === f).length)
  const visible = filter === 'all' ? items : items.filter((i) => statusOf(i) === filter)

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6">
      <PageHeader title="Geschiedenis" className="-mx-4" />

      {/* Mijn vaste producten: wat je vaak koopt, in één oogopslag. */}
      {starred.length > 0 ? (
        <section>
          <h2 className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-warning">
            <Star size={14} fill="currentColor" />
            Mijn vaste producten
          </h2>
          <ShareList starred={starred} />
          <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
            {starred.map((p) => (
              <li key={p.barcode}>
                <button
                  onClick={() => onOpenResult(p.result)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-raised"
                >
                  <span className={`h-3 w-3 shrink-0 rounded-full ${STATUS_LABEL[p.status].dot}`} />
                  <span className="min-w-0 flex-1 truncate text-[17px]">{p.name}</span>
                  {p.checked && <ShieldCheck size={16} className="shrink-0 text-safe" aria-label="Zelf gecontroleerd" />}
                  <span className="shrink-0 text-[13px] text-muted">{STATUS_LABEL[p.status].label}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        items.some((i) => i.result.product) && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[13px] text-muted">
            <Star size={14} />
            Tik op de ster bij een product om het bij je vaste producten te zetten.
          </p>
        )
      )}

      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 bg-black/80 px-4 py-2 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1 rounded-[18px] bg-surface p-1" role="tablist" aria-label="Filter op status">
          {FILTERS.map(({ id, label, dot }) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`flex flex-col items-center gap-0.5 rounded-[14px] py-2 text-center transition-colors ${
                filter === id ? 'bg-white text-black' : 'text-white/80 active:bg-surface-raised'
              }`}
            >
              <span className="flex items-center gap-1 text-[15px] font-bold tabular-nums">
                {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                {count(id)}
              </span>
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center text-muted">
          <History size={40} strokeWidth={1.5} />
          <p className="text-[17px]">{items.length === 0 ? 'Nog geen scans' : 'Geen scans met deze status'}</p>
          {items.length === 0 && <p className="text-[13px]">Je scans verschijnen hier, alleen op dit toestel.</p>}
        </div>
      ) : (
        <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
          {visible.map((item) => {
            const status = STATUS_LABEL[statusOf(item)]
            return (
              <li key={item.id}>
                <button
                  onClick={() => onOpen(item)}
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
      )}

      {items.length > 0 && (
        <button onClick={onClear} className="self-center py-2 text-[15px] text-danger active:opacity-60">
          Geschiedenis wissen
        </button>
      )}
    </main>
  )
}
