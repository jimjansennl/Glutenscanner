import '@fontsource-variable/bricolage-grotesque'
import { useEffect, useRef } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { AlertTriangle, CheckCircle2, FileText, ScanBarcode, UtensilsCrossed, XCircle, type LucideIcon } from 'lucide-react'
import { DISCLAIMER_SHORT } from '../ui/DisclaimerModal'

/**
 * Informatiesite voor de desktop: alles op één scherm, zonder scrollen.
 * De scanner zelf heeft een telefooncamera nodig; daarom staat de QR-code centraal.
 */
const SITE_URL = 'https://www.glutenscanner.nl'
const SITE_LABEL = 'glutenscanner.nl'

function QrCode({ size }: { size: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const svg = new BrowserQRCodeSvgWriter().write(SITE_URL, size, size)
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', `QR-code naar ${SITE_LABEL}`)
    ref.current?.replaceChildren(svg)
  }, [size])
  return <div ref={ref} style={{ width: size, height: size }} />
}

const WAYS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ScanBarcode, title: 'Barcode', text: 'Richt de camera op de streepjescode. Hij leest hem vanzelf.' },
  { icon: FileText, title: 'Etiket', text: 'Maak een foto van de ingrediënten. Ook buitenlandse etiketten.' },
  { icon: UtensilsCrossed, title: 'Menukaart', text: 'Maak een foto van het menu en krijg vragen voor de bediening.' },
]

const COLORS: { icon: LucideIcon; label: string; text: string; cls: string }[] = [
  { icon: CheckCircle2, label: 'Glutenvrij', text: 'Mag je eten', cls: 'bg-[#e3f6ea] text-[#137a46]' },
  { icon: AlertTriangle, label: 'Twijfel', text: 'Lees het etiket of vraag het na', cls: 'bg-[#fff1d6] text-[#a35f00]' },
  { icon: XCircle, label: 'Bevat gluten', text: 'Niet eten', cls: 'bg-[#ffe3e0] text-[#c0281d]' },
]

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-col bg-[#fbf8f1] text-[#14130f] [color-scheme:light]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 pt-6">
        <span className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white">
            <ScanBarcode size={21} />
          </span>
          <span className="font-display text-[21px] font-bold tracking-tight">glutenscanner</span>
        </span>
        <span className="text-[15px] text-neutral-500">Gratis · geen account · geen app nodig</span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-[1fr_360px] items-center gap-14 px-8 py-6">
        <div>
          <h1 className="font-display text-[clamp(38px,3.9vw,58px)] font-extrabold leading-[1.04] tracking-tight">
            Zit er gluten in?
            <br />
            <span className="text-accent">Scan het en je weet het.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[19px] leading-relaxed text-neutral-600">
            In de supermarkt, thuis of in een restaurant. Open de scanner op je telefoon en richt de camera op:
          </p>

          <ul className="mt-5 grid grid-cols-3 gap-4">
            {WAYS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-3xl bg-white px-5 py-4 ring-1 ring-neutral-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#14130f] text-white">
                  <Icon size={22} />
                </span>
                <h2 className="mt-3 font-display text-[21px] font-bold">{title}</h2>
                <p className="mt-1 text-[15px] leading-snug text-neutral-600">{text}</p>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-[14px] font-bold uppercase tracking-[0.12em] text-neutral-500">Wat betekent de kleur?</h2>
          <ul className="mt-3 grid grid-cols-3 gap-4">
            {COLORS.map(({ icon: Icon, label, text, cls }) => (
              <li key={label} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${cls}`}>
                <Icon size={28} className="shrink-0" />
                <span className="leading-tight">
                  <b className="block text-[17px]">{label}</b>
                  <span className="text-[14px] opacity-90">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex flex-col items-center rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <h2 className="font-display text-[26px] font-bold">Open op je telefoon</h2>
          <p className="mt-1 text-[16px] text-neutral-600">Richt de camera van je telefoon op deze code.</p>
          <div className="mt-5 rounded-2xl p-2 ring-1 ring-neutral-200">
            <QrCode size={180} />
          </div>
          <p className="mt-4 text-[16px] text-neutral-600">
            of ga naar <b className="text-accent">{SITE_LABEL}</b>
          </p>
          <p className="mt-5 border-t border-neutral-200 pt-5 text-[14px] leading-relaxed text-neutral-500">
            Tip: tik in je browser op <b>Deel</b> en dan <b>Zet op beginscherm</b>. Dan staat hij tussen je apps.
          </p>
        </aside>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-8 pb-5 text-center text-[13px] leading-relaxed text-neutral-500">
        Ook in de app: een glutengids, je eerdere scans en een reiskaart voor restaurants in het buitenland. Foto&apos;s
        blijven op je telefoon.
        <br />
        {DISCLAIMER_SHORT} Productgegevens:{' '}
        <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline hover:text-accent">
          Open Food Facts
        </a>
        .
      </footer>
    </div>
  )
}
