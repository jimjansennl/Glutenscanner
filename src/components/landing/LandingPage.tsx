import '@fontsource-variable/bricolage-grotesque'
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  Heart,
  Infinity as InfinityIcon,
  Languages,
  Lock,
  Minus,
  Plus,
  ScanBarcode,
  ScanText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { GUIDE } from '../../data/glutenGuide'
import { INGREDIENT_TABS } from '../../data/ingredientGuide'
import { DISCLAIMER_SHORT } from '../ui/DisclaimerModal'
import {
  Phone,
  ScreenDanger,
  ScreenGuide,
  ScreenMenu,
  ScreenPhoto,
  ScreenSafe,
  ScreenScanner,
  ScreenTravel,
} from './PhoneScreens'

/**
 * Op de desktop is dit een informatiesite: de scanner heeft een telefooncamera nodig.
 * Elk menu-item is een eigen pagina met een eigen adres (/functies, /vragen, ...).
 * De knoppen "Op je telefoon" wijzen naar de QR-code op de startpagina.
 */
const PHONE_HREF = '/#telefoon'
/** Altijd het adres waarop de site nu open staat, zodat de QR-code en de tekst kloppen. */
const SITE_URL = window.location.origin
const SITE_LABEL = window.location.host.replace(/^www\./, '')
const YEAR = new Date().getFullYear()

const PAGES = [
  { path: '/hoe-het-werkt', label: 'Hoe het werkt' },
  { path: '/functies', label: 'Functies' },
  { path: '/in-actie', label: 'In actie' },
  { path: '/glutengids', label: 'Glutengids' },
  { path: '/vragen', label: 'Vragen' },
] as const

/* ---------- Eenvoudige router: echte adressen via de History API ---------- */

function subscribePath(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

function usePath() {
  return useSyncExternalStore(subscribePath, () => window.location.pathname)
}

/** Gaat naar een pagina (en eventueel een blok erop) zonder de site te herladen. */
function go(href: string) {
  const [path, hash] = href.split('#')
  if (path !== window.location.pathname || hash) {
    window.history.pushState(null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  requestAnimationFrame(() => {
    const target = hash ? document.getElementById(hash) : null
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo(0, 0)
  })
}

function Link({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    go(href)
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  )
}

/** Laat elementen met data-reveal zacht invliegen zodra ze in beeld komen. */
function useReveal(path: string) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            observer.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [path])
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30">
        <ScanBarcode size={21} />
      </span>
      <span className={`font-display text-[21px] font-bold tracking-tight ${light ? 'text-white' : 'text-[#14130f]'}`}>
        glutenscanner
      </span>
    </span>
  )
}

function QrCode({ size = 176 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const svg = new BrowserQRCodeSvgWriter().write(SITE_URL, size, size)
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', `QR-code naar ${SITE_LABEL}`)
    ref.current?.replaceChildren(svg)
  }, [size])
  return <div ref={ref} className="rounded-3xl bg-white p-3 shadow-xl" style={{ width: size + 24, height: size + 24 }} />
}

