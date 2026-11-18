import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Languages,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GUIDE } from '../../data/glutenGuide'
import { INGREDIENT_TABS } from '../../data/ingredientGuide'
import { PANELS, type PanelId } from './panels'
import { Phone, ScreenDanger, ScreenGuide, ScreenMenu, ScreenPhoto, ScreenSafe, ScreenScanner, ScreenTravel } from './PhoneScreens'

const FEATURES: [LucideIcon, string, string][] = [
  [UtensilsCrossed, 'Menukaart', 'Herkent sauzen, croutons, paneermeel, sojasaus en frituur, en geeft je vragen voor de bediening.'],
  [Languages, '11 talen', 'Trigo, frumento, Weizen of hvete: buitenlandse etiketten worden vertaald naar wat het is.'],
  [ShieldCheck, 'Jouw profiel', 'Strikte coeliakie of gevoelig: jij bepaalt of sporen rood of oranje zijn.'],
  [BookOpen, 'Glutengids', 'Waar gluten schuilen, van kerststol tot bouillonblokje, met glutenvrije alternatieven.'],
  [Clock3, 'Geschiedenis', 'Al je scans bij elkaar, te filteren op glutenvrij, twijfel of bevat gluten.'],
  [Lock, 'Privé', 'Geen account, geen tracking. Je foto’s en geschiedenis blijven op je telefoon.'],
]

const CAROUSEL: { word: string; line: string; dark: boolean; bg: string; screen: ReactNode }[] = [
  { word: 'Scan', line: 'elk product in seconden', dark: false, bg: 'bg-accent', screen: <ScreenScanner /> },
  { word: 'Spot', line: 'verborgen gluten', dark: false, bg: 'bg-[#14130f] ring-1 ring-white/10', screen: <ScreenPhoto /> },
  { word: 'Weet', line: 'of het veilig is', dark: true, bg: 'bg-[#7ee2a8]', screen: <ScreenSafe /> },
  { word: 'Zie', line: 'wat er wél in zit', dark: false, bg: 'bg-[#ff5a4e]', screen: <ScreenDanger /> },
  { word: 'Vraag', line: 'het restaurant', dark: true, bg: 'bg-[#ffd75e]', screen: <ScreenMenu /> },
  { word: 'Leer', line: 'waar gluten schuilen', dark: false, bg: 'bg-[#1d4d35]', screen: <ScreenGuide /> },
  { word: 'Reis', line: 'zonder zorgen', dark: false, bg: 'bg-[#3b6fd8]', screen: <ScreenTravel /> },
]

const FAQ = [
  {
    q: 'Is het echt gratis?',
    a: 'Ja. Geen proefperiode, geen abonnement en geen account. Alle functies zijn voor iedereen.',
  },
  {
    q: 'Moet ik een app downloaden?',
    a: 'Nee. Open glutenscanner.nl op je telefoon en de scanner start direct. Wil je een icoon? Tik op "Deel" en dan "Zet op beginscherm".',
  },
  {
    q: 'Worden mijn foto’s geüpload?',
    a: 'Nee. De tekst wordt op je eigen telefoon gelezen. Alleen bij een barcode zoeken we het product op in Open Food Facts.',
  },
  {
    q: 'Werkt het in het buitenland?',
    a: 'Ja. De scanner herkent glutenwoorden in 11 talen en zegt in het Nederlands wat het is. Met de reiskaart leg je coeliakie uit aan de bediening, in 10 talen.',
  },
  {
    q: 'Kan ik er blind op vertrouwen?',
    a: 'Nee, het is een tweede blik, geen medisch advies. Bij twijfel kiest de scanner altijd de voorzichtige uitslag. Kijk altijd ook zelf op de verpakking.',
  },
]

function Features() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {FEATURES.map(([Icon, title, text]) => (
        <article key={title} className="rounded-[28px] bg-white/[0.06] p-6 ring-1 ring-white/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30">
            <Icon size={24} />
          </span>
          <h3 className="mt-4 font-display text-[22px] font-bold">{title}</h3>
          <p className="mt-1 text-[15px] leading-snug text-white/65">{text}</p>
        </article>
      ))}
    </div>
  )
}

