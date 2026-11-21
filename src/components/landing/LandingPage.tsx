import '@fontsource-variable/bricolage-grotesque'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Barcode,
  Check,
  CheckCircle2,
  Heart,
  FileText,
  Infinity as InfinityIcon,
  Menu,
  Minus,
  Plus,
  ScanBarcode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { DISCLAIMER_SHORT } from '../ui/DisclaimerModal'
import { SiteGuide } from './SiteGuide'
import { DESKTOP_QUERY, openScanner } from '../../services/siteNav'
import {
  Phone,
  ScreenDanger,
  ScreenGuide,
  ScreenMenu,
  ScreenPhoto,
  ScreenSafe,
  ScreenScanner,
  ScreenReadAlong,
  ScreenAlternative,
  ScreenRecipe,
  ScreenTravel,
  ScreenDoubleCheck,
  ScreenShare,
  ScreenOffline,
  ScreenQuiz,
} from './PhoneScreens'
import { ScanDemo } from './ScanDemo'
import { readSharedList } from '../../services/shareList'
import type { GlutenStatus } from '../../types/product'
import { Features } from './Features'

/**
 * Op de desktop is dit een informatiesite: de scanner heeft een telefooncamera nodig.
 * Elk menu-item is een eigen pagina met een eigen adres (/hoe-het-werkt, /vragen, ...).
 * De knoppen "Op je telefoon" wijzen naar de QR-code op de startpagina.
 */
const PHONE_HREF = '/#telefoon'
/** Altijd het adres waarop de site nu open staat, zodat de QR-code en de tekst kloppen. */
const SITE_URL = window.location.origin
const SITE_LABEL = window.location.host.replace(/^www\./, '')
const YEAR = new Date().getFullYear()