function PrimaryButton({ children, href = PHONE_HREF }: { children: ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-[18px] font-semibold text-white shadow-xl shadow-accent/30 transition hover:-translate-y-0.5 hover:bg-[#1a9258] hover:shadow-2xl hover:shadow-accent/40"
    >
      {children}
      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

function SectionTitle({ eyebrow, title, sub, light = false }: { eyebrow: string; title: ReactNode; sub?: string; light?: boolean }) {
  return (
    <div data-reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <span
        className={`rounded-full px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] ${
          light ? 'bg-white/10 text-[#7ee2a8]' : 'bg-accent/10 text-accent'
        }`}
      >
        {eyebrow}
      </span>
      <h2 className={`mt-5 font-display text-[52px] font-bold leading-[1.05] tracking-tight ${light ? 'text-white' : 'text-[#14130f]'}`}>
        {title}
      </h2>
      {sub && <p className={`mt-4 text-[19px] leading-relaxed ${light ? 'text-white/65' : 'text-neutral-600'}`}>{sub}</p>}
    </div>
  )
}

/** Zwevend labeltje rond de telefoons in de hero. */
function FloatChip({ className, children, tone = 'light' }: { className: string; children: ReactNode; tone?: 'light' | 'red' | 'green' }) {
  const toneCls = {
    light: 'bg-white text-[#14130f]',
    red: 'bg-[#ff5a4e] text-white',
    green: 'bg-accent text-white',
  }[tone]
  return (
    <span className={`absolute z-20 flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-[15px] font-semibold shadow-2xl ${toneCls} ${className}`}>
      {children}
    </span>
  )
}

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ScanBarcode, title: 'Richt je camera', text: 'Op een barcode, of maak een foto van de ingrediënten of de menukaart. Geen account nodig.' },
  { icon: Sparkles, title: 'Zie de uitslag', text: 'Glutenvrij, twijfel of bevat gluten: groot, in kleur en met uitleg waarom.' },
  { icon: ShieldCheck, title: 'Kijk zelf mee', text: 'De scanner is een tweede paar ogen. Kijk daarna altijd nog zelf op de verpakking.' },
]

const CAROUSEL: { word: string; line: string; accent: string; bg: string; screen: ReactNode }[] = [
  { word: 'Scan', line: 'de barcode in seconden', accent: 'text-[#ffd75e]', bg: 'bg-accent', screen: <ScreenScanner /> },
  { word: 'Spot', line: 'verborgen gluten', accent: 'text-[#ffd75e]', bg: 'bg-[#14130f]', screen: <ScreenPhoto /> },
  { word: 'Weet', line: 'of er gluten in zit', accent: 'text-[#14130f]', bg: 'bg-[#7ee2a8]', screen: <ScreenSafe /> },
  { word: 'Zie', line: 'wat er wél in zit', accent: 'text-white', bg: 'bg-[#ff5a4e]', screen: <ScreenDanger /> },
  { word: 'Vraag', line: 'het restaurant', accent: 'text-[#14130f]', bg: 'bg-[#ffd75e]', screen: <ScreenMenu /> },
  { word: 'Leer', line: 'waar gluten schuilen', accent: 'text-[#ffd75e]', bg: 'bg-[#1d4d35]', screen: <ScreenGuide /> },
  { word: 'Reis', line: 'met een kaart in 10 talen', accent: 'text-white', bg: 'bg-[#3b6fd8]', screen: <ScreenTravel /> },
]

const WAYS: { icon: LucideIcon; title: string; text: string; tip: string }[] = [
  {
    icon: ScanBarcode,
    title: 'Barcode',
    text: 'Kies Barcode en richt de camera op de streepjescode. Je hoeft niets te tikken: hij leest hem vanzelf.',
    tip: 'Niet elk product staat in de database. Dan krijg je twijfel.',
  },
  {
    icon: ScanText,
    title: 'Etiket',
    text: 'Kies Foto en fotografeer de lijst met ingrediënten. De scanner zoekt woorden als tarwe, gerst en mout.',
    tip: 'Ook buitenlandse woorden, zoals trigo en Weizen.',
  },
  {
    icon: Camera,
    title: 'Menukaart',
    text: 'Kies Foto en fotografeer het menu. Je ziet waar gluten in kunnen zitten, zoals saus of paneermeel, en wat je kunt vragen.',
    tip: 'Handig in een restaurant.',
  },
]

const COLORS: { icon: LucideIcon; label: string; text: string; cls: string }[] = [
  { icon: CheckCircle2, label: 'Glutenvrij', text: 'Geen gluten gevonden.', cls: 'bg-[#e3f6ea] text-[#137a46]' },
  { icon: AlertTriangle, label: 'Twijfel', text: 'Misschien gluten. Lees het etiket of vraag het na.', cls: 'bg-[#fff1d6] text-[#a35f00]' },
  { icon: XCircle, label: 'Bevat gluten', text: 'Gluten gevonden. Niet eten.', cls: 'bg-[#ffe3e0] text-[#c0281d]' },
]

const FEATURES = [
  [UtensilsCrossed, 'Menukaart-analyse', 'Herkent gebonden sauzen, croutons, paneermeel, sojasaus en gedeelde frituur, en geeft je vragen voor de bediening.', 'bg-white'],
  [Languages, '11 talen herkend', 'Trigo, frumento, Weizen of hvete: de scanner herkent glutenwoorden in 11 talen en zegt in het Nederlands wat het is.', 'bg-[#ffd75e]'],
  [ShieldCheck, 'Veiligheidsprofiel', 'Strikte coeliakie of gevoelig: jij bepaalt of sporen rood of oranje zijn.', 'bg-white'],
  [BookOpen, 'Glutengids', 'Waar gluten schuilen, van kerststol tot bouillonblokje, met glutenvrije alternatieven.', 'bg-white'],
  [Clock3, 'Scangeschiedenis', 'Je laatste 15 scans terugzien onder Geschiedenis. Filter op glutenvrij, twijfel of bevat gluten.', 'bg-[#7ee2a8]'],
  [Lock, 'Privé', 'Geen account en geen reclame. Je foto’s en geschiedenis blijven op je telefoon.', 'bg-white'],
] as const

const FAQ = [
  {
    q: 'Is Glutenscanner echt helemaal gratis?',
    a: 'Ja. Geen proefperiode, geen scanlimiet, geen abonnement en geen account. Alle functies zijn voor iedereen, altijd.',
  },
  {
    q: 'Moet ik een app downloaden?',
    a: `Nee. Open ${SITE_LABEL} op je telefoon en de scanner start direct. Wil je een icoon tussen je apps? iPhone: tik op "Deel" en dan "Zet op beginscherm". Android: tik op ⋮ en dan "Toevoegen aan startscherm".`,
  },
  {
    q: 'Worden mijn foto’s geüpload?',
    a: 'Nee. De tekstherkenning draait op je eigen telefoon. Alleen bij een barcodescan wordt de barcode opgezocht in de open database van Open Food Facts.',
  },
  {
    q: 'Werkt het in het buitenland?',
    a: 'Zeker. De scanner herkent glutentermen in 11 Europese talen en meldt ze in het Nederlands. Met de reiskaart leg je coeliakie uit aan de bediening, in 10 talen.',
  },
  {
    q: 'Kan ik er blind op vertrouwen?',
    a: 'Nee. Glutenscanner is een tweede paar ogen, geen medisch advies. Vindt de app een product niet, dan krijg je twijfel, niet glutenvrij. Maar een foto kan een woord verkeerd lezen, en de database kan fouten bevatten. Kijk dus altijd zelf op de verpakking.',
  },
]

function Carousel() {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 288, behavior: 'smooth' })
  return (
    <div data-reveal className="mt-14">
      {/* Precies vier kaarten breed (4 × 264 + 3 × 24 px), zodat niets half uit beeld valt. */}
      <div ref={track} className="mx-auto flex max-w-[1128px] snap-x snap-mandatory gap-6 overflow-x-auto pb-6 [scrollbar-width:none]">
        {CAROUSEL.map(({ word, line, accent, bg, screen }) => (
          <article
            key={word}
            className={`flex w-[264px] shrink-0 snap-start flex-col items-center overflow-hidden rounded-[36px] pt-8 text-center shadow-xl ${bg}`}
          >
            <p className={`font-display text-[46px] font-extrabold uppercase leading-none ${bg.includes('#7ee2a8') || bg.includes('#ffd75e') ? 'text-[#14130f]' : 'text-white'}`}>
              {word}
            </p>
            <p className={`mt-1 px-4 font-display text-[19px] font-bold uppercase leading-tight ${accent}`}>{line}</p>
            <div className="mt-6 -mb-28">
              <Phone>{screen}</Phone>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-3">
        {[
          [-1, ArrowLeft, 'Vorige'],
          [1, ArrowRight, 'Volgende'],
        ].map(([dir, Icon, label]) => {
          const I = Icon as LucideIcon
          return (
            <button
              key={label as string}
              onClick={() => scroll(dir as number)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white transition hover:border-accent hover:text-accent"
              aria-label={label as string}
            >
              <I size={20} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div data-reveal className="mx-auto mt-12 max-w-3xl divide-y divide-neutral-200 rounded-[32px] bg-white px-8 shadow-sm ring-1 ring-neutral-200">
      {FAQ.map(({ q, a }, i) => (
        <div key={q} className="py-2">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 py-4 text-left font-display text-[20px] font-semibold"
          >
            {q}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${open === i ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </span>
          </button>
          {open === i && <p className="pb-5 pr-14 text-[17px] leading-relaxed text-neutral-600">{a}</p>}
        </div>
      ))}
    </div>
  )
}

/* ---------- Pagina's ---------- */

/** Donkere band bovenaan elke pagina, in de stijl van het bovenstuk van de startpagina. */
function PageBand({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <section className="relative overflow-hidden bg-[#10140f] px-6 pb-20 pt-40 text-white">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative">
        <SectionTitle light eyebrow={eyebrow} title={title} sub={sub} />
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#10140f] pb-0 pt-32 text-white">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[500px] w-[600px] rounded-full bg-[#ffd75e]/15 blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[14px] font-medium text-white/85 backdrop-blur">
            <Heart size={15} className="fill-[#ff5a4e] text-[#ff5a4e]" />
            Gratis, voor iedereen met coeliakie of glutenintolerantie
          </span>
          <h1 className="mt-7 font-display text-[76px] font-extrabold leading-[0.98] tracking-tight">
            Eet met een
            <br />
            <span className="relative inline-block text-[#7ee2a8]">
              gerust hart
              <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 300 18" fill="none" aria-hidden>
                <path d="M3 13C60 4 140 2 297 9" stroke="#ffd75e" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-7 max-w-2xl text-[20px] leading-relaxed text-white/70">
            Scan een barcode, etiket of menukaart en zie binnen seconden of er gluten in zitten. Onbeperkt, zonder
            account, gewoon in je browser op <b className="text-white">{SITE_LABEL}</b>.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <PrimaryButton>Open op je telefoon</PrimaryButton>
          </div>
          <p className="mt-6 flex gap-6 text-[15px] text-white/55">
            {['Altijd gratis', 'Onbeperkt scannen', 'Geen account', 'Foto’s blijven op je toestel'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={15} className="text-[#7ee2a8]" />
                {t}
              </span>
            ))}
          </p>
        </div>

        {/* Drie telefoons in een waaier, met zwevende labels */}
        <div className="relative mx-auto mt-12 flex h-[470px] max-w-5xl items-start justify-center">
          <div className="absolute left-[14%] top-14 -rotate-[9deg] opacity-95">
            <Phone>
              <ScreenSafe />
            </Phone>
          </div>
          <div className="absolute right-[14%] top-14 rotate-[9deg] opacity-95">
            <Phone>
              <ScreenDanger />
            </Phone>
          </div>
          <div className="relative z-10 scale-[1.08]">
            <Phone className="shadow-[0_40px_120px_-20px_rgba(31,164,99,0.55)]">
              <ScreenScanner />
            </Phone>
          </div>
          <FloatChip className="left-[6%] top-6 animate-float" tone="green">
            <Check size={18} strokeWidth={3} /> Glutenvrij
          </FloatChip>
          <FloatChip className="right-[5%] top-2 animate-float-slow" tone="red">
            trigo → tarwe
          </FloatChip>
          <FloatChip className="left-[24%] top-[62%] animate-float-slow">
            <Sparkles size={16} className="text-accent" /> gerstemoutextract gevonden
          </FloatChip>
          <FloatChip className="right-[22%] top-[58%] animate-float">
            <InfinityIcon size={18} className="text-accent" /> onbeperkt gratis
          </FloatChip>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="px-6 py-28">
        <SectionTitle eyebrow="Hoe het werkt" title="Drie stappen. Zo gedaan." sub="Van schap tot winkelwagen, of van menukaart tot bestelling." />
        <div className="relative mx-auto mt-16 grid max-w-5xl grid-cols-3 gap-8">
          <div className="absolute left-[16%] right-[16%] top-12 border-t-2 border-dashed border-accent/40" />
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} data-reveal className="relative flex flex-col items-center text-center" style={{ transitionDelay: `${i * 120}ms` }}>
              <span className="relative flex h-24 w-24 items-center justify-center rounded-[30px] bg-accent text-white shadow-xl shadow-accent/30">
                <Icon size={40} />
                <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#ffd75e] font-display text-[17px] font-bold text-[#14130f]">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-6 font-display text-[26px] font-bold">{title}</h3>
              <p className="mt-2 max-w-xs text-[17px] leading-relaxed text-neutral-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waarom gratis */}
      <section className="px-6 pb-28">
        <div data-reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[40px] bg-accent px-14 py-16 text-center text-white">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#ffd75e]/20" />
          <Heart size={44} className="relative mx-auto fill-white" />
          <h2 className="relative mt-6 font-display text-[44px] font-bold leading-tight">Waarom gratis?</h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-[21px] leading-relaxed text-white/90">
            Omdat veilig eten geen abonnement zou moeten zijn. Wie coeliakie heeft, leest al genoeg kleine lettertjes. Dan
            hoort de hulp daarbij gewoon voor iedereen beschikbaar te zijn: onbeperkt, zonder account en zonder reclame.
          </p>
        </div>
      </section>

      {/* Naar je telefoon */}
      <section id="telefoon" className="scroll-mt-28 px-6 py-28">
        <div data-reveal className="mx-auto flex max-w-5xl flex-col items-center rounded-[40px] bg-white px-10 py-16 text-center shadow-sm ring-1 ring-neutral-200">
          <SectionTitle eyebrow="Op je telefoon" title="Geen app nodig. Gewoon scannen." sub={`Richt de camera van je telefoon op de code, of ga naar ${SITE_LABEL}. De scanner start meteen.`} />
          <div className="mt-10 flex items-center gap-14">
            <QrCode />
            <ol className="flex flex-col gap-4 text-left text-[18px]">
              {[
                'Scan de QR-code met je camera',
                'Sta cameratoegang toe',
                'Handig: zet hem op je beginscherm',
              ].map((t, i) => (
                <li key={t} className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-[17px] font-bold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-10 font-display text-[28px] font-bold text-accent">{SITE_LABEL}</p>
        </div>
      </section>

    </>
  )
}

function HowPage() {
  return (
    <>
      <PageBand eyebrow="Hoe het werkt" title="Zo gebruik je de scanner" sub="Drie manieren om te scannen. Kies wat je voor je hebt." />
      <section className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6">
          {WAYS.map(({ icon: Icon, title, text, tip }, i) => (
            <article key={title} data-reveal className="flex flex-col rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-neutral-200" style={{ transitionDelay: `${i * 100}ms` }}>
              <span className="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-accent text-white shadow-xl shadow-accent/30">
                <Icon size={30} />
                <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd75e] font-display text-[15px] font-bold text-[#14130f]">
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-6 font-display text-[28px] font-bold">{title}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-neutral-600">{text}</p>
              <p className="mt-auto pt-5 text-[15px] font-semibold text-accent">{tip}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#f3eee2] px-6 py-24">
        <SectionTitle eyebrow="De uitslag" title="Wat betekent de kleur?" sub="Na elke scan zie je meteen een kleur. Daaronder staat waarom." />
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-6">
          {COLORS.map(({ icon: Icon, label, text, cls }) => (
            <div key={label} data-reveal className={`flex flex-col items-center rounded-[32px] px-6 py-10 text-center ${cls}`}>
              <Icon size={56} />
              <h3 className="mt-4 font-display text-[28px] font-bold">{label}</h3>
              <p className="mt-1 text-[17px]">{text}</p>
            </div>
          ))}
        </div>
        <p data-reveal className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-[16px] text-neutral-600">
          <ShieldCheck size={20} className="shrink-0 text-accent" />
          Twijfel je? Kijk dan altijd nog even zelf op de verpakking.
        </p>
      </section>
    </>
  )
}

function FeaturesPage() {
  return (
    <>
      <PageBand eyebrow="Functies" title={<>Alles om glutenvrij te eten.<br />Zonder betaalmuur.</>} />
      <section className="bg-[#f3eee2] px-6 py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-6 gap-5">
          <article data-reveal className="col-span-4 flex flex-col items-center rounded-[32px] bg-[#14130f] p-10 text-center text-white">
            <ScanText size={40} className="text-[#7ee2a8]" />
            <h3 className="mt-5 font-display text-[32px] font-bold">Ingrediënten- én barcodescanner</h3>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-white/70">
              Scan de streepjescode of fotografeer het etiket. Productgegevens komen uit Open Food Facts. De tekst op een
              foto wordt op je eigen telefoon gelezen.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Barcode', 'Etiket', 'Menukaart'].map((t) => (
                <span key={t} className="rounded-full bg-white/10 px-4 py-1.5 text-[14px] font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </article>
          <article data-reveal className="col-span-2 flex flex-col items-center justify-center rounded-[32px] bg-accent p-8 text-center text-white">
            <InfinityIcon size={56} />
            <h3 className="mt-3 font-display text-[30px] font-bold">Onbeperkt</h3>
            <p className="mt-2 text-[16px] text-white/85">Scan zo vaak je wilt. Geen eerste-scan-gratis-trucje.</p>
          </article>
          {FEATURES.map(([Icon, title, text, bg], i) => (
            <article
              key={title}
              data-reveal
              className={`col-span-2 flex flex-col items-center rounded-[32px] p-8 text-center ring-1 ring-black/5 ${bg}`}
              style={{ transitionDelay: `${(i % 3) * 100}ms` }}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14130f] text-white">
                <Icon size={26} />
              </span>
              <h3 className="mt-5 font-display text-[24px] font-bold">{title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-neutral-700">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ActionPage() {
  return (
    <>
      <PageBand eyebrow="In actie" title="Bekijk het zelf" sub="Strak, donker en duidelijk. Ontworpen om in één oogopslag te lezen, ook in een drukke supermarkt." />
      <section className="pb-20 pt-6">
        <Carousel />
      </section>
    </>
  )
}

function GuidePage() {
  return (
    <>
      <PageBand
        eyebrow="Glutengids"
        title="Weet waar gluten schuilen"
        sub="Van tarwe en mout tot E-nummers: per ingrediënt hoe groot de kans op gluten is, en wat je in plaats daarvan kunt nemen."
      />
      <section className="bg-[#10140f] px-6 pb-24 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-5">
          {INGREDIENT_TABS.map((t, i) => {
            const high = t.entries.filter((e) => e.risk === 'hoog').length
            return (
              <article
                key={t.id}
                data-reveal
                className="flex flex-col items-center rounded-[28px] bg-white/[0.06] p-7 text-center ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.09]"
                style={{ transitionDelay: `${(i % 4) * 80}ms` }}
              >
                <h3 className="font-display text-[20px] font-bold leading-tight [overflow-wrap:anywhere]">{t.label}</h3>
                <p className="mt-1 text-[14px] text-white/55">
                  {t.entries.length} ingrediënten{high > 0 && <> · <span className="text-[#ff8a80]">{high} hoog</span></>}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
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
        <div data-reveal className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-4 text-center">
          <p className="text-[17px] text-white/65">Plus thema&apos;s vol praktische tips:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {GUIDE.map((c) => (
              <span key={c.id} className="rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold">
                {c.title}
              </span>
            ))}
            <span className="rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold">Reiskaart in 10 talen</span>
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <PrimaryButton>Bekijk de gids op je telefoon</PrimaryButton>
        </div>
      </section>
    </>
  )
}

function QuestionsPage() {
  return (
    <>
      <PageBand eyebrow="Vragen" title="Veelgestelde vragen" />
      <section className="bg-[#f3eee2] px-6 pb-24 pt-4">
        <Faq />
      </section>
    </>
  )
}

const PAGE_VIEWS: Record<string, () => ReactNode> = {
  '/hoe-het-werkt': HowPage,
  '/functies': FeaturesPage,
  '/in-actie': ActionPage,
  '/glutengids': GuidePage,
  '/vragen': QuestionsPage,
}

const NAV_CLS = 'rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#7ee2a8]'

export function LandingPage() {
  const path = usePath()
  const View = PAGE_VIEWS[path] ?? HomePage
  const current = PAGES.find((p) => p.path === path)
  useReveal(path)
  useEffect(() => {
    document.title = current ? `${current.label} · Glutenscanner` : 'Glutenscanner'
  }, [current])

  return (
    <div className="min-h-full overflow-x-hidden bg-[#fbf8f1] text-[#14130f] [color-scheme:light]">
      {/* Navigatie */}
      <header className="fixed inset-x-0 top-4 z-40 px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#14130f]/80 pl-5 pr-2 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="rounded-2xl">
            <Logo light />
          </Link>
          <nav className="flex items-center gap-1 font-display text-[17px] font-bold tracking-tight text-white">
            {PAGES.map(({ path: href, label }) => (
              <Link key={href} href={href} className={`${NAV_CLS} ${href === path ? 'bg-white/10 text-[#7ee2a8]' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href={PHONE_HREF} className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-display text-[16px] font-bold text-white transition hover:bg-[#1a9258]">
            <Smartphone size={17} />
            Op je telefoon
          </Link>
        </div>
      </header>

      <main key={path}>
        <View />
      </main>

      {/* Footer: één platte regel; de navigatie staat al in de kop. */}
      <footer className="border-t border-neutral-200 bg-[#fbf8f1] px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 text-[14px] text-neutral-500">
          <Logo />
          <p className="text-center leading-relaxed">
            {DISCLAIMER_SHORT} Productdata:{' '}
            <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-accent">
              Open Food Facts
            </a>
          </p>
          <p className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            © {YEAR} · Gemaakt met <Heart size={14} className="fill-[#ff5a4e] text-[#ff5a4e]" /> in Nederland
          </p>
        </div>
      </footer>
    </div>
  )
}