function Carousel() {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 288, behavior: 'smooth' })
  return (
    <div>
      <div ref={track} className="flex snap-x snap-mandatory gap-6 overflow-x-auto [scrollbar-width:none]">
        {CAROUSEL.map(({ word, line, dark, bg, screen }) => (
          <article key={word} className={`flex h-[440px] w-[264px] shrink-0 snap-start flex-col items-center overflow-hidden rounded-[36px] pt-7 text-center ${bg}`}>
            <p className={`font-display text-[42px] font-extrabold uppercase leading-none ${dark ? 'text-[#14130f]' : 'text-white'}`}>{word}</p>
            <p className={`mt-1 px-4 font-display text-[17px] font-bold uppercase leading-tight ${dark ? 'text-[#14130f]/80' : 'text-[#ffd75e]'}`}>{line}</p>
            <div className="mt-5">
              <Phone>{screen}</Phone>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-3">
        {(
          [
            [-1, ArrowLeft, 'Vorige'],
            [1, ArrowRight, 'Volgende'],
          ] as const
        ).map(([dir, Icon, label]) => (
          <button
            key={label}
            onClick={() => scroll(dir)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent"
            aria-label={label}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </div>
  )
}

function Gids() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        {INGREDIENT_TABS.map((t) => {
          const high = t.entries.filter((e) => e.risk === 'hoog').length
          return (
            <article key={t.id} className="flex flex-col items-center rounded-[24px] bg-white/[0.06] p-5 text-center ring-1 ring-white/10">
              <h3 className="font-display text-[18px] font-bold leading-tight [overflow-wrap:anywhere]">{t.label}</h3>
              <p className="mt-1 text-[13px] text-white/55">
                {t.entries.length} ingrediënten{high > 0 && <> · <span className="text-[#ff8a80]">{high} hoog</span></>}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {t.entries.slice(0, 4).map((e) => (
                  <span
                    key={e.name}
                    className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
                      e.risk === 'hoog' ? 'bg-[#ff5a4e]/15 text-[#ff8a80]' : e.risk === 'middel' ? 'bg-[#ffd75e]/15 text-[#ffd75e]' : 'bg-[#7ee2a8]/15 text-[#7ee2a8]'
                    }`}
                  >
                    {e.name}
                  </span>
                ))}
              </div>
            </article>
          )
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-[15px] text-white/60">Plus tips over:</span>
        {GUIDE.map((c) => (
          <span key={c.id} className="rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold">
            {c.title}
          </span>
        ))}
        <span className="rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold">Reiskaart in 10 talen</span>
      </div>
      <p className="mt-5 text-center text-[15px] text-white/60">De volledige gids staat in de app, onder "Gids".</p>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="mx-auto max-w-3xl divide-y divide-white/10">
      {FAQ.map(({ q, a }, i) => (
        <div key={q}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 py-4 text-left font-display text-[19px] font-semibold"
          >
            {q}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${open === i ? 'bg-accent text-white' : 'bg-white/10 text-[#7ee2a8]'}`}>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </span>
          </button>
          {open === i && <p className="pb-5 pr-14 text-[16px] leading-relaxed text-white/70">{a}</p>}
        </div>
      ))}
    </div>
  )
}

const CONTENT: Record<PanelId, () => ReactNode> = {
  functies: Features,
  'in-actie': Carousel,
  gids: Gids,
  vragen: Faq,
}

/** Venster over de pagina: één klik open, Esc, klik ernaast of het kruisje sluit het. */
export function Panel({ id, onClose }: { id: PanelId; onClose: () => void }) {
  const { title } = PANELS.find((p) => p.id === id)!
  const Content = CONTENT[id]
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
    <div
      className="fixed inset-0 z-30 flex items-start justify-center bg-black/60 px-6 pb-6 pt-28 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-slide-up max-h-full w-full max-w-[1200px] overflow-y-auto rounded-[36px] bg-[#10140f] p-8 text-white shadow-2xl ring-1 ring-white/10"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-[36px] font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Sluiten">
            <X size={22} />
          </button>
        </div>
        <Content />
      </div>
    </div>
  )
}
