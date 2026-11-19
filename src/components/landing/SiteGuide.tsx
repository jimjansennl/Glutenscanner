import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronRight, Languages, PartyPopper, Search, X } from 'lucide-react'
import { GUIDE, type RiskLevel } from '../../data/glutenGuide'
import { ALL_ITEMS, COLOR_ORDER, FEAST_IDS, GROUPS, THEME_ITEMS, countFood, search, sortName } from '../../data/guideItems'
import { BLOCK_STYLE, CARDS, type Lang } from '../../data/travelCards'
import { normalize } from '../../services/glutenParser'
import { AnswerCard, ItemList, RiskBar } from '../guide/GuideBits'
import { RISK_UI, THEME_ICONS } from '../guide/guideUi'

/**
 * Websiteversie van de Glutengids: dezelfde opbouw en inhoud als het tabblad Gids in de
 * app (zoeken, kleurvakken, thema's, per soort, kaart voor de bediening, feestelijk eten),
 * maar breed opgezet. Lijsten openen in een venster over de pagina.
 */

type Panel =
  | { kind: 'color'; risk: RiskLevel }
  | { kind: 'theme'; id: string }
  | { kind: 'group'; id: string }
  | { kind: 'feast' }
  | { kind: 'card' }

const COLOR_SUB: Record<RiskLevel, string> = {
  hoog: 'Hier zit gluten in. Niet eten, behalve als er "glutenvrij" op staat.',
  middel: 'Hangt af van het merk of hoe het gemaakt is. Kijk op het etiket of vraag het na.',
  laag: 'Dit mag je eten. Let wel op hoe het klaargemaakt is.',
}

