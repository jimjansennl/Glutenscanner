import '@fontsource-variable/bricolage-grotesque'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plane,
  Languages,
  Minus,
  Plus,
  ScanBarcode,
  ScanText,
  ShieldCheck,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { GUIDE } from '../../data/glutenGuide'
import { INGREDIENT_TABS } from '../../data/ingredientGuide'
import { PANELS, type PanelId } from './panels'
import { Phone, ScreenDanger, ScreenGuide, ScreenMenu, ScreenPhoto, ScreenSafe, ScreenScanner, ScreenTravel } from './PhoneScreens'

const WAYS: [LucideIcon, string, string][] = [
  [ScanBarcode, 'Barcode', 'Kies Barcode en richt de camera op de streepjescode. Hij leest hem vanzelf.'],
  [ScanText, 'Etiket', 'Kies Foto en fotografeer de ingrediënten. Ook buitenlandse woorden, zoals trigo en Weizen.'],
  [Camera, 'Menukaart', 'Kies Foto en fotografeer het menu. Je ziet waar gluten in kunnen zitten en wat je kunt vragen.'],
]

const COLORS: [LucideIcon, string, string, string][] = [
  [CheckCircle2, 'Glutenvrij', 'Geen gluten gevonden', 'bg-[#7ee2a8]/15 text-[#7ee2a8] ring-[#7ee2a8]/25'],
  [AlertTriangle, 'Twijfel', 'Misschien gluten. Lees het etiket of vraag het na', 'bg-[#ffd75e]/15 text-[#ffd75e] ring-[#ffd75e]/25'],
  [XCircle, 'Bevat gluten', 'Gluten gevonden. Niet eten', 'bg-[#ff5a4e]/15 text-[#ff8a80] ring-[#ff5a4e]/25'],
]

const EXTRAS: [LucideIcon, string, string][] = [
  [Languages, '11 talen', 'Hij herkent glutenwoorden in 11 talen, zoals trigo en Weizen, en zegt in het Nederlands wat het is.'],
  [ShieldCheck, 'Jouw profiel', 'Jij kiest bij Instellingen of "kan sporen bevatten" rood of oranje wordt.'],
  [Clock3, 'Geschiedenis', 'Je laatste 15 scans terugzien, met filters.'],
  [Plane, 'Kaart voor de bediening', 'Laat in een restaurant zien dat je geen gluten mag, in 10 talen.'],
]

const CAROUSEL: { word: string; line: string; dark: boolean; bg: string; screen: ReactNode }[] = [
  { word: 'Scan', line: 'de barcode in seconden', dark: false, bg: 'bg-accent', screen: <ScreenScanner /> },
  { word: 'Spot', line: 'verborgen gluten', dark: false, bg: 'bg-[#14130f] ring-1 ring-white/10', screen: <ScreenPhoto /> },
  { word: 'Weet', line: 'of er gluten in zit', dark: true, bg: 'bg-[#7ee2a8]', screen: <ScreenSafe /> },
  { word: 'Zie', line: 'wat er wél in zit', dark: false, bg: 'bg-[#ff5a4e]', screen: <ScreenDanger /> },
  { word: 'Vraag', line: 'het restaurant', dark: true, bg: 'bg-[#ffd75e]', screen: <ScreenMenu /> },
  { word: 'Leer', line: 'waar gluten schuilen', dark: false, bg: 'bg-[#1d4d35]', screen: <ScreenGuide /> },
  { word: 'Reis', line: 'met een kaart in 10 talen', dark: false, bg: 'bg-[#3b6fd8]', screen: <ScreenTravel /> },
]

const FAQ = [
  {
    q: 'Is het echt gratis?',
    a: 'Ja. Geen proefperiode, geen abonnement en geen account. Alle functies zijn voor iedereen.',
  },
  {
    q: 'Moet ik een app downloaden?',
    a: 'Nee, je gebruikt hem gewoon in je browser. Wil je een icoon tussen je apps? iPhone: tik op "Deel" en dan "Zet op beginscherm". Android: tik op ⋮ en dan "Toevoegen aan startscherm".',
  },
  {
    q: 'Worden mijn foto’s geüpload?',
    a: 'Nee. De tekst wordt op je eigen telefoon gelezen. Alleen bij een barcode zoeken we het product op in Open Food Facts.',
  },
  {
    q: 'Werkt het in het buitenland?',
    a: 'Ja. De scanner herkent glutenwoorden in 11 talen en zegt in het Nederlands wat het is. Met de kaart voor de bediening leg je coeliakie uit aan de bediening, in 10 talen.',
  },
  {
    q: 'Kan ik er blind op vertrouwen?',
    a: 'Nee. Het is een tweede paar ogen, geen medisch advies. Vindt de app een product niet, dan krijg je twijfel, niet glutenvrij. Maar een foto kan een woord verkeerd lezen, en de database kan fouten bevatten. Kijk dus altijd zelf op de verpakking.',
  },
]

