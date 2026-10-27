import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CandyCane,
  CheckCircle2,
  ChevronDown,
  Croissant,
  Gift,
  Search,
  SearchCheck,
  Soup,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { GUIDE, type GuideCategory, type GuideItem, type RiskLevel } from '../data/glutenGuide'
import { normalize } from '../services/glutenParser'

const ICONS: Record<GuideCategory['icon'], LucideIcon> = {
  gift: Gift,
  candy: CandyCane,
  soup: Soup,
  croissant: Croissant,
  wheat: Wheat,
  search: SearchCheck,
}

const RISK: Record<RiskLevel, { label: string; badge: string }> = {
  hoog: { label: 'Hoog risico', badge: 'bg-danger/15 text-danger' },
  middel: { label: 'Middel risico', badge: 'bg-warning/15 text-warning' },
  laag: { label: 'Laag risico', badge: 'bg-safe/15 text-safe' },
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${RISK[risk].badge}`}>{RISK[risk].label}</span>
}

function ItemDetails({ item }: { item: GuideItem }) {
  return (
    <div className="animate-slide-up flex flex-col gap-4 px-4 pb-4 text-center">
      <section>
        <h4 className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-muted">Waar gluten schuilen</h4>
        <p className="text-[15px] leading-snug text-white/85">{item.where}</p>
      </section>
      <section>
        <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted">Waarop letten</h4>
        <ul className="mx-auto flex w-fit max-w-full flex-col items-start gap-1.5">
          {item.checklist.map((c) => (
            <li key={c} className="flex max-w-full items-start gap-2 text-left text-[15px] leading-snug text-white/85">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden />
              {c}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-safe/10 p-3">
        <h4 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-safe">Glutenvrij alternatief</h4>
        <ul className="mx-auto flex w-fit max-w-full flex-col items-start gap-1.5">
          {item.alternatives.map((a) => (
            <li key={a} className="flex max-w-full items-start gap-2 text-left text-[15px] leading-snug text-white">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-safe" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function ItemRow({ item, open, onToggle }: { item: GuideItem; open: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="relative flex w-full flex-col items-center gap-1 px-10 py-3 text-center active:bg-white/5"
      >
        <span className="text-[17px] font-medium">{item.name}</span>
        <RiskBadge risk={item.risk} />
        <ChevronDown
          size={18}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && <ItemDetails item={item} />}
    </li>
  )
}

function CategoryCard({
  category,
  items,
  open,
  onToggle,
  openItem,
  onToggleItem,
}: {
  category: GuideCategory
  items: GuideItem[]
  open: boolean
  onToggle: () => void
  openItem: string | null
  onToggleItem: (key: string) => void
}) {
  const Icon = ICONS[category.icon]
  const high = items.filter((i) => i.risk === 'hoog').length
  return (
    <section className="overflow-hidden rounded-[22px] bg-surface">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="relative flex w-full flex-col items-center gap-1.5 px-10 py-4 text-center active:bg-surface-raised"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-safe/15">
          <Icon size={22} className="text-safe" />
        </span>
        <span className="text-[19px] font-semibold leading-tight">{category.title}</span>
        <span className="text-[13px] text-muted">
          {category.subtitle} · {items.length} items{high > 0 && ` · ${high} hoog risico`}
        </span>
        <ChevronDown
          size={20}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="divide-y divide-surface-line border-t border-surface-line">
          {items.map((item) => {
            const key = `${category.id}/${item.name}`
            return <ItemRow key={key} item={item} open={openItem === key} onToggle={() => onToggleItem(key)} />
          })}
        </ul>
      )}
    </section>
  )
}

export function GuidePage() {
  const [query, setQuery] = useState('')
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<string | null>(null)

  const q = normalize(query)
  const filtered = useMemo(
    () =>
      GUIDE.map((c) => ({
        category: c,
        items: q
          ? c.items.filter((i) => normalize([i.name, i.where, ...i.checklist, ...i.alternatives].join(' ')).includes(q))
          : c.items,
      })).filter((c) => c.items.length > 0),
    [q],
  )

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex flex-col items-center gap-1 pt-4 text-center">
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">Glutengids</h1>
        <p className="text-[15px] text-muted">Waar gluten schuilen en wat je wél kunt eten</p>
      </header>

      <label className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 focus-within:ring-2 focus-within:ring-safe">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek, bijv. jus, drop of haver"
          className="min-w-0 flex-1 bg-transparent text-center text-[17px] placeholder:text-muted focus:outline-none"
          aria-label="Zoek in de glutengids"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted" aria-label="Zoekopdracht wissen">
            <X size={18} />
          </button>
        )}
      </label>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-[15px] text-muted">Niets gevonden voor &quot;{query}&quot;.</p>
      )}

      {filtered.map(({ category, items }) => (
        <CategoryCard
          key={category.id}
          category={category}
          items={items}
          // Tijdens zoeken alle categorieën met resultaten openklappen.
          open={q ? true : openCategory === category.id}
          onToggle={() => setOpenCategory((c) => (c === category.id ? null : category.id))}
          openItem={openItem}
          onToggleItem={(key) => setOpenItem((k) => (k === key ? null : key))}
        />
      ))}

      <p className="px-4 pt-2 text-center text-xs leading-relaxed text-muted/80">
        Algemene informatie; samenstellingen verschillen per merk en land. {DISCLAIMER_SHORT}
      </p>
    </main>
  )
}