function Modal({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/60 px-3 pb-3 pt-24 backdrop-blur-sm lg:px-6 lg:pb-6 lg:pt-28" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up max-h-full w-full max-w-3xl overflow-y-auto rounded-[32px] bg-[#16191a] p-5 text-white lg:p-8 shadow-2xl ring-1 ring-white/10"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-display text-[24px] font-bold leading-tight tracking-tight lg:text-[32px]">{title}</h2>
            {sub && <p className="mt-1 text-[16px] text-white/60">{sub}</p>}
          </div>
          <button onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Sluiten">
            <X size={22} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

function CardPreview() {
  const [lang, setLang] = useState<Lang>('es')
  const card = CARDS[lang]
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CARDS) as Lang[]).map((id) => (
          <button
            key={id}
            onClick={() => setLang(id)}
            className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] font-medium transition ${id === lang ? 'bg-accent text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'}`}
          >
            <span aria-hidden>{CARDS[id].flag}</span>
            {CARDS[id].name}
          </button>
        ))}
      </div>
      <article lang={lang} key={lang} className="animate-slide-up mt-5 flex flex-col gap-3 rounded-[24px] bg-white p-6 text-black">
        <h3 className="text-[26px] font-extrabold leading-tight">{card.title}</h3>
        <p className="text-[18px] font-semibold leading-snug">{card.intro}</p>
        {card.blocks.map(([head, text], i) => {
          const { icon: Icon, cls } = BLOCK_STYLE[i]
          return (
            <section key={head} className={`rounded-2xl p-4 ${cls}`}>
              <h4 className="flex items-center gap-2 text-[16px] font-bold">
                <Icon size={19} />
                {head}
              </h4>
              <p className="mt-1 text-[16px] leading-snug text-black/85">{text}</p>
            </section>
          )
        })}
        <p className="text-[16px] italic text-black/70">{card.close}</p>
      </article>
      <p className="mt-4 text-center text-[14px] text-white/55">
        Op je telefoon kiest de kaart op reis vanzelf de taal van het land, en kun je meelezen in het Nederlands.
      </p>
    </div>
  )
}

function PanelContent({ panel }: { panel: Panel }) {
  switch (panel.kind) {
    case 'color':
      return <ItemList items={ALL_ITEMS.filter((i) => i.food && i.risk === panel.risk).sort(sortName)} showGroup />
    case 'theme':
      return <ItemList items={THEME_ITEMS[panel.id]} />
    case 'group':
      return <ItemList items={GROUPS.find((g) => g.id === panel.id)!.items} />
    case 'feast':
      return (
        <>
          {GUIDE.filter((c) => FEAST_IDS.includes(c.id)).map((c) => {
            const Icon = THEME_ICONS[c.icon]
            return (
              <section key={c.id} className="mt-6 first:mt-2">
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
        </>
      )
    case 'card':
      return <CardPreview />
  }
}

function panelTitle(panel: Panel): [string, string?] {
  switch (panel.kind) {
    case 'color':
      return [`${RISK_UI[panel.risk].word}: ${RISK_UI[panel.risk].long.toLowerCase()}`, COLOR_SUB[panel.risk]]
    case 'theme': {
      const c = GUIDE.find((x) => x.id === panel.id)!
      return [c.title, c.subtitle]
    }
    case 'group': {
      const g = GROUPS.find((x) => x.id === panel.id)!
      return [g.label, g.intro]
    }
    case 'feast':
      return ['Feestelijk eten', 'Waar gluten schuilen bij kerst, borrels, snacks, sauzen en desserts.']
    case 'card':
      return ['Kaart voor de bediening', 'Laat in een restaurant zien dat je geen gluten mag. In 10 talen.']
  }
}

/** Eén tegelstijl voor het hele raster: even hoog, even rond, dezelfde rand. */
const TILE =
  'flex min-h-[76px] items-center gap-3 rounded-[20px] bg-white/[0.06] px-4 py-4 lg:px-5 text-left ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.09]'

function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white/50">{children}</h3>
}

function WideRow({ icon: Icon, color, title, sub, onClick }: { icon: typeof Languages; color: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-4 rounded-[20px] bg-white/[0.06] px-5 py-4 text-left ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.09]">
      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={26} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-[20px] font-bold leading-tight">{title}</span>
        <span className="text-[15px] text-white/60">{sub}</span>
      </span>
      <ChevronRight size={22} className="shrink-0 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
    </button>
  )
}

export function SiteGuide() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [panel, setPanel] = useState<Panel | null>(null)
  const q = normalize(query.trim())
  const results = useMemo(() => (q.length >= 2 ? search(q) : []), [q])
  const [title, sub] = panel ? panelTitle(panel) : ['']

  return (
    <section className="bg-[#10140f] px-4 pb-16 text-white lg:px-6 lg:pb-24">
      {panel && (
        <Modal title={title} sub={sub} onClose={() => setPanel(null)}>
          <PanelContent panel={panel} />
        </Modal>
      )}

      <div className="mx-auto max-w-6xl">
        <label className="mx-auto flex max-w-2xl items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 text-black lg:pl-7 shadow-2xl shadow-black/40 focus-within:ring-4 focus-within:ring-accent/40">
          <Search size={24} className="shrink-0 text-neutral-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={window.innerWidth < 640 ? 'Bijv. couscous' : 'Typ een product, bijv. couscous'}
            className="min-w-0 flex-1 bg-transparent py-2 text-[18px] lg:text-[20px] text-black placeholder:text-neutral-500 focus:outline-none"
            aria-label="Zoek een product of ingrediënt"
          />
          {query && (
            <button onClick={() => setQuery('')} className="rounded-full p-1.5 text-neutral-500 hover:bg-black/5" aria-label="Wissen">
              <X size={20} />
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="shrink-0 rounded-full bg-accent px-5 py-3 font-display text-[17px] font-bold lg:px-7 lg:py-3.5 lg:text-[18px] text-white transition hover:bg-[#1a9258]"
          >
            Zoek
          </button>
        </label>

        {q.length >= 2 ? (
          <div className="mx-auto mt-8 max-w-5xl">
            {results.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-[28px] bg-white/[0.06] p-8 text-center">
                <p className="text-[20px] font-bold">Niet gevonden</p>
                <p className="mt-1 text-[16px] text-white/60">Probeer een ander woord, of scan het etiket met de app.</p>
              </div>
            ) : (
              <div className={results.length > 1 ? 'grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_1fr]' : 'mx-auto max-w-xl'}>
                <AnswerCard item={results[0]} center />
                {results.length > 1 && (
                  <div>
                    <SectionLabel>Ook gevonden</SectionLabel>
                    <ItemList items={results.slice(1, 10)} showGroup />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-3 gap-2 lg:gap-5">
              {COLOR_ORDER.map((risk) => {
                const ui = RISK_UI[risk]
                const Icon = ui.icon
                return (
                  <button
                    key={risk}
                    onClick={() => setPanel({ kind: 'color', risk })}
                    className="flex flex-col items-center gap-1.5 rounded-[24px] bg-white/[0.06] px-2 py-5 text-center lg:rounded-[28px] lg:px-4 lg:py-7 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.09]"
                  >
                    <Icon size={34} className={ui.text} />
                    <span className={`font-display text-[24px] font-extrabold lg:text-[30px] leading-none ${ui.text}`}>{ui.word}</span>
                    <span className="text-[13px] leading-tight text-white/70 lg:text-[15px]">{ui.long}</span>
                    <span className="mt-1 text-[13px] font-semibold text-white/45 lg:text-[14px]">{countFood(risk)} dingen</span>
                  </button>
                )
              })}
            </div>

            <div className="mx-auto mt-14 max-w-6xl">
              <SectionLabel>Thema&apos;s</SectionLabel>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {GUIDE.filter((c) => !FEAST_IDS.includes(c.id)).map((c) => {
                  const Icon = THEME_ICONS[c.icon]
                  return (
                    <button
                      key={c.id}
                      onClick={() => setPanel({ kind: 'theme', id: c.id })}
                      className={TILE}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent">
                        <Icon size={22} />
                      </span>
                      <span className="font-display text-[17px] font-bold leading-tight">{c.title}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10">
                <SectionLabel>Per soort</SectionLabel>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {GROUPS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setPanel({ kind: 'group', id: g.id })}
                    className={`${TILE} flex-col !items-stretch !gap-3`}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-[17px] font-bold leading-tight">{g.label}</span>
                      <span className="text-[14px] text-white/45">{g.items.length}</span>
                    </span>
                    <RiskBar items={g.items} />
                  </button>
                ))}
              </div>

              <div className="mt-10">
                <SectionLabel>Ook handig</SectionLabel>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
                <WideRow
                  icon={Languages}
                  color="bg-[#3b6fd8]"
                  title="Kaart voor de bediening"
                  sub="Laat zien dat je geen gluten mag, in 10 talen"
                  onClick={() => setPanel({ kind: 'card' })}
                />
                <WideRow
                  icon={PartyPopper}
                  color="bg-[#ff5a4e]"
                  title="Feestelijk eten"
                  sub="Kerst, borrel, snacks, sauzen en desserts"
                  onClick={() => setPanel({ kind: 'feast' })}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