function Hoe() {
  return (
    <div className="flex flex-col gap-3">
      {WAYS.map(([Icon, title, text], i) => (
        <article key={title} className="flex items-start gap-4 rounded-[24px] bg-white/[0.06] p-5 ring-1 ring-white/10">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white">
            <Icon size={24} />
            <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd75e] font-display text-[13px] font-bold text-[#14130f]">
              {i + 1}
            </span>
          </span>
          <span>
            <h3 className="font-display text-[20px] font-bold">{title}</h3>
            <p className="mt-0.5 text-[15px] leading-snug text-white/70">{text}</p>
          </span>
        </article>
      ))}
      <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white/50">Wat betekent de kleur?</h3>
      {COLORS.map(([Icon, label, text, cls]) => (
        <div key={label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ${cls}`}>
          <Icon size={26} className="shrink-0" />
          <span className="leading-tight">
            <b className="block font-display text-[17px]">{label}</b>
            <span className="text-[14px] opacity-90">{text}</span>
          </span>
        </div>
      ))}
      <h3 className="mt-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white/50">Wat hij nog meer kan</h3>
      {EXTRAS.map(([Icon, title, text]) => (
        <div key={title} className="flex items-start gap-4 rounded-[24px] bg-white/[0.06] p-5 ring-1 ring-white/10">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#7ee2a8]">
            <Icon size={22} />
          </span>
          <span>
            <b className="block font-display text-[18px]">{title}</b>
            <span className="text-[15px] leading-snug text-white/70">{text}</span>
          </span>
        </div>
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

function Gids({ onOpenGuide }: { onOpenGuide: () => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {INGREDIENT_TABS.map((t) => {
          const high = t.entries.filter((e) => e.risk === 'hoog').length
          return (
            <article key={t.id} className="flex flex-col items-center rounded-[24px] bg-white/[0.06] p-5 text-center ring-1 ring-white/10">
              <h3 className="font-display text-[18px] font-bold leading-tight [overflow-wrap:anywhere]">{t.label}</h3>
              <p className="mt-1 text-[13px] text-white/55">
                {t.entries.length} ingrediënten{high > 0 && <> · <span className="text-[#ff8a80]">{high} met gluten</span></>}
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
        <span className="rounded-full bg-white/10 px-4 py-2 text-[14px] font-semibold">Kaart voor de bediening in 10 talen</span>
      </div>
      <button
        onClick={onOpenGuide}
        className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-display text-[17px] font-bold"
      >
        Open de volledige gids
        <ChevronRight size={20} />
      </button>
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
            className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-[18px] font-semibold"
          >
            {q}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${open === i ? 'bg-accent text-white' : 'bg-white/10 text-[#7ee2a8]'}`}>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </span>
          </button>
          {open === i && <p className="pb-5 pr-4 text-[16px] leading-relaxed text-white/70">{a}</p>}
        </div>
      ))}
    </div>
  )
}

/** Telefoonversie van de website: elk onderdeel als eigen scherm, net als in de app. */
export function InfoPanel({ id, onBack, onOpenGuide }: { id: PanelId; onBack: () => void; onOpenGuide: () => void }) {
  const { title } = PANELS.find((p) => p.id === id)!
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#10140f] text-white" role="dialog" aria-modal="true" aria-label={title}>
      <header className="sticky top-0 z-10 flex items-center gap-2 bg-[#10140f]/90 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <button onClick={onBack} className="rounded-full p-2 text-[#7ee2a8] active:bg-white/10" aria-label="Terug naar menu">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-display text-[24px] font-bold tracking-tight">{title}</h2>
      </header>
      <div className="px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
        {id === 'hoe' && <Hoe />}
        {id === 'in-actie' && <Carousel />}
        {id === 'gids' && <Gids onOpenGuide={onOpenGuide} />}
        {id === 'vragen' && <Faq />}
      </div>
    </div>
  )
}

/** Hamburgermenu op de telefoon met dezelfde onderdelen als de kop van de website. */
export function InfoMenu({ onSelect, onClose }: { onSelect: (id: PanelId) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="animate-slide-up fixed inset-0 z-50 flex flex-col bg-[#10140f] text-white" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-accent/25 blur-[110px]" />
      <header className="relative flex items-center justify-between px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-2xl bg-accent shadow-lg shadow-accent/30">
            <ScanBarcode size={21} />
          </span>
          <span className="font-display text-[21px] font-bold tracking-tight">glutenscanner</span>
        </span>
        <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 active:bg-white/20" aria-label="Menu sluiten">
          <X size={22} />
        </button>
      </header>
      <nav className="relative mt-6 flex flex-col px-3">
        {PANELS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex items-center justify-between rounded-2xl px-4 py-4 text-left font-display text-[28px] font-bold tracking-tight active:bg-white/10"
          >
            {label}
            <ChevronRight size={24} className="text-[#7ee2a8]" />
          </button>
        ))}
      </nav>
      <button
        onClick={onClose}
        className="relative mx-5 mb-[max(1.5rem,env(safe-area-inset-bottom))] mt-auto flex items-center justify-center gap-2 rounded-full bg-accent py-4 font-display text-[18px] font-bold shadow-xl shadow-accent/30"
      >
        <ScanBarcode size={22} />
        Terug naar de scanner
      </button>
    </div>
  )
}