const PAGES = [
  { path: '/hoe-het-werkt', label: 'Hoe het werkt' },
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

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Desktop met muis: daar wijzen de knoppen naar de QR-code; op de telefoon openen ze de scanner. */
function useDesktop() {
  return useSyncExternalStore(subscribeDesktop, () => window.matchMedia(DESKTOP_QUERY).matches)
}

/** Gaat naar een pagina (en eventueel een blok erop) zonder de site te herladen. */
function go(href: string) {
  const [path, hash] = href.split('#')
  if (path !== window.location.pathname || hash) {
    window.history.pushState({ site: true }, '', href)
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

/** `compact`: op de telefoon alleen het icoon (de kop is daar te vol), op de desktop met het woord. */
function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 rotate-[-6deg] items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30 lg:h-10 lg:w-10">
        <ScanBarcode size={20} />
      </span>
      <span className={`font-display text-[19px] font-bold tracking-tight lg:text-[21px] ${compact ? 'hidden lg:inline' : ''} ${light ? 'text-white' : 'text-[#14130f]'}`}>
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
      <h2 className={`mt-5 font-display text-[34px] font-bold lg:text-[52px] leading-[1.05] tracking-tight ${light ? 'text-white' : 'text-[#14130f]'}`}>
        {title}
      </h2>
      {sub && <p className={`mt-4 text-[17px] leading-relaxed lg:text-[19px] ${light ? 'text-white/65' : 'text-neutral-600'}`}>{sub}</p>}
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

const CAROUSEL: { word: string; line: string; accent: string; bg: string; screen: ReactNode }[] = [
  { word: 'Scan', line: 'de barcode in seconden', accent: 'text-[#ffd75e]', bg: 'bg-accent', screen: <ScreenScanner /> },
  { word: 'Spot', line: 'verborgen gluten', accent: 'text-[#ffd75e]', bg: 'bg-[#14130f]', screen: <ScreenPhoto /> },
  { word: 'Weet', line: 'of er gluten in zit', accent: 'text-[#14130f]', bg: 'bg-[#7ee2a8]', screen: <ScreenSafe /> },
  { word: 'Zie', line: 'wat er wél in zit', accent: 'text-white', bg: 'bg-[#ff5a4e]', screen: <ScreenDanger /> },
  { word: 'Kies', line: 'een glutenvrij alternatief', accent: 'text-[#ffd75e]', bg: 'bg-[#1d4d35]', screen: <ScreenAlternative /> },
  { word: 'Merk', line: 'het als het recept verandert', accent: 'text-[#14130f]', bg: 'bg-[#f2a33a]', screen: <ScreenRecipe /> },
  { word: 'Lees', line: 'buitenlandse etiketten mee', accent: 'text-white', bg: 'bg-[#7c5cd6]', screen: <ScreenReadAlong /> },
  { word: 'Vraag', line: 'het restaurant', accent: 'text-[#14130f]', bg: 'bg-[#ffd75e]', screen: <ScreenMenu /> },
  { word: 'Leer', line: 'waar gluten schuilen', accent: 'text-[#ffd75e]', bg: 'bg-[#14130f]', screen: <ScreenGuide /> },
  { word: 'Reis', line: 'met een kaart in 10 talen', accent: 'text-white', bg: 'bg-[#3b6fd8]', screen: <ScreenTravel /> },
  { word: 'Check', line: 'dubbel: barcode én etiket', accent: 'text-[#14130f]', bg: 'bg-[#7ee2a8]', screen: <ScreenDoubleCheck /> },
  { word: 'Deel', line: 'je lijst met opa en oma', accent: 'text-[#ffd75e]', bg: 'bg-[#1d4d35]', screen: <ScreenShare /> },
  { word: 'Scan', line: 'ook zonder internet', accent: 'text-[#ffd75e]', bg: 'bg-[#14130f]', screen: <ScreenOffline /> },
  { word: 'Oefen', line: 'met de quiz', accent: 'text-[#14130f]', bg: 'bg-[#ffd75e]', screen: <ScreenQuiz /> },
]

/** Elke manier van scannen een eigen kleur, in de stijl van de rest van de site. */
const WAYS: {
  icon: LucideIcon
  title: string
  /** Het icoontje dat je onderin de scanner kiest. */
  appIcon: LucideIcon
  mode: string
  text: string
  tip: string
  tile: string
  iconCls: string
  sub: string
  pill: string
}[] = [
  {
    icon: ScanBarcode,
    title: 'Barcode',
    appIcon: Barcode,
    mode: 'Leest vanzelf',
    text: 'Richt de camera op de streepjescode. Je hoeft niet te tikken.',
    tip: 'Geen ingrediënten bekend? Fotografeer ze.',
    tile: 'bg-[#14130f] text-white',
    iconCls: 'bg-accent text-white shadow-accent/40',
    sub: 'text-white/70',
    pill: 'bg-white/10 text-[#7ee2a8]',
  },
  {
    icon: FileText,
    title: 'Etiket',
    appIcon: FileText,
    mode: 'Tik op de knop',
    text: 'Fotografeer de ingrediënten. Hij zoekt woorden als tarwe, gerst en mout. Een recept op de zak telt niet mee.',
    tip: 'Ook trigo, Weizen en meer',
    tile: 'bg-accent text-white',
    iconCls: 'bg-white text-accent shadow-black/20',
    sub: 'text-white/85',
    pill: 'bg-white/15 text-white',
  },
  {
    icon: Camera,
    title: 'Menukaart',
    appIcon: FileText,
    mode: 'Tik op de knop',
    text: 'Fotografeer het menu, het kader is groot genoeg. Je ziet waar gluten in kunnen zitten en wat je kunt vragen.',
    tip: 'Handig in een restaurant',
    tile: 'bg-[#ffd75e] text-[#14130f]',
    iconCls: 'bg-[#14130f] text-[#ffd75e] shadow-black/20',
    sub: 'text-[#14130f]/75',
    pill: 'bg-[#14130f]/10 text-[#14130f]',
  },
]

const COLORS: { icon: LucideIcon; label: string; text: string; cls: string }[] = [
  { icon: CheckCircle2, label: 'Glutenvrij', text: 'Geen gluten gevonden.', cls: 'bg-[#e3f6ea] text-[#137a46]' },
  { icon: AlertTriangle, label: 'Twijfel', text: 'Misschien gluten. Lees het etiket of vraag het na.', cls: 'bg-[#fff1d6] text-[#a35f00]' },
  { icon: XCircle, label: 'Bevat gluten', text: 'Gluten gevonden. Niet eten.', cls: 'bg-[#ffe3e0] text-[#c0281d]' },
]

const FAQ = [
  {
    q: 'Is Glutenscanner echt helemaal gratis?',
    a: 'Ja. Geen proefperiode, geen scanlimiet, geen abonnement en geen account. Alle functies zijn voor iedereen, altijd.',
  },
  {
    q: 'Hoe weet hij of iets glutenvrij is?',
    a: 'Scan je een barcode, dan zoekt hij het product op in een grote open database met producten uit de hele wereld. Maak je een foto van een etiket of menukaart, dan leest hij zelf de tekst en zoekt hij naar glutenwoorden, in 11 talen.',
  },
  {
    q: 'Is het geschikt bij coeliakie?',
    a: 'Ja. We hebben hem gemaakt voor onze eigen dochter met coeliakie. Bij Instellingen kies je zelf of "kan sporen bevatten" rood of oranje wordt.',
  },
  {
    q: 'Moet ik een app downloaden?',
    a: `Nee. Open ${SITE_LABEL} op je telefoon en de scanner start direct. Wil je een icoon tussen je apps? iPhone: tik op "Deel" en dan "Zet op beginscherm". Android: tik op ⋮ en dan "Toevoegen aan startscherm".`,
  },
  {
    q: 'Werkt het zonder internet?',
    a: 'Ja, grotendeels. De glutengids, het lezen van etiketten en je eerdere scans werken zonder internet. De app bewaart ook duizenden populaire Nederlandse producten, dus de meeste barcodes geven in de supermarkt meteen een uitslag. Alleen een heel nieuw of zeldzaam product heeft internet nodig.',
  },
  {
    q: 'Worden mijn foto’s geüpload?',
    a: 'Nee. De tekstherkenning draait op je eigen telefoon. Alleen bij een barcodescan wordt de barcode opgezocht in de open database van Open Food Facts.',
  },
  {
    q: 'Werkt het in het buitenland?',
    a: 'Zeker. De scanner herkent glutentermen in 11 Europese talen en meldt ze in het Nederlands. Met de kaart voor de bediening leg je coeliakie uit aan de bediening, in 10 talen.',
  },
  {
    q: 'Wat als een product niet gevonden wordt?',
    a: 'Dan krijg je oranje, nooit groen. Tik op "Fotografeer de ingrediënten" en maak een foto van het etiket. Dan leest de scanner de ingrediënten zelf.',
  },
  {
    q: 'Hoe zeker is de uitslag?',
    a: 'De app geeft alleen groen als hij het zeker weet. Kon de camera een woord niet goed lezen, of zegt de database iets anders dan het etiket, dan wordt het oranje. Met "Dubbel checken met het etiket" vergelijk je de database met de verpakking. En heb je de verpakking zelf bekeken, tik dan op "Ik heb het gecontroleerd". Dan weet je het de volgende keer meteen.',
  },
  {
    q: 'Kan ik mijn lijst delen met opa, oma of school?',
    a: 'Ja. Zet een ster bij producten die je vaak koopt. Bij Geschiedenis staat dan de knop "Deel de lijst met opa, oma of school". Je stuurt één link. De ontvanger ziet een nette lijst met wat mag en wat niet, zonder app of account.',
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
      <div ref={track} className="mx-auto flex max-w-[1128px] snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] lg:scroll-px-0 lg:px-0">
        {CAROUSEL.map(({ word, line, accent, bg, screen }) => (
          <article
            key={word + line}
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
    <div data-reveal className="mx-auto mt-12 max-w-3xl divide-y divide-neutral-200 rounded-[32px] bg-white px-5 shadow-sm ring-1 ring-neutral-200 lg:px-8">
      {FAQ.map(({ q, a }, i) => (
        <div key={q} className="py-2">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 py-4 text-left font-display text-[17px] font-semibold lg:gap-6 lg:text-[20px]"
          >
            {q}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${open === i ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
              {open === i ? <Minus size={18} /> : <Plus size={18} />}
            </span>
          </button>
          {open === i && <p className="pb-5 pr-2 text-[16px] leading-relaxed text-neutral-600 lg:pr-14 lg:text-[17px]">{a}</p>}
        </div>
      ))}
    </div>
  )
}

/* ---------- Pagina's ---------- */

/** Donkere band bovenaan elke pagina, in de stijl van het bovenstuk van de startpagina. */
function PageBand({ eyebrow, title, sub }: { eyebrow: string; title: ReactNode; sub?: string }) {
  return (
    <section className="relative overflow-hidden bg-[#10140f] px-6 pb-14 pt-32 text-white lg:pb-20 lg:pt-40">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative">
        <SectionTitle light eyebrow={eyebrow} title={title} sub={sub} />
      </div>
    </section>
  )
}

function HomePage() {
  const desktop = useDesktop()
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#10140f] pb-0 pt-28 text-white lg:pt-32">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 right-[-10%] h-[500px] w-[600px] rounded-full bg-[#ffd75e]/15 blur-[140px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/85 backdrop-blur lg:text-[14px]">
            <Heart size={15} className="fill-[#ff5a4e] text-[#ff5a4e]" />
            Gratis, voor iedereen met coeliakie of glutenintolerantie
          </span>
          <h1 className="mt-7 font-display text-[50px] font-extrabold leading-[0.98] tracking-tight lg:text-[76px]">
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
          <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-white/70 lg:text-[20px]">
            Scan een barcode, etiket of menukaart en zie binnen seconden of er gluten in zitten. Onbeperkt, zonder
            account, gewoon in je browser op <b className="text-white">{SITE_LABEL}</b>.
          </p>
          <p className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-white/55 lg:text-[15px]">
            {['Altijd gratis', 'Onbeperkt scannen', 'Geen account', 'Foto’s blijven op je toestel'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check size={15} className="text-[#7ee2a8]" />
                {t}
              </span>
            ))}
          </p>
        </div>

        {/* Drie telefoons in een waaier, met zwevende labels */}
        <div className="relative mx-auto mt-12 flex h-[400px] max-w-5xl items-start justify-center lg:h-[470px]">
          <div className="absolute left-[14%] top-14 hidden -rotate-[9deg] opacity-95 lg:block">
            <Phone>
              <ScreenSafe />
            </Phone>
          </div>
          <div className="absolute right-[14%] top-14 hidden rotate-[9deg] opacity-95 lg:block">
            <Phone>
              <ScreenDanger />
            </Phone>
          </div>
          <div className="relative z-10 lg:scale-[1.08]">
            <Phone className="shadow-[0_40px_120px_-20px_rgba(31,164,99,0.55)]">
              <ScreenScanner />
            </Phone>
          </div>
          {/* Zwevende labels alleen op een groot scherm; op de telefoon is er geen ruimte. */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
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
        </div>
      </section>

      {/* Hoe het werkt: bewegend voorbeeld in plaats van drie losse stappen */}
      <section className="px-6 py-20 lg:py-28">
        <SectionTitle eyebrow="Hoe het werkt" title="Richten. Scannen. Klaar." sub="Barcode, etiket of menukaart: in een paar tellen weet je of het mag." />
        <ScanDemo />
      </section>

      {/* Waarom gratis en Op je telefoon: compact naast elkaar (telefoon: onder elkaar) */}
      <section id="telefoon" className="scroll-mt-28 px-4 pb-20 lg:px-6 lg:pb-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-2">
          <div data-reveal className="relative flex flex-col justify-center overflow-hidden rounded-[36px] bg-accent px-7 py-10 text-white lg:px-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[#ffd75e]/20" />
            <h2 className="relative font-display text-[30px] font-bold leading-tight lg:text-[36px]">Waarom gratis?</h2>
            <p className="relative mt-3 text-[16px] leading-relaxed text-white/90 lg:text-[18px]">
              Omdat veilig eten geen abonnement zou moeten zijn. Wie coeliakie heeft, leest al genoeg kleine lettertjes. Daarom
              is alles gratis: zonder account en zonder reclame.
            </p>
          </div>

          {desktop ? (
            <div data-reveal className="flex items-center gap-8 rounded-[36px] bg-white px-10 py-10 shadow-sm ring-1 ring-neutral-200">
              <QrCode size={136} />
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-accent">Op je telefoon</p>
                <h2 className="mt-2 font-display text-[30px] font-bold leading-tight lg:text-[34px]">Geen app nodig.</h2>
                <ol className="mt-4 flex flex-col gap-2.5 text-[16px]">
                  {['Scan de code met je camera', 'Sta cameratoegang toe', 'Handig: zet hem op je beginscherm'].map((t, i) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-display text-[14px] font-bold text-white">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 font-display text-[20px] font-bold text-accent">{SITE_LABEL}</p>
              </div>
            </div>
          ) : (
            <div data-reveal className="rounded-[36px] bg-white px-7 py-10 shadow-sm ring-1 ring-neutral-200">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-accent">Op je telefoon</p>
              <h2 className="mt-2 font-display text-[30px] font-bold leading-tight">Geen app nodig.</h2>
              <p className="mt-2 text-[16px] text-neutral-600">Je bent er al. Tik bovenaan op Scan en de scanner start.</p>
              <ol className="mt-4 flex flex-col gap-2.5 text-[16px]">
                {['Sta cameratoegang toe', 'Handig: tik op Deel en dan "Zet op beginscherm"'].map((t, i) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-display text-[14px] font-bold text-white">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>

    </>
  )
}

function HowPage() {
  return (
    <>
      <PageBand eyebrow="Hoe het werkt" title="Zo gebruik je de scanner" sub="Kies onderin de scanner het icoontje voor barcode of etiket. Een menukaart scan je ook met het etiket-icoontje." />
      <section className="px-4 py-14 lg:px-6 lg:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          {WAYS.map(({ icon: Icon, title, appIcon: AppIcon, mode, text, tip, tile, iconCls, sub, pill }, i) => (
            <article
              key={title}
              data-reveal
              className={`flex flex-col items-center rounded-[36px] px-8 pb-9 pt-11 text-center shadow-xl shadow-black/5 ${tile}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className={`relative flex h-20 w-20 items-center justify-center rounded-[26px] shadow-xl ${iconCls}`}>
                <Icon size={36} />
                <span className={`absolute -right-2.5 -top-2.5 flex h-9 w-9 items-center justify-center rounded-full font-display text-[16px] font-bold text-[#14130f] shadow-md ${tile.includes('#ffd75e') ? 'bg-white' : 'bg-[#ffd75e]'}`}>
                  {i + 1}
                </span>
              </span>
              <h3 className="mt-7 font-display text-[32px] font-bold leading-none">{title}</h3>
              <p className={`mt-3 flex items-center gap-2 font-display text-[15px] font-bold uppercase tracking-[0.12em] ${sub}`}>
                <span className={`flex h-7 w-10 items-center justify-center rounded-full ${pill}`} title="Kies dit icoontje in de scanner">
                  <AppIcon size={17} />
                </span>
                {mode}
              </p>
              <p className={`mt-4 max-w-[280px] text-[17px] leading-relaxed ${sub}`}>{text}</p>
              <div className="mt-auto pt-6">
                <span className={`inline-flex rounded-full px-4 py-2 text-[14px] font-semibold ${pill}`}>{tip}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-[#f3eee2] px-4 py-16 lg:px-6 lg:py-24">
        <SectionTitle eyebrow="De uitslag" title="Wat betekent de kleur?" sub="Na elke scan zie je meteen een kleur. Daaronder staat waarom." />
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
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
      <section className="px-4 py-16 lg:px-6 lg:py-24">
        <SectionTitle eyebrow="Handig" title="Wat de scanner nog meer kan" sub="Meer dan alleen gluten zoeken. En alles is gratis." />
        <Features />
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
        title="Kan dit?"
        sub="Typ een product en zie meteen of het mag."
      />
      <SiteGuide />
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

/** Gedeelde lijst "Mijn vaste producten" (alles staat in de link, na het #-teken). */
function ListPage() {
  const list = useMemo(() => readSharedList(window.location.hash), [])
  const groups: [GlutenStatus, string, string][] = [
    ['safe', 'Dit mag', 'text-safe'],
    ['warning', 'Eerst even kijken', 'text-warning'],
    ['danger', 'Liever niet', 'text-danger'],
  ]
  return (
    <>
      <PageBand
        eyebrow="Gedeelde lijst"
        title={list?.who ? `Dit mag ${list.who} eten` : 'Glutenvrije boodschappen'}
        sub={list ? `Producten die thuis vaak gekocht worden. Gemaakt op ${new Date(list.at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}.` : undefined}
      />
      <section className="mx-auto w-full max-w-2xl px-5 py-10 lg:py-14">
        {!list || list.items.length === 0 ? (
          <p className="text-center text-[17px] text-neutral-600">Deze link werkt niet (meer). Vraag of iemand hem opnieuw stuurt.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map(([status, label, color]) => {
              const items = list.items.filter((i) => i.status === status)
              if (items.length === 0) return null
              return (
                <div key={status}>
                  <h2 className={`mb-3 font-display text-[22px] font-bold ${color}`}>{label}</h2>
                  <ul className="divide-y divide-neutral-200 overflow-hidden rounded-[24px] bg-white ring-1 ring-neutral-200">
                    {items.map((i, n) => (
                      <li key={n} className="flex items-center gap-3 px-5 py-3.5">
                        <span className={`h-3 w-3 shrink-0 rounded-full ${status === 'safe' ? 'bg-safe' : status === 'warning' ? 'bg-warning' : 'bg-danger'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-semibold text-[#14130f]">{i.name}</span>
                          {i.brand && <span className="block text-[14px] text-neutral-500">{i.brand}</span>}
                        </span>
                        {i.checked && (
                          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-safe">
                            <ShieldCheck size={15} /> Zelf gecontroleerd
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
            <p className="text-center text-[15px] leading-relaxed text-neutral-600">
              Recepten kunnen veranderen. Kijk daarom altijd nog even op de verpakking.
              <br />
              Zelf iets scannen? Ga op je telefoon naar <b className="text-[#14130f]">glutenscanner.nl</b>.
            </p>
          </div>
        )}
      </section>
    </>
  )
}

const PAGE_VIEWS: Record<string, () => ReactNode> = {
  '/lijst': ListPage,
  '/hoe-het-werkt': HowPage,
  // Functies is opgegaan in Hoe het werkt; oude links komen daar terecht.
  '/functies': HowPage,
  '/in-actie': ActionPage,
  '/glutengids': GuidePage,
  '/vragen': QuestionsPage,
}

const NAV_CLS = 'rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#7ee2a8]'

export function LandingPage() {
  const path = usePath()
  const [menuOpen, setMenuOpen] = useState(false)
  // Menu dicht zodra je naar een andere pagina gaat.
  const [menuPath, setMenuPath] = useState(path)
  if (menuPath !== path) {
    setMenuPath(path)
    setMenuOpen(false)
  }
  const View = PAGE_VIEWS[path] ?? HomePage
  const current = PAGES.find((p) => p.path === path)
  useReveal(path)
  useEffect(() => {
    if (path !== '/functies') return
    window.history.replaceState(null, '', '/hoe-het-werkt' + window.location.hash)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [path])
  useEffect(() => {
    document.title = current ? `${current.label} · Glutenscanner` : 'Glutenscanner'
  }, [current])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#fbf8f1] text-[#14130f] [color-scheme:light]">
      {/* Navigatie: desktop alles in één balk; telefoon logo, scannerknop en menu rechts. */}
      <header className="fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-40 px-3 lg:top-4 lg:px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 rounded-full border border-white/10 bg-[#14130f]/80 pl-4 pr-2 shadow-2xl backdrop-blur-xl lg:pl-5">
          <Link href="/" className="rounded-2xl" aria-label="Glutenscanner, naar de startpagina">
            <Logo light compact />
          </Link>
          <nav className="hidden items-center gap-1 font-display text-[17px] font-bold tracking-tight text-white lg:flex">
            {PAGES.map(({ path: href, label }) => (
              <Link key={href} href={href} className={`${NAV_CLS} ${href === path ? 'bg-white/10 text-[#7ee2a8]' : ''}`}>
                {label}
              </Link>
            ))}
          </nav>
          <Link href={PHONE_HREF} className="hidden items-center gap-2 rounded-full bg-accent px-5 py-3 font-display text-[16px] font-bold text-white transition hover:bg-[#1a9258] lg:flex">
            <Smartphone size={17} />
            Op je telefoon
          </Link>
          <div className="flex items-center gap-1 lg:hidden">
            <button onClick={openScanner} className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full bg-accent px-3 font-display text-[16px] font-bold text-white min-[380px]:pl-3.5 min-[380px]:pr-4" aria-label="Open de scanner">
              <ScanBarcode size={18} />
              <span className="hidden min-[380px]:inline">Scan</span>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white active:bg-white/10"
              aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="animate-slide-up mx-auto mt-2 flex max-w-6xl flex-col rounded-[28px] border border-white/10 bg-[#14130f]/95 p-2 font-display text-[20px] font-bold text-white shadow-2xl backdrop-blur-xl lg:hidden">
            {PAGES.map(({ path: href, label }) => (
              <Link key={href} href={href} className={`rounded-2xl px-5 py-3.5 ${href === path ? 'bg-white/10 text-[#7ee2a8]' : 'active:bg-white/10'}`}>
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* flex-1: bij een korte pagina (Vragen) staat de footer toch onderaan het scherm. */}
      {/* Glutengids: donker tot aan de footer, anders een groot wit vlak onder de vakken. */}
      <main key={path} className={`flex-1 ${path === '/glutengids' ? 'bg-[#10140f]' : ''}`}>
        <View />
      </main>

      {/* Footer: één platte regel; de navigatie staat al in de kop. */}
      <footer className="border-t border-neutral-200 bg-[#fbf8f1] px-6 py-3">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 text-[12.5px] text-neutral-500 lg:flex-row lg:gap-8">
          <span className="origin-center scale-[0.8] lg:origin-left">
            <Logo />
          </span>
          <p className="text-center leading-snug">
            {DISCLAIMER_SHORT}{' '}
            <span className="whitespace-nowrap">
              Productdata:{' '}
              <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-accent">
                Open Food Facts
              </a>
            </span>
          </p>
          <p className="shrink-0 whitespace-nowrap">© {YEAR} · Nederland</p>
        </div>
      </footer>
    </div>
  )
}
