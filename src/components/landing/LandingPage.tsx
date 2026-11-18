import '@fontsource-variable/bricolage-grotesque'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Infinity as InfinityIcon,
  ScanBarcode,
  ScanText,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { DISCLAIMER_SHORT } from '../ui/DisclaimerModal'
import { Panel } from './LandingPanels'
import { PANELS, type PanelId } from './panels'
import { Phone, ScreenDanger, ScreenSafe, ScreenScanner } from './PhoneScreens'

/**
 * Op de desktop is dit een informatiesite: de scanner heeft een telefooncamera nodig.
 * Alle knoppen wijzen daarom naar de QR-code; op de telefoon opent dezelfde site als scanner.
 */
const PHONE_HREF = '#telefoon'
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

function PrimaryButton({ children, href = PHONE_HREF }: { children: ReactNode; href?: string }) {
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

const WAYS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ScanBarcode, title: 'Barcode', text: 'Kies Barcode en richt de camera op de streepjescode. Hij leest hem vanzelf.' },
  { icon: ScanText, title: 'Etiket', text: 'Kies Foto en fotografeer de ingrediënten. Ook buitenlandse etiketten.' },
  { icon: UtensilsCrossed, title: 'Menukaart', text: 'Kies Foto en fotografeer het menu. Je krijgt vragen voor de bediening.' },
]

const COLORS: { icon: LucideIcon; label: string; text: string; cls: string }[] = [
  { icon: CheckCircle2, label: 'Glutenvrij', text: 'Mag je eten', cls: 'bg-[#7ee2a8]/15 text-[#7ee2a8] ring-1 ring-[#7ee2a8]/25' },
  { icon: AlertTriangle, label: 'Twijfel', text: 'Lees het etiket of vraag het na', cls: 'bg-[#ffd75e]/15 text-[#ffd75e] ring-1 ring-[#ffd75e]/25' },
  { icon: XCircle, label: 'Bevat gluten', text: 'Niet eten', cls: 'bg-[#ff5a4e]/15 text-[#ff8a80] ring-1 ring-[#ff5a4e]/25' },
]

export function LandingPage() {
  useReveal()
  const [panel, setPanel] = useState<PanelId | null>(null)
  const closePanel = useCallback(() => setPanel(null), [])
  return (
    <div className="min-h-full overflow-x-hidden bg-[#fbf8f1] text-[#14130f] [color-scheme:light]">
      {/* Navigatie */}
      <header className="fixed inset-x-0 top-4 z-40 px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#14130f]/80 pl-5 pr-2 shadow-2xl backdrop-blur-xl">
          <Logo light />
          <nav className="flex items-center gap-1 font-display text-[17px] font-bold tracking-tight text-white">
            <a href="#hoe" className="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#7ee2a8]">
              Hoe het werkt
            </a>
            {PANELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPanel(id)}
                aria-pressed={panel === id}
                className={`rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-[#7ee2a8] ${panel === id ? 'bg-white/10 text-[#7ee2a8]' : ''}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <a href={PHONE_HREF} onClick={closePanel} className="flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-display text-[16px] font-bold text-white transition hover:bg-[#1a9258]">
            <Smartphone size={17} />
            Op je telefoon
          </a>
        </div>
      </header>

      {panel && <Panel id={panel} onClose={closePanel} />}

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

      {/* Hoe het werkt + naar je telefoon: alles wat je moet weten in één blok */}
      <section id="hoe" className="scroll-mt-24 border-t border-white/10 bg-[#10140f] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_360px] items-center gap-12">
          <div data-reveal>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-bold uppercase tracking-[0.14em] text-[#7ee2a8]">
              Hoe het werkt
            </span>
            <h2 className="mt-5 font-display text-[44px] font-bold leading-[1.05] tracking-tight">Richt, tik, klaar.</h2>
            <ul className="mt-7 grid grid-cols-3 gap-4">
              {WAYS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-[28px] bg-white/[0.06] p-6 ring-1 ring-white/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-lg shadow-accent/30">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-4 font-display text-[22px] font-bold">{title}</h3>
                  <p className="mt-1 text-[15px] leading-snug text-white/65">{text}</p>
                </li>
              ))}
            </ul>
            <ul className="mt-4 grid grid-cols-3 gap-4">
              {COLORS.map(({ icon: Icon, label, text, cls }) => (
                <li key={label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${cls}`}>
                  <Icon size={28} className="shrink-0" />
                  <span className="leading-tight">
                    <b className="block font-display text-[17px]">{label}</b>
                    <span className="text-[14px] opacity-90">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <aside
            id="telefoon"
            data-reveal
            className="flex scroll-mt-24 flex-col items-center rounded-[36px] bg-accent p-8 text-center text-white shadow-2xl shadow-accent/30"
          >
            <h2 className="font-display text-[26px] font-bold">Open op je telefoon</h2>
            <p className="mt-1 text-[16px] text-white/85">Richt je camera op de code. Geen app, geen account.</p>
            <div className="mt-6">
              <QrCode size={168} />
            </div>
            <p className="mt-5 font-display text-[22px] font-bold">{SITE_LABEL}</p>
            <p className="mt-4 border-t border-white/20 pt-4 text-[14px] leading-relaxed text-white/80">
              Tip: tik op <b className="text-white">Deel</b> en dan <b className="text-white">Zet op beginscherm</b>.
            </p>
          </aside>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#10140f] px-6 py-8 text-center text-[14px] leading-relaxed text-white/45">
        <p>
          Ook in de app: glutengids, je eerdere scans en een reiskaart in 10 talen. Foto&apos;s blijven op je telefoon.
        </p>
        <p className="mt-1">
          {DISCLAIMER_SHORT} Productdata:{' '}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-[#7ee2a8]">
            Open Food Facts
          </a>
          . © {YEAR} {SITE_LABEL}
        </p>
      </footer>
    </div>
  )
}
