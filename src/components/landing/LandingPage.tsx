import '@fontsource-variable/bricolage-grotesque'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
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
  Sparkles,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GUIDE } from '../../data/glutenGuide'
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

/** Opent de scanner in deze browser (ook op de desktop). */
const APP_HREF = '#app'
const SITE_URL = 'https://www.glutenscanner.nl'
const SITE_LABEL = 'glutenscanner.nl'
const YEAR = new Date().getFullYear()

/** Laat elementen met data-reveal zacht invliegen zodra ze in beeld komen. */
function useReveal() {
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
  }, [])
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

function PrimaryButton({ children, href = APP_HREF }: { children: ReactNode; href?: string }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-[18px] font-semibold text-white shadow-xl shadow-accent/30 transition hover:-translate-y-0.5 hover:bg-[#1a9258] hover:shadow-2xl hover:shadow-accent/40"
    >
      {children}
      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
    </a>
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

const GLUTEN_WORDS = [
  'tarwe', 'trigo', 'gerst', 'frumento', 'rogge', 'Weizen', 'spelt', 'cebada', 'mout', 'orzo', 'haver', 'hvete',
  'blé', 'segale', 'kamut', 'Gerste', 'bulgur', 'centeno', 'couscous', 'vete', 'seitan', 'malta', 'griesmeel', 'råg',
]

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ScanBarcode, title: 'Richt je camera', text: 'Op een barcode, ingrediëntenlijst of menukaart. Geen typen, geen account.' },
  { icon: Sparkles, title: 'Zie het direct', text: 'Glutenvrij, twijfelgeval of bevat gluten: groot, kleurrijk en met uitleg.' },
  { icon: ShieldCheck, title: 'Dubbelcheck', text: 'Je scan is een tweede blik. Kijk daarna nog even op de verpakking, en klaar.' },
]

const CAROUSEL: { word: string; line: string; accent: string; bg: string; screen: ReactNode }[] = [
  { word: 'Scan', line: 'elk product in seconden', accent: 'text-[#ffd75e]', bg: 'bg-accent', screen: <ScreenScanner /> },
  { word: 'Spot', line: 'verborgen gluten', accent: 'text-[#ffd75e]', bg: 'bg-[#14130f]', screen: <ScreenPhoto /> },
  { word: 'Weet', line: 'of het veilig is', accent: 'text-[#14130f]', bg: 'bg-[#7ee2a8]', screen: <ScreenSafe /> },
  { word: 'Zie', line: 'wat er wél in zit', accent: 'text-white', bg: 'bg-[#ff5a4e]', screen: <ScreenDanger /> },
  { word: 'Vraag', line: 'het restaurant', accent: 'text-[#14130f]', bg: 'bg-[#ffd75e]', screen: <ScreenMenu /> },
  { word: 'Leer', line: 'waar gluten schuilen', accent: 'text-[#ffd75e]', bg: 'bg-[#1d4d35]', screen: <ScreenGuide /> },
  { word: 'Reis', line: 'zonder zorgen', accent: 'text-white', bg: 'bg-[#3b6fd8]', screen: <ScreenTravel /> },
]

const COMPARISON: { label: string; ours: string | boolean; paid: string | boolean }[] = [
  { label: 'Prijs', ours: '€ 0, voor altijd', paid: 'Abonnement' },
  { label: 'Aantal scans', ours: 'Onbeperkt', paid: 'Vaak maar 1 gratis' },
  { label: 'Account nodig', ours: 'Nee', paid: 'Vaak wel' },
  { label: 'Barcode- én ingrediëntenscan', ours: true, paid: true },
  { label: 'Tekstherkenning op je eigen toestel', ours: true, paid: false },
  { label: 'Menukaart-analyse met vragen voor de bediening', ours: true, paid: false },
  { label: 'Reiskaart in 10 talen', ours: true, paid: false },
  { label: 'Veiligheidsprofiel', ours: true, paid: true },
]

