import { useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Backpack,
  CandyCane,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Croissant,
  Gift,
  Languages,
  Lightbulb,
  Search,
  SearchCheck,
  ShoppingCart,
  Soup,
  Tag,
  TreePine,
  Wheat,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PageHeader } from '../components/ui/PageHeader'
import { GUIDE, type GuideCategory, type RiskLevel } from '../data/glutenGuide'
import { INGREDIENT_TABS, NATURALLY_GLUTEN_FREE, type IngredientEntry } from '../data/ingredientGuide'
import { normalize } from '../services/glutenParser'

/**
 * Glutengids als "Mag ik dit eten?": één zoekbalk met een groot, gekleurd antwoord,
 * drie kleurvakken (Nee / Let op / Mag) en thema's. Geschreven voor een kind van 12:
 * één woord als antwoord, één zin waarom, en wat je in plaats daarvan kunt nemen.
 */

const THEME_ICONS: Record<GuideCategory['icon'], LucideIcon> = {
  gift: Gift,
  candy: CandyCane,
  soup: Soup,
  croissant: Croissant,
  wheat: Wheat,
  search: SearchCheck,
  cart: ShoppingCart,
  tree: TreePine,
  school: Backpack,
  label: Tag,
}

const RISK_UI: Record<RiskLevel, { word: string; long: string; icon: LucideIcon; solid: string; soft: string; text: string }> = {
  hoog: { word: 'Nee', long: 'Bevat gluten', icon: XCircle, solid: 'bg-danger text-white', soft: 'bg-danger/15 ring-danger/40', text: 'text-danger' },
  middel: { word: 'Let op', long: 'Kan gluten bevatten', icon: AlertTriangle, solid: 'bg-warning text-black', soft: 'bg-warning/15 ring-warning/40', text: 'text-warning' },
  laag: { word: 'Mag', long: 'Glutenvrij', icon: CheckCircle2, solid: 'bg-safe text-black', soft: 'bg-safe/15 ring-safe/40', text: 'text-safe' },
}

const COLOR_ORDER: RiskLevel[] = ['hoog', 'middel', 'laag']
const SUGGESTIONS = ['Couscous', 'Haver', 'Sojasaus', 'Rijst', 'Pepernoten', 'Drop']

interface Item {
  key: string
  name: string
  risk: RiskLevel
  /** Eén of twee zinnen: waarom deze kleur. */
  why: string
  tip?: string
  instead: string[]
  group: string
  /** Hoort in de lijsten Nee / Let op / Mag (alleen eten, geen uitleg of situaties). */
  food: boolean
}

/** Thema's die over situaties of etiketten gaan, niet over eten: alleen zoeken en thema. */
const NOT_FOOD_THEMES = ['etiket', 'school']
const sortName = (a: Item, b: Item) => a.name.replace(/^\W+/, '').localeCompare(b.name.replace(/^\W+/, ''), 'nl')

function fromEntry(e: IngredientEntry, group: string): Item {
  return {
    key: `${group}/${e.name}`,
    name: e.name,
    risk: e.risk,
    why: e.note ? `${e.summary}. ${e.note}` : `${e.summary}.`,
    instead: e.alternatives.filter((a) => a !== 'Geen alternatief nodig'),
    group,
    food: true,
  }
}

const THEME_ITEMS: Record<string, Item[]> = Object.fromEntries(
  GUIDE.map((c) => [
    c.id,
    c.items.map((i) => ({
      key: `${c.id}/${i.name}`,
      name: i.name,
      risk: i.risk,
      why: i.where,
      tip: i.checklist[0],
      instead: i.alternatives.filter((a) => a !== 'Geen alternatief nodig'),
      group: c.title,
      food: !NOT_FOOD_THEMES.includes(c.id),
    })),
  ]),
)

