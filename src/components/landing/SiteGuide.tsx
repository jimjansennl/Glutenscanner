import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import type { RiskLevel } from '../../data/glutenGuide'
import { ALL_ITEMS, COLOR_ORDER, countFood, search, sortName } from '../../data/guideItems'
import { normalize } from '../../services/glutenParser'
import { AnswerCard, ItemList } from '../guide/GuideBits'
import { RISK_UI } from '../guide/guideUi'

/**
 * Websiteversie van de Glutengids: bewust alleen zoeken, plus de drie vakken Nee / Let op /
 * Mag (die openen een lijst). Bladeren (thema's, per soort, kaart voor de bediening, feestelijk
 * eten) doe je in de app op je telefoon: op de desktop was dat te druk en niet nodig.
 */

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

/** Woorden waar je niet meteen aan denkt: een tik vult de zoekbalk. Geen kleur, dan blijft het een verrassing. */
const TRY_WORDS = ['Sojasaus', 'Drop', 'Haver', 'Patat', 'Spelt', 'Boekweit', 'Bouillon', 'Quinoa']

function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-white/50">{children}</h3>
}

export function SiteGuide() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [panel, setPanel] = useState<RiskLevel | null>(null)
  const q = normalize(query.trim())
  const results = useMemo(() => (q.length >= 2 ? search(q) : []), [q])

  return (
    <section className="bg-[#10140f] px-4 pb-16 text-white lg:px-6 lg:pb-24">
      {panel && (
        <Modal
          title={`${RISK_UI[panel].word}: ${RISK_UI[panel].long.toLowerCase()}`}
          sub={COLOR_SUB[panel]}
          onClose={() => setPanel(null)}
        >
          <ItemList items={ALL_ITEMS.filter((i) => i.food && i.risk === panel).sort(sortName)} showGroup />
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

        <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[14px] text-white/50 lg:text-[15px]">Probeer eens:</span>
          {TRY_WORDS.map((w) => (
            <button
              key={w}
              onClick={() => setQuery(w)}
              className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold ring-1 transition lg:text-[15px] ${
                normalize(w) === q ? 'bg-white text-black ring-white' : 'bg-white/[0.06] text-white/80 ring-white/10 hover:bg-white/[0.12] hover:text-white'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {q.length >= 2 ? (
          <div className="mx-auto mt-8 max-w-5xl">
            {results.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-[28px] bg-white/[0.06] p-8 text-center">
                <p className="text-[20px] font-bold">Niet gevonden</p>
                <p className="mt-1 text-[16px] text-white/60">Probeer een ander woord, of scan het etiket met de app.</p>
              </div>
            ) : (
              // Onder elkaar: eerst het antwoord, daaronder wat er nog meer gevonden is.
              <div className="mx-auto flex max-w-2xl flex-col gap-8">
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
                    onClick={() => setPanel(risk)}
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

            <p className="mt-12 text-center text-[16px] text-white/55">
              Alles bladeren, zoals thema&apos;s en de Kaart voor de bediening? Dat kan in de app op je telefoon.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
