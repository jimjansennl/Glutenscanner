import { useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Check,
  CandyCane,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Croissant,
  Gift,
  Languages,
  Search,
  SearchCheck,
  Soup,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PageHeader } from '../components/ui/PageHeader'
import { GUIDE, type GuideCategory, type GuideItem, type RiskLevel } from '../data/glutenGuide'
import { INGREDIENT_TABS, RISK_INFO, type IngredientEntry } from '../data/ingredientGuide'
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

const SHORT_RISK: Record<RiskLevel, { label: string; badge: string }> = {
  hoog: { label: 'Hoog', badge: 'bg-danger text-white' },
  middel: { label: 'Let op', badge: 'bg-warning text-black' },
  laag: { label: 'Laag', badge: 'bg-safe text-black' },
}

/** Uitklapbare rij in de ingrediëntengids: naam, omschrijving en risicobadge. */
function IngredientRow({ entry, open, onToggle, tab }: { entry: IngredientEntry; open: boolean; onToggle: () => void; tab?: string }) {
  const risk = SHORT_RISK[entry.risk]
  const alternativesNeeded = !(entry.alternatives.length === 1 && entry.alternatives[0] === 'Geen alternatief nodig')
  return (
    <li className="border-b border-surface-line last:border-0">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 py-4 text-left active:opacity-70">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[19px] font-semibold leading-tight">{entry.name}</span>
          <span className="text-[15px] text-muted">
            {tab && <span className="text-accent">{tab} · </span>}
            {entry.summary}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${risk.badge}`}>{risk.label}</span>
          <ChevronDown size={20} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </span>
      </button>
      {open && (
        <div className="animate-slide-up flex flex-col gap-3 pb-5">
          {entry.note && <p className="text-[15px] leading-snug text-white/85">{entry.note}</p>}
          {alternativesNeeded ? (
            <section>
              <h4 className="text-[17px] font-semibold text-accent">Veilige alternatieven</h4>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {entry.alternatives.map((a) => (
                  <li key={a} className="flex items-center gap-3 text-[17px]">
                    <Check size={20} className="shrink-0 text-accent" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="flex items-center gap-3 text-[17px]">
              <Check size={20} className="shrink-0 text-accent" aria-hidden />
              Geen alternatief nodig: dit is veilig
            </p>
          )}
          <section>
            <h4 className="text-[15px] font-semibold text-muted">Risiconiveau</h4>
            <p className="mt-1.5 rounded-2xl bg-surface px-4 py-3 text-[15px] leading-snug text-white/70">{RISK_INFO[entry.risk]}</p>
          </section>
        </div>
      )}
    </li>
  )
}

/** De thema's (feestdagen, snoep, jus, desserts) als aparte pagina met accordeons. */
function ThemesView({ onBack }: { onBack: () => void }) {
  const [openCategory, setOpenCategory] = useState<string | null>(GUIDE[0]?.id ?? null)
  const [openItem, setOpenItem] = useState<string | null>(null)
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6">
      <PageHeader title="Thema's" onBack={onBack} className="-mx-4" />
      <p className="text-center text-[15px] text-muted">Waar gluten schuilen in feestgerechten, snacks, sauzen en desserts</p>
      {GUIDE.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          items={category.items}
          open={openCategory === category.id}
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

function LinkRow({ icon: Icon, title, sub, onClick }: { icon: LucideIcon; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 py-3 text-left active:opacity-70">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent">
        <Icon size={28} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[19px] font-semibold leading-tight">{title}</span>
        <span className="text-[15px] leading-snug text-muted">{sub}</span>
      </span>
      <ChevronRight size={22} className="shrink-0 text-muted" />
    </button>
  )
}

export function GuidePage({ onTravelCard }: { onTravelCard: () => void }) {
  const [view, setView] = useState<'main' | 'themes'>('main')
  const [tabId, setTabId] = useState(INGREDIENT_TABS[0].id)
  const [query, setQuery] = useState('')
  const [openEntry, setOpenEntry] = useState<string | null>(null)

  const q = normalize(query)
  const results = useMemo(
    () =>
      q
        ? INGREDIENT_TABS.flatMap((t) =>
            t.entries
              .filter((e) => normalize([e.name, e.summary, e.note ?? '', ...e.alternatives].join(' ')).includes(q))
              .map((e) => ({ tab: t, entry: e })),
          )
        : [],
    [q],
  )
  const themeHits = useMemo(
    () => (q ? GUIDE.flatMap((c) => c.items.filter((i) => normalize(`${i.name} ${i.where}`).includes(q))).length : 0),
    [q],
  )

  if (view === 'themes') return <ThemesView onBack={() => setView('main')} />

  const tab = INGREDIENT_TABS.find((t) => t.id === tabId)!
  const toggle = (key: string) => setOpenEntry((k) => (k === key ? null : key))

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
      <PageHeader title="Gids" className="-mx-4" />
      <h2 className="pb-2 pt-5 text-[34px] font-bold leading-tight tracking-tight">Glutengids</h2>

      <LinkRow icon={BookOpen} title="Feestdagen & thema's" sub="Waar gluten schuilen in feestgerechten, snacks en sauzen" onClick={() => setView('themes')} />
      <LinkRow icon={Languages} title="Restaurantkaarten" sub="Laat de bediening in hun eigen taal zien wat je nodig hebt" onClick={onTravelCard} />

      <label className="mt-4 flex items-center gap-2 rounded-full bg-surface px-4 py-3 focus-within:ring-2 focus-within:ring-accent">
        <Search size={18} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek een ingrediënt, bijv. mout"
          className="min-w-0 flex-1 bg-transparent text-[17px] placeholder:text-muted focus:outline-none"
          aria-label="Zoek in de glutengids"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted" aria-label="Zoekopdracht wissen">
            <X size={18} />
          </button>
        )}
      </label>

      {q ? (
        <section className="mt-4">
          <p className="text-[15px] text-muted">
            {results.length} {results.length === 1 ? 'ingrediënt' : 'ingrediënten'} gevonden
            {themeHits > 0 && (
              <>
                {' '}·{' '}
                <button onClick={() => setView('themes')} className="text-accent">
                  {themeHits} in thema&apos;s
                </button>
              </>
            )}
          </p>
          <ul>
            {results.map(({ tab: t, entry }) => {
              const key = `${t.id}/${entry.name}`
              return <IngredientRow key={key} entry={entry} tab={t.label} open={openEntry === key} onToggle={() => toggle(key)} />
            })}
          </ul>
        </section>
      ) : (
        <>
          <div className="sticky top-14 z-10 -mx-4 mt-4 bg-black/85 py-2 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" role="tablist" aria-label="Categorie">
              {INGREDIENT_TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={t.id === tabId}
                  onClick={() => {
                    setTabId(t.id)
                    setOpenEntry(null)
                  }}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-[17px] font-semibold transition-colors ${
                    t.id === tabId ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-snug text-muted">{tab.intro}</p>
          <ul className="mt-1">
            {tab.entries.map((entry) => {
              const key = `${tab.id}/${entry.name}`
              return <IngredientRow key={key} entry={entry} open={openEntry === key} onToggle={() => toggle(key)} />
            })}
          </ul>
        </>
      )}

      <p className="px-4 pt-6 text-center text-xs leading-relaxed text-muted/80">
        Algemene informatie; samenstellingen verschillen per merk en land. {DISCLAIMER_SHORT}
      </p>
    </main>
  )
}