/** Alles wat je kunt opzoeken, zonder dubbele namen (ingrediënten gaan voor). */
const ALL_ITEMS: Item[] = (() => {
  const seen = new Set<string>()
  const list = [
    ...INGREDIENT_TABS.flatMap((t) => t.entries.map((e) => fromEntry(e, t.label))),
    ...NATURALLY_GLUTEN_FREE.map((e) => fromEntry(e, 'Van nature glutenvrij')),
    ...Object.values(THEME_ITEMS).flat(),
  ]
  return list.filter((i) => {
    const k = normalize(i.name)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
})()

/** Beste treffers eerst: precies de naam, dan begint ermee, dan ergens in de naam, dan in de uitleg. */
function search(q: string): Item[] {
  const scored: [number, Item][] = []
  for (const item of ALL_ITEMS) {
    const name = normalize(item.name)
    let score = -1
    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.split(/[\s/&,()-]+/).some((w) => w.startsWith(q))) score = 2
    else if (name.includes(q)) score = 3
    else if (normalize(`${item.why} ${item.instead.join(' ')}`).includes(q)) score = 4
    if (score >= 0) scored.push([score, item])
  }
  return scored.sort((a, b) => a[0] - b[0] || sortName(a[1], b[1])).map(([, i]) => i)
}

function RiskPill({ risk, size = 'sm' }: { risk: RiskLevel; size?: 'sm' | 'lg' }) {
  const ui = RISK_UI[risk]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${ui.solid} ${
        size === 'lg' ? 'px-4 py-1.5 text-[17px]' : 'min-w-[64px] px-2.5 py-1 text-[13px]'
      }`}
    >
      {ui.word}
    </span>
  )
}

function Instead({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="text-[13px] font-bold uppercase tracking-wide text-safe">Neem liever</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((a) => (
          <span key={a} className="rounded-full bg-safe/15 px-3 py-1.5 text-[15px] font-medium text-white">
            {a}
          </span>
        ))}
      </div>
    </div>
  )
}

function Tip({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className="flex items-start gap-2 text-[15px] leading-snug text-white/80">
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#ffd75e]" aria-hidden />
      {text}
    </p>
  )
}

/** Het grote antwoord bovenaan bij zoeken. */
function AnswerCard({ item }: { item: Item }) {
  const ui = RISK_UI[item.risk]
  const Icon = ui.icon
  return (
    <article className={`animate-slide-up flex flex-col gap-3 rounded-[28px] p-5 ring-2 ${ui.soft}`}>
      <div className="flex items-center gap-3">
        <Icon size={40} className={`shrink-0 ${ui.text}`} />
        <div className="min-w-0">
          <p className={`text-[28px] font-extrabold leading-none ${ui.text}`}>{ui.word}</p>
          <p className="mt-1 text-[15px] font-semibold text-white/70">{ui.long}</p>
        </div>
      </div>
      <h3 className="text-[24px] font-bold leading-tight">{item.name}</h3>
      <p className="text-[17px] leading-snug text-white/85">{item.why}</p>
      <Tip text={item.tip} />
      <Instead items={item.instead} />
    </article>
  )
}

/** Compacte rij die openklapt: kleur, naam, één regel uitleg. */
function ItemRow({ item, open, onToggle, showGroup }: { item: Item; open: boolean; onToggle: () => void; showGroup?: boolean }) {
  return (
    <li className="border-b border-surface-line last:border-0">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 py-3.5 text-left active:opacity-70">
        <RiskPill risk={item.risk} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[17px] font-semibold leading-tight">{item.name}</span>
          {!open && (
            <span className="truncate text-[14px] text-muted">
              {showGroup && <span className="text-accent">{item.group} · </span>}
              {item.why}
            </span>
          )}
        </span>
        <ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="animate-slide-up flex flex-col gap-3 pb-4 pl-[76px]">
          <p className="text-[16px] leading-snug text-white/85">{item.why}</p>
          <Tip text={item.tip} />
          <Instead items={item.instead} />
        </div>
      )}
    </li>
  )
}

function ItemList({ items, showGroup }: { items: Item[]; showGroup?: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul>
      {items.map((item) => (
        <ItemRow
          key={item.key}
          item={item}
          showGroup={showGroup}
          open={open === item.key}
          onToggle={() => setOpen((k) => (k === item.key ? null : item.key))}
        />
      ))}
    </ul>
  )
}

type View = { kind: 'home' } | { kind: 'color'; risk: RiskLevel } | { kind: 'theme'; id: string }

function SubPage({ title, sub, onBack, children }: { title: string; sub?: string; onBack: () => void; children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
      <PageHeader title={title} onBack={onBack} className="-mx-4" />
      {sub && <p className="pt-4 text-[15px] leading-snug text-muted">{sub}</p>}
      {children}
      <p className="px-4 pt-6 text-center text-xs leading-relaxed text-muted/80">
        Merken en recepten verschillen. {DISCLAIMER_SHORT}
      </p>
    </main>
  )
}

export function GuidePage({ onTravelCard }: { onTravelCard: () => void }) {
  const [view, setView] = useState<View>({ kind: 'home' })
  const [query, setQuery] = useState('')
  const q = normalize(query.trim())
  const results = useMemo(() => (q.length >= 2 ? search(q) : []), [q])

  if (view.kind === 'color') {
    const ui = RISK_UI[view.risk]
    const items = ALL_ITEMS.filter((i) => i.food && i.risk === view.risk).sort(sortName)
    return (
      <SubPage
        title={`${ui.word}: ${ui.long.toLowerCase()}`}
        sub={
          view.risk === 'laag'
            ? 'Dit mag je eten. Let wel op hoe het klaargemaakt is.'
            : view.risk === 'middel'
              ? 'Hangt af van het merk of hoe het gemaakt is. Kijk op het etiket of vraag het na.'
              : 'Hier zit gluten in. Niet eten, behalve als er "glutenvrij" op staat.'
        }
        onBack={() => setView({ kind: 'home' })}
      >
        <div className="mt-2">
          <ItemList items={items} showGroup />
        </div>
      </SubPage>
    )
  }

  if (view.kind === 'theme') {
    const cat = GUIDE.find((c) => c.id === view.id)!
    return (
      <SubPage title={cat.title} sub={cat.subtitle} onBack={() => setView({ kind: 'home' })}>
        <div className="mt-2">
          <ItemList items={THEME_ITEMS[cat.id]} />
        </div>
      </SubPage>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-6">
      <PageHeader title="Gids" className="-mx-4" />

      <h2 className="pt-5 text-[32px] font-extrabold leading-tight tracking-tight">Mag ik dit eten?</h2>
      <label className="mt-3 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3.5 ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-accent">
        <Search size={20} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Typ een product, bijv. couscous"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent text-[18px] placeholder:text-muted focus:outline-none"
          aria-label="Zoek een product of ingrediënt"
        />
        {query && (
          <button onClick={() => setQuery('')} className="rounded-full p-1 text-muted active:bg-white/10" aria-label="Wissen">
            <X size={20} />
          </button>
        )}
      </label>

      {q.length >= 2 ? (
        <section className="mt-4 flex flex-col gap-4">
          {results.length === 0 ? (
            <div className="rounded-[28px] bg-surface p-5 text-center">
              <p className="text-[18px] font-bold">Niet gevonden</p>
              <p className="mt-1 text-[15px] leading-snug text-muted">
                Probeer een ander woord. Of scan het etiket: de app leest dan zelf de ingrediënten.
              </p>
            </div>
          ) : (
            <>
              <AnswerCard item={results[0]} />
              {results.length > 1 && (
                <div>
                  <p className="text-[13px] font-bold uppercase tracking-wide text-muted">Ook gevonden</p>
                  <ItemList items={results.slice(1, 12)} showGroup />
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full bg-surface px-3.5 py-1.5 text-[15px] text-white/80 ring-1 ring-white/10 active:bg-surface-raised"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {COLOR_ORDER.map((risk) => {
              const ui = RISK_UI[risk]
              const Icon = ui.icon
              const count = ALL_ITEMS.filter((i) => i.food && i.risk === risk).length
              return (
                <button
                  key={risk}
                  onClick={() => setView({ kind: 'color', risk })}
                  className={`flex flex-col items-center gap-1 rounded-[22px] px-2 py-4 text-center ring-2 active:scale-95 ${ui.soft}`}
                >
                  <Icon size={30} className={ui.text} />
                  <span className={`text-[20px] font-extrabold leading-none ${ui.text}`}>{ui.word}</span>
                  <span className="text-[12px] leading-tight text-white/70">{ui.long}</span>
                  <span className="mt-1 text-[12px] font-semibold text-white/50">{count} dingen</span>
                </button>
              )
            })}
          </div>

          <h3 className="mt-7 text-[13px] font-bold uppercase tracking-wide text-muted">Thema&apos;s</h3>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {GUIDE.map((c) => {
              const Icon = THEME_ICONS[c.icon]
              return (
                <button
                  key={c.id}
                  onClick={() => setView({ kind: 'theme', id: c.id })}
                  className="flex items-center gap-3 rounded-[20px] bg-surface p-3.5 text-left active:bg-surface-raised"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent">
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 text-[16px] font-semibold leading-tight">{c.title}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={onTravelCard}
            className="mt-6 flex items-center gap-4 rounded-[22px] bg-surface p-4 text-left active:bg-surface-raised"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3b6fd8]">
              <Languages size={24} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[17px] font-semibold leading-tight">Reiskaart in 10 talen</span>
              <span className="text-[14px] leading-snug text-muted">Laat in het buitenland zien dat je geen gluten mag</span>
            </span>
            <ChevronRight size={22} className="shrink-0 text-muted" />
          </button>
        </>
      )}

      <p className="px-4 pt-6 text-center text-xs leading-relaxed text-muted/80">Merken en recepten verschillen. {DISCLAIMER_SHORT}</p>
    </main>
  )
}