const FAQ = [
  {
    q: 'Is Glutenscanner echt helemaal gratis?',
    a: 'Ja. Geen proefperiode, geen scanlimiet, geen abonnement en geen account. Alle functies zijn voor iedereen, altijd.',
  },
  {
    q: 'Moet ik een app downloaden?',
    a: `Nee. Open ${SITE_LABEL} op je telefoon en de scanner start direct. Wil je een app-icoon? Kies in je browser "Deel" en dan "Zet op beginscherm".`,
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
    q: 'Is het veilig voor mensen met coeliakie?',
    a: 'Glutenscanner is een hulpmiddel voor een snelle tweede blik, geen medisch advies. Bij twijfel kiest de app altijd voor de voorzichtige uitslag. Controleer altijd de fysieke verpakking.',
  },
]

function Cell({ value, ours = false }: { value: string | boolean; ours?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${ours ? 'bg-accent text-white' : 'bg-neutral-200 text-neutral-600'}`}>
        <Check size={18} strokeWidth={3} aria-label="Ja" />
      </span>
    ) : (
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-300">
        <X size={18} strokeWidth={3} aria-label="Nee" />
      </span>
    )
  }
  return <span className={ours ? 'font-display text-[18px] font-bold text-accent' : 'text-neutral-500'}>{value}</span>
}

function Carousel() {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  return (
    <div data-reveal className="mt-14">
      <div ref={track} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(1.5rem,calc((100vw-72rem)/2))] pb-6 [scrollbar-width:none]">
        {CAROUSEL.map(({ word, line, accent, bg, screen }) => (
          <article
            key={word}
            className={`flex w-[290px] shrink-0 snap-center flex-col items-center overflow-hidden rounded-[36px] pt-8 text-center shadow-xl ${bg}`}
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

export function LandingPage() {
  useReveal()
  return (
    <div className="min-h-full overflow-x-hidden bg-[#fbf8f1] text-[#14130f] [color-scheme:light]">
      {/* Navigatie */}
      <header className="fixed inset-x-0 top-4 z-40 px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#14130f]/80 pl-5 pr-2 shadow-2xl backdrop-blur-xl">
          <Logo light />
          <nav className="flex items-center gap-8 text-[15px] font-medium text-white/75">
            <a href="#hoe" className="hover:text-white">Hoe het werkt</a>
            <a href="#functies" className="hover:text-white">Functies</a>
            <a href="#in-actie" className="hover:text-white">In actie</a>
            <a href="#gids" className="hover:text-white">Glutengids</a>
            <a href="#vragen" className="hover:text-white">Vragen</a>
          </nav>
          <a href={APP_HREF} className="rounded-full bg-accent px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-[#1a9258]">
            Start met scannen
          </a>
        </div>
      </header>

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
            <PrimaryButton>Start met scannen</PrimaryButton>
            <a href="#hoe" className="rounded-full border border-white/20 px-8 py-4 font-display text-[18px] font-semibold text-white/90 transition hover:bg-white/10">
              Hoe werkt het?
            </a>
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

      {/* Lopende band met glutenwoorden */}
      <div className="relative z-10 -mt-1 overflow-hidden bg-accent py-5 text-white">
        <div className="flex w-max animate-marquee items-center gap-8 font-display text-[26px] font-bold">
          {[...GLUTEN_WORDS, ...GLUTEN_WORDS].map((w, i) => (
            <span key={i} className="flex items-center gap-8">
              {w}
              <span className="text-[#ffd75e]">✦</span>
            </span>
          ))}
        </div>
      </div>
      <p className="bg-[#fbf8f1] pt-5 text-center text-[15px] font-medium text-neutral-500">
        We herkennen ze allemaal, in 11 talen, en vertellen het je in gewoon Nederlands.
      </p>

      {/* Cijfers */}
      <section className="mx-auto grid max-w-5xl grid-cols-4 gap-6 px-6 pt-20">
        {[
          ['€ 0', 'voor altijd'],
          ['∞', 'scans per dag'],
          ['11', 'talen herkend'],
          ['37', 'gidsonderwerpen'],
        ].map(([n, l]) => (
          <div key={l} data-reveal className="flex flex-col items-center rounded-[28px] bg-white py-8 text-center shadow-sm ring-1 ring-neutral-200">
            <span className="font-display text-[54px] font-extrabold leading-none text-accent">{n}</span>
            <span className="mt-2 text-[16px] text-neutral-600">{l}</span>
          </div>
        ))}
      </section>

      {/* Hoe het werkt */}
      <section id="hoe" className="scroll-mt-28 px-6 py-28">
        <SectionTitle eyebrow="Hoe het werkt" title="Drie seconden. Drie stappen." sub="Van schap tot winkelwagen, of van menukaart tot bestelling." />
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

      {/* Functies: bento */}
      <section id="functies" className="scroll-mt-28 bg-[#f3eee2] px-6 py-28">
        <SectionTitle eyebrow="Functies" title={<>Alles om glutenvrij te eten.<br />Zonder betaalmuur.</>} />
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-6 gap-5">
          <article data-reveal className="col-span-4 flex flex-col items-center rounded-[32px] bg-[#14130f] p-10 text-center text-white">
            <ScanText size={40} className="text-[#7ee2a8]" />
            <h3 className="mt-5 font-display text-[32px] font-bold">Ingrediënten- én barcodescanner</h3>
            <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-white/70">
              Fotografeer een etiket of scan een EAN, UPC of QR-code. Productdata komt uit Open Food Facts, de tekst wordt
              op je eigen telefoon gelezen.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['EAN', 'UPC', 'QR', 'Etiket', 'Menukaart'].map((t) => (
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
          {(
            [
              [UtensilsCrossed, 'Menukaart-analyse', 'Herkent gebonden sauzen, croutons, paneermeel, sojasaus en gedeelde frituur, en geeft je vragen voor de bediening.', 'bg-white'],
              [Languages, '11 talen herkend', 'Trigo, frumento, Weizen of hvete: buitenlandse etiketten worden vertaald naar wat het is.', 'bg-[#ffd75e]'],
              [ShieldCheck, 'Veiligheidsprofiel', 'Strikte coeliakie of gevoelig: jij bepaalt of sporen rood of oranje zijn.', 'bg-white'],
              [BookOpen, 'Glutengids', 'Waar gluten schuilen, van kerststol tot bouillonblokje, met glutenvrije alternatieven.', 'bg-white'],
              [Clock3, 'Scangeschiedenis', 'Al je scans bij elkaar, te filteren op glutenvrij, twijfel of bevat gluten.', 'bg-[#7ee2a8]'],
              [Lock, 'Privé', 'Geen account, geen tracking. Je foto’s en geschiedenis blijven op je telefoon.', 'bg-white'],
            ] as const
          ).map(([Icon, title, text, bg], i) => (
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

      {/* In actie */}
      <section id="in-actie" className="scroll-mt-28 py-28">
        <div className="px-6">
          <SectionTitle eyebrow="In actie" title="Bekijk het zelf" sub="Strak, donker en duidelijk. Ontworpen om in één oogopslag te lezen, ook in een drukke supermarkt." />
        </div>
        <Carousel />
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

      {/* Vergelijking */}
      <section className="bg-[#f3eee2] px-6 py-28">
        <SectionTitle eyebrow="Vergelijk" title="Gratis, en toch completer" sub="Waarom betalen voor een tweede blik op je eten?" />
        <div data-reveal className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-neutral-200">
          <div className="grid grid-cols-[1fr_220px_220px] items-center border-b border-neutral-200 text-center">
            <span />
            <span className="flex items-center justify-center gap-2 bg-accent py-5 font-display text-[19px] font-bold text-white">
              <ScanBarcode size={20} /> Glutenscanner
            </span>
            <span className="py-5 font-display text-[17px] font-semibold text-neutral-500">Betaalde scanner-apps</span>
          </div>
          {COMPARISON.map((row) => (
            <div key={row.label} className="grid grid-cols-[1fr_220px_220px] items-center border-b border-neutral-100 text-center last:border-0">
              <span className="px-8 py-4 text-left text-[17px]">{row.label}</span>
              <span className="bg-accent/5 py-4">
                <Cell value={row.ours} ours />
              </span>
              <span className="py-4">
                <Cell value={row.paid} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Gids */}
      <section id="gids" className="scroll-mt-28 bg-[#10140f] px-6 py-28 text-white">
        <SectionTitle light eyebrow="Glutengids" title="Weet waar gluten schuilen" sub="Van kerststol tot bouillonblokje: per onderwerp waar je op let en wat je wél kunt eten." />
        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-3 gap-5">
          {GUIDE.map((c, i) => {
            const high = c.items.filter((it) => it.risk === 'hoog').length
            return (
              <article
                key={c.id}
                data-reveal
                className="flex flex-col items-center rounded-[28px] bg-white/[0.06] p-8 text-center ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.09]"
                style={{ transitionDelay: `${(i % 3) * 100}ms` }}
              >
                <h3 className="font-display text-[23px] font-bold">{c.title}</h3>
                <p className="mt-1 text-[14px] text-white/55">
                  {c.items.length} onderwerpen · <span className="text-[#ff8a80]">{high} hoog risico</span>
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {c.items.slice(0, 5).map((it) => (
                    <span
                      key={it.name}
                      className={`rounded-full px-3 py-1 text-[13px] font-medium ${
                        it.risk === 'hoog' ? 'bg-[#ff5a4e]/15 text-[#ff8a80]' : it.risk === 'middel' ? 'bg-[#ffd75e]/15 text-[#ffd75e]' : 'bg-[#7ee2a8]/15 text-[#7ee2a8]'
                      }`}
                    >
                      {it.name}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
        <div className="mt-12 flex justify-center">
          <PrimaryButton>Open de volledige gids</PrimaryButton>
        </div>
      </section>

      {/* Naar je telefoon */}
      <section className="px-6 py-28">
        <div data-reveal className="mx-auto flex max-w-5xl flex-col items-center rounded-[40px] bg-white px-10 py-16 text-center shadow-sm ring-1 ring-neutral-200">
          <SectionTitle eyebrow="Op je telefoon" title="Geen app nodig. Gewoon scannen." sub={`Richt de camera van je telefoon op de code, of ga naar ${SITE_LABEL}. De scanner start meteen.`} />
          <div className="mt-10 flex items-center gap-14">
            <QrCode />
            <ol className="flex flex-col gap-4 text-left text-[18px]">
              {[
                'Scan de QR-code met je camera',
                'Sta cameratoegang toe',
                'Optioneel: Deel → Zet op beginscherm',
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

      {/* Vragen */}
      <section id="vragen" className="scroll-mt-28 bg-[#f3eee2] px-6 py-28">
        <SectionTitle eyebrow="Vragen" title="Veelgestelde vragen" />
        <Faq />
      </section>

      {/* Slot-CTA */}
      <section className="px-6 py-28">
        <div data-reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[44px] bg-[#10140f] px-10 py-20 text-center text-white">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[700px] -translate-x-1/2 rounded-full bg-accent/30 blur-[100px]" />
          <h2 className="relative font-display text-[60px] font-extrabold leading-[1.02] tracking-tight">
            Begin vandaag.
            <br />
            <span className="text-[#7ee2a8]">Het kost je niks.</span>
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-[19px] text-white/70">
            Open de scanner en richt je camera op het eerste het beste etiket. Je ziet direct wat erin zit.
          </p>
          <div className="relative mt-10 flex justify-center">
            <PrimaryButton>Start met scannen</PrimaryButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-[#fbf8f1] px-6 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-[1.4fr_1fr_1fr] gap-10 text-[15px] text-neutral-600">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-sm leading-relaxed">
              Scan barcodes, etiketten en menukaarten op gluten. Gratis en onbeperkt, voor iedereen met coeliakie of
              glutengevoeligheid.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#14130f]">Snel naar</p>
            <a href={APP_HREF} className="hover:text-accent">De scanner</a>
            <a href="#hoe" className="hover:text-accent">Hoe het werkt</a>
            <a href="#functies" className="hover:text-accent">Functies</a>
            <a href="#gids" className="hover:text-accent">Glutengids</a>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#14130f]">Goed om te weten</p>
            <p className="leading-relaxed">{DISCLAIMER_SHORT}</p>
            <p>
              Productdata:{' '}
              <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-accent">
                Open Food Facts
              </a>{' '}
              (ODbL)
            </p>
          </div>
        </div>
        <p className="mx-auto mt-12 flex max-w-6xl items-center justify-center gap-1.5 border-t border-neutral-200 pt-8 text-[14px] text-neutral-500">
          © {YEAR} {SITE_LABEL} · Gemaakt met <Heart size={14} className="fill-[#ff5a4e] text-[#ff5a4e]" /> in Nederland
        </p>
      </footer>
    </div>
  )
}
