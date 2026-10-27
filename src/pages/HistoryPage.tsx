import { useState } from 'react'
import { History } from 'lucide-react'
import type { HistoryItem } from '../services/history'
import type { GlutenStatus } from '../types/product'

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
}

export function HistoryPage({ items, statusOf, onOpen, onClear }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const count = (f: Filter) => (f === 'all' ? items.length : items.filter((i) => statusOf(i) === f).length)
  const visible = filter === 'all' ? items : items.filter((i) => statusOf(i) === filter)

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="pt-4 text-center text-[34px] font-bold leading-tight tracking-tight">Historie</h1>

      <div className="sticky top-0 z-10 -mx-4 bg-black/80 px-4 py-2 backdrop-blur-xl">
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
          Historie wissen
        </button>
      )}
    </main>
  )
}
