import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, Languages, PartyPopper, Search, X } from 'lucide-react'
import { AnswerCard, ItemList, RiskBar } from '../components/guide/GuideBits'
import { RISK_UI, THEME_ICONS } from '../components/guide/guideUi'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PageHeader } from '../components/ui/PageHeader'
import { GUIDE, type RiskLevel } from '../data/glutenGuide'
import { ALL_ITEMS, COLOR_ORDER, FEAST_IDS, GROUPS, THEME_ITEMS, countFood, search, sortName } from '../data/guideItems'
import { normalize } from '../services/glutenParser'

/**
 * Glutengids als "Kan dit?": één zoekbalk met een groot, gekleurd antwoord,
 * drie kleurvakken (Nee / Let op / Mag) en thema's. Geschreven voor een kind van 12:
 * één woord als antwoord, één zin waarom, en wat je in plaats daarvan kunt nemen.
 */

type View = { kind: 'home' } | { kind: 'feast' } | { kind: 'color'; risk: RiskLevel } | { kind: 'theme'; id: string } | { kind: 'group'; id: string }

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
  const inputRef = useRef<HTMLInputElement>(null)
  const q = normalize(query.trim())
  const results = useMemo(() => (q.length >= 2 ? search(q) : []), [q])
  // Elk deel van de gids begint bovenaan.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

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

  if (view.kind === 'feast') {
    return (
      <SubPage title="Feestelijk eten" sub="Waar gluten schuilen bij kerst, borrels, snacks, sauzen en desserts." onBack={() => setView({ kind: 'home' })}>
        {GUIDE.filter((c) => FEAST_IDS.includes(c.id)).map((c) => {
          const Icon = THEME_ICONS[c.icon]
          return (
            <section key={c.id} className="mt-6">
              <h3 className="flex items-center gap-2.5 text-[20px] font-bold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                  <Icon size={19} />
                </span>
                {c.title}
              </h3>
              <ItemList items={THEME_ITEMS[c.id]} />
            </section>
          )
        })}
      </SubPage>
    )
  }

  if (view.kind === 'group') {
    const g = GROUPS.find((x) => x.id === view.id)!
    return (
      <SubPage title={g.label} sub={g.intro} onBack={() => setView({ kind: 'home' })}>
        <div className="mt-2">
          <ItemList items={g.items} />
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

      <h2 className="pt-5 text-center text-[32px] font-extrabold leading-tight tracking-tight">Kan dit?</h2>
      <label className="mt-4 flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-black focus-within:ring-4 focus-within:ring-accent/40">
        <Search size={20} className="shrink-0 text-neutral-500" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bijv. couscous"
          enterKeyHint="search"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-[17px] text-black placeholder:text-neutral-500 focus:outline-none"
          aria-label="Zoek een product of ingrediënt"
        />
        {query && (
          <button onClick={() => setQuery('')} className="rounded-full p-1 text-neutral-500 active:bg-black/5" aria-label="Wissen">
            <X size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={() => (query ? inputRef.current?.blur() : inputRef.current?.focus())}
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-[16px] font-semibold text-white active:scale-95"
        >
          Zoek
        </button>
      </label>

      {q.length >= 2 ? (
        <section className="mt-4 flex flex-col gap-4">
          {results.length === 0 ? (
            <div className="rounded-[28px] bg-surface p-5 text-center">
              <p className="text-[18px] font-bold">Dat ken ik nog niet</p>
              <p className="mt-1 text-[15px] leading-snug text-muted">
                Probeer een ander woord. Of scan het etiket: dan lees ik zelf de ingrediënten.
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
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {COLOR_ORDER.map((risk) => {
              const ui = RISK_UI[risk]
              const Icon = ui.icon
              const count = countFood(risk)
              return (
                <button
                  key={risk}
                  onClick={() => setView({ kind: 'color', risk })}
                  className="flex flex-col items-center gap-1 rounded-[22px] bg-surface px-2 py-4 text-center ring-1 ring-white/10 active:scale-95 active:bg-surface-raised"
                >
                  <Icon size={30} className={ui.text} />
                  <span className={`text-[20px] font-extrabold leading-none ${ui.text}`}>{ui.word}</span>
                  <span className="text-[12px] leading-tight text-white/70">{ui.long}</span>
                  <span className="mt-1 text-[12px] font-semibold text-white/50">{count} dingen</span>
                </button>
              )
            })}
          </div>

          <h3 className="mt-7 text-center text-[13px] font-bold uppercase tracking-wide text-muted">Thema&apos;s</h3>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {GUIDE.filter((c) => !FEAST_IDS.includes(c.id)).map((c) => {
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

          <h3 className="mt-7 text-center text-[13px] font-bold uppercase tracking-wide text-muted">Per soort</h3>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setView({ kind: 'group', id: g.id })}
                className="flex flex-col gap-2 rounded-[20px] bg-surface px-4 py-3.5 text-left active:bg-surface-raised"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[16px] font-semibold leading-tight">{g.label}</span>
                  <span className="shrink-0 text-[13px] text-muted">{g.items.length}</span>
                </span>
                <RiskBar items={g.items} />
              </button>
            ))}
          </div>

          <button
            onClick={onTravelCard}
            className="mt-6 flex items-center gap-4 rounded-[22px] bg-surface p-4 text-left active:bg-surface-raised"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3b6fd8]">
              <Languages size={24} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[17px] font-semibold leading-tight">Kaart voor de bediening</span>
              <span className="text-[14px] leading-snug text-muted">Laat in het restaurant zien dat je geen gluten mag, in 10 talen</span>
            </span>
            <ChevronRight size={22} className="shrink-0 text-muted" />
          </button>

          <button
            onClick={() => setView({ kind: 'feast' })}
            className="mt-2.5 flex items-center gap-4 rounded-[22px] bg-surface p-4 text-left active:bg-surface-raised"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff5a4e]">
              <PartyPopper size={24} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[17px] font-semibold leading-tight">Feestelijk eten</span>
              <span className="text-[14px] leading-snug text-muted">Kerst, borrel, snacks, sauzen en desserts</span>
            </span>
            <ChevronRight size={22} className="shrink-0 text-muted" />
          </button>
        </>
      )}

      <p className="px-4 pt-6 text-center text-xs leading-relaxed text-muted/80">Merken en recepten verschillen. {DISCLAIMER_SHORT}</p>
    </main>
  )
}
