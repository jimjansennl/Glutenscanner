import { useEffect, useRef } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import {
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Infinity as InfinityIcon,
  Languages,
  Lock,
  ScanBarcode,
  ScanText,
  Settings,
  ShieldCheck,
  Smartphone,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from 'lucide-react'
import { GUIDE } from '../../data/glutenGuide'
import { DISCLAIMER_SHORT } from '../ui/DisclaimerModal'

const APP_HREF = '#app'

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
        <ScanBarcode size={20} />
      </span>
      <span className={`text-[19px] font-bold tracking-tight ${dark ? 'text-white' : 'text-neutral-900'}`}>Glutenscanner</span>
    </span>
  )
}

/** QR-code naar deze site, zodat je de scanner direct op je telefoon opent. */
function QrCode({ size = 168 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const url = window.location.origin + window.location.pathname
    const svg = new BrowserQRCodeSvgWriter().write(url, size, size)
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', `QR-code naar ${url}`)
    el.replaceChildren(svg)
  }, [size])
  return <div ref={ref} className="rounded-2xl bg-white p-2" style={{ width: size + 16, height: size + 16 }} />
}

/** Telefoon-mockup met de echte app-opbouw: titelbalk, Foto/Barcode, kader en een resultaat. */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] rounded-[46px] border-[10px] border-neutral-950 bg-black shadow-2xl shadow-black/50">
      <div className="absolute left-1/2 top-2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-neutral-950" />
      <div className="flex h-[540px] flex-col overflow-hidden rounded-[36px] bg-black text-white">
        <div className="flex h-14 items-end justify-center pb-2 text-[13px] font-semibold">Glutenscanner</div>
        <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_30%_30%,#c79a5b_0,#7a5532_35%,#3a2a1c_70%)]">
          <div className="absolute inset-x-0 top-3 flex justify-center">
            <div className="flex rounded-full bg-neutral-700/80 p-0.5 text-[10px] font-semibold">
              <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-white/80">
                <Camera size={11} /> Foto
              </span>
              <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1">
                <ScanBarcode size={11} /> Barcode
              </span>
            </div>
          </div>
          <div className="absolute left-1/2 top-[22%] aspect-[3/2] w-[72%] -translate-x-1/2 rounded-2xl border-2 border-white">
            <span className="absolute inset-x-3 top-1/2 h-0.5 bg-accent shadow-[0_0_8px_1px] shadow-accent" />
          </div>
          <div className="absolute inset-x-3 bottom-3 flex flex-col items-center gap-2 rounded-3xl bg-neutral-900/95 p-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-safe/15 ring-2 ring-safe shadow-[0_0_20px] shadow-safe/50">
              <CheckCircle2 size={32} className="text-safe" />
            </span>
            <span className="text-[19px] font-bold text-safe">Glutenvrij</span>
            <span className="text-[10px] text-white/60">Geen glutenbronnen in ingrediënten en allergenen</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-1 border-t border-white/10 bg-neutral-900 px-2 py-2 text-[8px] font-semibold">
          {[
            [Camera, 'Scan', true],
            [Clock3, 'Geschiedenis', false],
            [BookOpen, 'Gids', false],
            [Settings, 'Instellingen', false],
          ].map(([Icon, label, active]) => {
            const I = Icon as LucideIcon
            return (
              <span key={label as string} className={`flex flex-col items-center gap-0.5 ${active ? 'text-accent' : 'text-white/80'}`}>
                <I size={14} />
                {label as string}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: 'Richt & scan',
    text: 'Open de scanner en richt je camera op een barcode, ingrediëntenlijst of menukaart. Geen typen nodig.',
  },
  {
    title: 'Bekijk het resultaat',
    text: "Een duidelijke uitslag: 'Glutenvrij', 'Twijfelgeval' of 'Bevat gluten!', met uitleg. Verborgen bronnen zoals gerstemoutextract worden gemarkeerd.",
  },
  {
    title: 'Dubbelcheck & bewaar',
    text: 'Je scans staan in je geschiedenis, gefilterd op status. Controleer daarna altijd de verpakking: dit is je tweede blik.',
  },
]

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ScanText,
    title: 'Ingrediëntenscanner',
    text: 'Fotografeer een etiket: de tekst wordt op je eigen toestel gelezen en direct op gluten gecontroleerd.',
  },
  {
    icon: ScanBarcode,
    title: 'Barcodescanner',
    text: 'EAN, UPC en QR. Ingrediënten en allergenen komen uit de open database van Open Food Facts. Onbeperkt.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menukaart-analyse',
    text: 'Herkent restaurantrisico’s zoals gebonden sauzen, croutons, paneermeel, sojasaus en gedeelde frituur, met vragen voor de bediening.',
  },
  {
    icon: Languages,
    title: 'Herkent 11 talen',
    text: 'Trigo, frumento, Weizen of hvete: buitenlandse termen worden herkend en in het Nederlands gemeld.',
  },
  {
    icon: ShieldCheck,
    title: 'Veiligheidsprofiel',
    text: 'Strikte coeliakie (sporen = rood) of gevoelig (sporen = oranje). Je hele geschiedenis past zich direct aan.',
  },
  {
    icon: Lock,
    title: 'Privé',
    text: 'Geen account, geen tracking. Foto’s verlaten je toestel niet; profiel en geschiedenis blijven op je telefoon.',
  },
]

const COMPARISON: { label: string; ours: string | boolean; paid: string | boolean }[] = [
  { label: 'Prijs', ours: 'Gratis', paid: 'Abonnement' },
  { label: 'Aantal scans', ours: 'Onbeperkt', paid: 'Vaak maar 1 gratis scan' },
  { label: 'Account nodig', ours: 'Nee', paid: 'Vaak wel' },
  { label: 'Barcode- én ingrediëntenscan', ours: true, paid: true },
  { label: 'Tekstherkenning op je eigen toestel', ours: true, paid: false },
  { label: 'Menukaart-analyse met vragen voor de bediening', ours: true, paid: false },
  { label: 'Reiskaart in 10 talen', ours: true, paid: false },
  { label: 'Veiligheidsprofiel (strikt / gevoelig)', ours: true, paid: true },
]

const FAQ = [
  {
    q: 'Is het echt helemaal gratis?',
    a: 'Ja. Geen proefperiode, geen scanlimiet, geen abonnement en geen account. Alle functies zijn voor iedereen beschikbaar.',
  },
  {
    q: 'Moet ik een app installeren?',
    a: 'Nee. Open deze site op je telefoon en de scanner start direct. Via "Deel → Zet op beginscherm" staat hij als app op je telefoon.',
  },
  {
    q: 'Worden mijn foto’s geüpload?',
    a: 'Nee. De tekstherkenning draait in je browser. Alleen bij een barcodescan wordt de barcode opgezocht bij Open Food Facts.',
  },
  {
    q: 'Hoe betrouwbaar is de uitslag?',
    a: 'De scanner is een tweede blik, geen vervanging van het etiket. Productdata kan onvolledig zijn en recepten veranderen. Bij twijfel kiest de app altijd voor de voorzichtige uitslag.',
  },
  {
    q: 'Werkt het in het buitenland?',
    a: 'Ja. De analyse herkent glutentermen in 11 Europese talen en de reiskaart legt coeliakie uit aan de bediening in 10 talen.',
  },
]

function Cell({ value, highlight = false }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`mx-auto ${highlight ? 'text-accent' : 'text-neutral-500'}`} size={22} strokeWidth={3} aria-label="Ja" />
    ) : (
      <X className="mx-auto text-neutral-300" size={22} strokeWidth={3} aria-label="Nee" />
    )
  }
  return <span className={highlight ? 'font-semibold text-accent' : 'text-neutral-600'}>{value}</span>
}

export function LandingPage() {
  return (
    <div className="min-h-full bg-[#f7f5f0] text-neutral-900 [color-scheme:light]">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-7 text-[15px] text-neutral-600">
            <a href="#stappen" className="hover:text-neutral-900">Hoe het werkt</a>
            <a href="#functies" className="hover:text-neutral-900">Functies</a>
            <a href="#gids" className="hover:text-neutral-900">Glutengids</a>
            <a href="#vergelijk" className="hover:text-neutral-900">Vergelijk</a>
            <a href="#faq" className="hover:text-neutral-900">Vragen</a>
          </nav>
          <a href={APP_HREF} className="rounded-lg bg-accent px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#178a52]">
            Open de scanner
          </a>
        </div>
      </header>

      <section className="bg-[#1b1a17] text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-[1.15fr_1fr] items-center gap-12 px-6 py-20">
          <div>
            <h1 className="text-[56px] font-bold leading-[1.04] tracking-tight">
              Scan voedseletiketten op <span className="text-safe">gluten</span> in seconden
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-white/75">
              Richt je camera op een barcode, ingrediëntenlijst of menukaart en zie direct of het glutenvrij is. Een snelle
              tweede blik, helemaal gratis.
            </p>
            <ul className="mt-6 flex flex-col gap-3 text-[16px] text-white/90">
              {[
                [ScanText, 'Ingrediënten en menukaarten scannen op gluten'],
                [ScanBarcode, 'Barcodescanner met productdatabase'],
                [UtensilsCrossed, 'Herkent verborgen bronnen en restaurantrisico’s'],
                [InfinityIcon, 'Onbeperkt scannen, zonder account of abonnement'],
              ].map(([Icon, text]) => {
                const I = Icon as LucideIcon
                return (
                  <li key={text as string} className="flex items-center gap-3">
                    <I size={18} className="text-safe" />
                    {text as string}
                  </li>
                )
              })}
            </ul>
            <div className="mt-8 flex items-center gap-4">
              <a href={APP_HREF} className="rounded-xl bg-accent px-6 py-3.5 text-[17px] font-semibold hover:bg-[#178a52]">
                Open de scanner
              </a>
              <a href="#telefoon" className="flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-[17px] font-semibold hover:bg-white/5">
                <Smartphone size={18} />
                Op je telefoon
              </a>
            </div>
            <p className="mt-4 flex gap-5 text-[14px] text-white/55">
              {['100% gratis', 'Onbeperkt scannen', 'Geen account'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-safe" />
                  {t}
                </span>
              ))}
            </p>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute inset-x-6 bottom-10 top-0 rounded-[40px] bg-accent" />
            <div className="relative flex flex-col items-center gap-4 pt-8">
              <p className="text-center text-[44px] font-black uppercase leading-none tracking-tight">
                Gratis
                <span className="block text-[26px] text-[#f5c542]">onbeperkt scannen</span>
              </p>
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-neutral-200 bg-[#fdfcf9]">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-10 px-6 py-5 text-[15px] text-neutral-600">
          {[
            [ScanText, 'Ingrediëntenscanner'],
            [ScanBarcode, 'Barcodescanner'],
            [Languages, '11 talen'],
            [Lock, 'Tekstherkenning op je toestel'],
          ].map(([Icon, text]) => {
            const I = Icon as LucideIcon
            return (
              <span key={text as string} className="flex items-center gap-2">
                <I size={17} className="text-accent" />
                {text as string}
              </span>
            )
          })}
          <span className="font-medium italic text-neutral-900">Scan · Detecteer · Dubbelcheck</span>
        </div>
      </div>

      <section id="stappen" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <h2 className="text-[44px] font-bold tracking-tight">Een etiket controleren in 3 stappen</h2>
        <p className="mt-2 text-[17px] text-neutral-600">Van schap tot winkelwagen, met een snelle tweede controle</p>
        <ol className="mt-12 grid grid-cols-3 divide-x divide-neutral-200">
          {STEPS.map((s, i) => (
            <li key={s.title} className="px-8 first:pl-0">
              <span className="text-[44px] font-light text-accent">{i + 1}</span>
              <h3 className="mt-2 text-[20px] font-bold">{s.title}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-neutral-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="functies" className="scroll-mt-20 bg-[#f1eee6] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="max-w-3xl text-[44px] font-bold leading-tight tracking-tight">
            Alles wat je nodig hebt om glutenvrij te eten
          </h2>
          <p className="mt-2 text-[17px] text-neutral-600">Krachtige scantools in een eenvoudige interface, zonder betaalmuur</p>
          <div className="mt-12 grid grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-neutral-200 bg-[#fdfcf9] p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 text-[19px] font-bold">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="vergelijk" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-24">
        <h2 className="text-center text-[44px] font-bold tracking-tight">Gratis, en toch completer</h2>
        <p className="mt-2 text-center text-[17px] text-neutral-600">Waarom betalen voor een tweede blik op je eten?</p>
        <table className="mt-10 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-[#fdfcf9] text-[16px]">
          <thead>
            <tr className="border-b border-neutral-200 text-left">
              <th className="p-4 font-semibold text-neutral-500" />
              <th className="w-56 bg-accent/10 p-4 text-center font-bold text-accent">Glutenscanner</th>
              <th className="w-56 p-4 text-center font-semibold text-neutral-500">Betaalde scanner-apps</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.label} className="border-b border-neutral-100 last:border-0">
                <td className="p-4">{row.label}</td>
                <td className="bg-accent/5 p-4 text-center">
                  <Cell value={row.ours} highlight />
                </td>
                <td className="p-4 text-center">
                  <Cell value={row.paid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="gids" className="scroll-mt-20 bg-[#1b1a17] py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-[44px] font-bold tracking-tight">De Glutengids</h2>
          <p className="mt-2 text-[17px] text-white/65">
            Waar gluten schuilen, waar je op let en wat je wél kunt eten. In de app uitklapbaar en doorzoekbaar.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-5">
            {GUIDE.map((c) => {
              const high = c.items.filter((i) => i.risk === 'hoog').length
              return (
                <article key={c.id} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                  <h3 className="text-[19px] font-bold">{c.title}</h3>
                  <p className="mt-1 text-[14px] text-white/55">
                    {c.items.length} onderwerpen · {high} hoog risico
                  </p>
                  <ul className="mt-4 flex flex-col gap-1.5 text-[15px] text-white/80">
                    {c.items.slice(0, 4).map((i) => (
                      <li key={i.name} className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${i.risk === 'hoog' ? 'bg-danger' : i.risk === 'middel' ? 'bg-warning' : 'bg-safe'}`} />
                        {i.name}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="telefoon" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-24">
        <div className="flex items-center gap-12 rounded-3xl border border-neutral-200 bg-[#fdfcf9] p-10">
          <QrCode />
          <div>
            <h2 className="text-[34px] font-bold tracking-tight">Open de scanner op je telefoon</h2>
            <ol className="mt-4 flex flex-col gap-2 text-[17px] text-neutral-700">
              <li>1. Scan deze QR-code met de camera van je telefoon.</li>
              <li>2. Sta cameratoegang toe: de scanner start direct.</li>
              <li>3. Tip: kies &quot;Deel → Zet op beginscherm&quot; voor een app-icoon.</li>
            </ol>
            <a href={APP_HREF} className="mt-6 inline-block text-[16px] font-semibold text-accent hover:underline">
              Of probeer de scanner hier in je browser →
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 bg-[#f1eee6] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-[44px] font-bold tracking-tight">Veelgestelde vragen</h2>
          <div className="mt-10 flex flex-col gap-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-neutral-200 bg-[#fdfcf9] p-5 open:pb-6">
                <summary className="flex cursor-pointer list-none items-center justify-between text-[18px] font-semibold">
                  {q}
                  <ChevronDown size={20} className="text-neutral-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[16px] leading-relaxed text-neutral-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#1b1a17] py-12 text-white/60">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-10 px-6 text-[14px]">
          <div className="flex flex-col gap-3">
            <Logo dark />
            <p className="max-w-md leading-relaxed">{DISCLAIMER_SHORT}</p>
          </div>
          <p className="max-w-sm text-right leading-relaxed">
            Productgegevens van{' '}
            <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-white">
              Open Food Facts
            </a>{' '}
            (ODbL). Gratis en zonder advertenties.
          </p>
        </div>
      </footer>
    </div>
  )
}
