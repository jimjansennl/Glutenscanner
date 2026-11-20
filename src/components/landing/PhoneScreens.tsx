import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Camera,
  Barcode,
  CheckCircle2,
  Clock3,
  FileText,
  Menu,
  MessageCircleQuestion,
  ScanBarcode,
  Settings,
  Star,
  XCircle,
} from 'lucide-react'
import { MENU_QUESTIONS } from '../../data/menuQuestions'

/**
 * Nagebouwde mini-versies van de echte app-schermen voor de informatiesite.
 * Geen screenshots: zo blijven ze scherp en altijd gelijk aan de app-stijl.
 */

export function Phone({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative w-[250px] rounded-[44px] border-[9px] border-neutral-950 bg-black shadow-2xl shadow-black/40 ${className}`}>
      <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-neutral-950" />
      <div className="flex h-[500px] flex-col overflow-hidden rounded-[35px] bg-black text-white">{children}</div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex h-9 shrink-0 items-end justify-between px-6 pb-1 text-[10px] font-semibold">
      <span>9:41</span>
      <span className="flex gap-1">
        <span className="h-2 w-3 rounded-sm bg-white/90" />
        <span className="h-2 w-4 rounded-sm bg-white/90" />
      </span>
    </div>
  )
}

function Title({ children }: { children: ReactNode }) {
  return <div className="shrink-0 pb-2 text-center text-[12px] font-semibold">{children}</div>
}

/** Kop van de scanner: logo links, menu rechts (zoals in de echte app). */
function ScanHeader() {
  return (
    <div className="flex shrink-0 items-center justify-between px-3.5 pb-2">
      <span className="flex items-center gap-1.5">
        <span className="flex h-5 w-5 rotate-[-6deg] items-center justify-center rounded-md bg-accent">
          <ScanBarcode size={11} />
        </span>
        <span className="font-display text-[12px] font-bold tracking-tight">glutenscanner</span>
      </span>
      <Menu size={15} />
    </div>
  )
}

/** Keuze met twee icoontjes: barcode of etiket/menukaart. */
function ModeSwitch({ active }: { active: 'barcode' | 'text' }) {
  return (
    <span className="flex rounded-full bg-neutral-800/90 p-0.5">
      {(
        [
          ['barcode', Barcode],
          ['text', FileText],
        ] as const
      ).map(([m, Icon]) => (
        <span key={m} className={`flex h-6 w-9 items-center justify-center rounded-full ${m === active ? 'bg-accent text-black' : 'text-white/70'}`}>
          <Icon size={13} />
        </span>
      ))}
    </span>
  )
}

function MiniNav({ active }: { active: 'scan' | 'history' | 'guide' | 'settings' }) {
  const tabs = [
    ['scan', Camera, 'Scan'],
    ['history', Clock3, 'Geschiedenis'],
    ['guide', BookOpen, 'Gids'],
    ['settings', Settings, 'Instellingen'],
  ] as const
  return (
    <div className="shrink-0 px-2.5 pb-3 pt-2">
      <div className="grid grid-cols-4 rounded-full bg-neutral-800 p-1 text-[7px] font-semibold">
        {tabs.map(([id, Icon, label]) => (
          <span
            key={id}
            className={`flex flex-col items-center gap-0.5 rounded-full py-1 ${id === active ? 'bg-black text-accent' : 'text-white/80'}`}
          >
            <Icon size={12} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Groot kader met groene hoeken, zoals in de echte scanner. */
function BigFrame({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`absolute rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.3)] ${className}`}>
      {['left-1.5 top-1.5 border-l-2 border-t-2 rounded-tl-md', 'right-1.5 top-1.5 border-r-2 border-t-2 rounded-tr-md', 'bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl-md', 'bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br-md'].map((c) => (
        <span key={c} className={`absolute h-4 w-4 border-accent ${c}`} />
      ))}
      {children}
    </div>
  )
}

/** Barcode-scanner boven een "verpakking" met streepjescode. */
export function ScreenScanner() {
  return (
    <>
      <StatusBar />
      <ScanHeader />
      <div className="relative flex-1 overflow-hidden bg-[linear-gradient(160deg,#e9c46a_0%,#d9a441_45%,#b07a2a_100%)]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
        <div className="absolute left-1/2 top-[30%] flex aspect-[3/2] w-[74%] -translate-x-1/2 items-center justify-center rounded-2xl border-2 border-accent bg-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.4)]">
          <div className="flex h-[55%] items-stretch gap-[2px]">
            {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3].map((w, i) => (
              <span key={i} className="bg-neutral-900" style={{ width: w }} />
            ))}
          </div>
          <span className="absolute inset-x-3 top-1/2 h-0.5 bg-accent shadow-[0_0_8px_1px] shadow-accent" />
        </div>
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 text-[9px]">
          <span className="rounded-full bg-accent/90 px-3 py-1">Barcode gevonden, even stilhouden…</span>
          <ModeSwitch active="barcode" />
        </div>
      </div>
      <MiniNav active="scan" />
    </>
  )
}

/** Fotoscan van een ingrediëntenlijst. */
export function ScreenPhoto() {
  return (
    <>
      <StatusBar />
      <ScanHeader />
      <div className="relative flex-1 overflow-hidden bg-[linear-gradient(170deg,#f4efe4,#e2d7c0)]">
        <BigFrame className="inset-x-3 bottom-[104px] top-3" />
        <div className="absolute inset-x-5 top-10 rounded-xl bg-white/60 p-3 text-[8.5px] leading-relaxed text-neutral-800 shadow-[0_0_18px_rgba(31,164,99,0.45)]">
          <p className="mb-1 font-bold">Ingrediënten:</p>
          <p>
            Rijstmeel, suiker, cacaoboter, <mark className="rounded bg-danger/25 px-0.5 font-bold text-red-800">gerstemoutextract</mark>,
            zout, emulgator (sojalecithine). Kan sporen van melk bevatten.
          </p>
          <span className="absolute inset-x-3 -bottom-px h-0.5 bg-accent shadow-[0_0_8px_1px] shadow-accent" />
        </div>
        <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
          <ModeSwitch active="text" />
          <span className="rounded-full border-[3px] border-white p-0.5">
            <span className="block h-10 w-10 rounded-full bg-white" />
          </span>
        </div>
      </div>
      <MiniNav active="scan" />
    </>
  )
}

function ResultShell({ children, product }: { children: ReactNode; product: string }) {
  return (
    <>
      <StatusBar />
      <Title>Resultaat</Title>
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3">
        <p className="text-center text-[11px] font-semibold">{product}</p>
        {children}
      </div>
      <MiniNav active="scan" />
    </>
  )
}

function Circle({ tone, children }: { tone: 'safe' | 'danger' | 'warning'; children: ReactNode }) {
  const cls = {
    safe: 'bg-safe/15 ring-safe shadow-safe/60 text-safe',
    danger: 'bg-danger/15 ring-danger shadow-danger/60 text-danger',
    warning: 'bg-warning/15 ring-warning shadow-warning/60 text-warning',
  }[tone]
  return (
    <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-[3px] shadow-[0_0_28px] ${cls}`}>
      {children}
    </span>
  )
}

export function ScreenSafe() {
  return (
    <ResultShell product="Rijstwafels naturel">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-neutral-900 px-3 py-5 text-center">
        <Circle tone="safe">
          <CheckCircle2 size={44} />
        </Circle>
        <span className="text-[22px] font-bold text-safe">Glutenvrij</span>
        <span className="rounded-full bg-safe/15 px-2 py-0.5 text-[8px] font-semibold text-safe">Met glutenvrij-logo</span>
        <span className="text-[9px] text-white/60">Geen glutenbronnen in ingrediënten en allergenen.</span>
      </div>
      <div className="rounded-2xl bg-neutral-900 p-3 text-center text-[9px] text-white/80">
        <p className="mb-1 text-[8px] uppercase tracking-wide text-white/50">Ingrediënten</p>
        Volkoren rijst 99%, zeezout
      </div>
    </ResultShell>
  )
}

export function ScreenDanger() {
  return (
    <ResultShell product="Galletas María">
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-neutral-900 px-3 py-5 text-center">
        <Circle tone="danger">
          <XCircle size={44} />
        </Circle>
        <span className="text-[22px] font-bold text-danger">Bevat gluten</span>
        <span className="text-[9px]">
          Gevonden: <b>tarwe (trigo)</b>
        </span>
      </div>
      <div className="flex flex-col gap-1.5 rounded-2xl bg-neutral-900 p-2.5 text-center text-[9px]">
        <span className="mx-auto rounded-full bg-danger/15 px-2 py-0.5 font-semibold text-danger">Tarwe</span>
        trigo → tarwe
        <span className="mx-auto rounded-full bg-danger/15 px-2 py-0.5 font-semibold text-danger">Gerst</span>
        cebada → gerst
      </div>
    </ResultShell>
  )
}

export function ScreenMenu() {
  return (
    <ResultShell product="Menukaart">
      <div className="flex flex-col items-center gap-1.5 rounded-3xl bg-neutral-900 px-3 py-3 text-center">
        <Circle tone="warning">
          <AlertTriangle size={36} />
        </Circle>
        <span className="text-[18px] font-bold text-warning">Twijfel</span>
      </div>
      <p className="flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wide text-warning">
        <MessageCircleQuestion size={10} />
        Vraag de bediening
      </p>
      {(
        [
          ['croutons', 'Croutons'],
          ['dressing', 'Dressing'],
        ] as const
      ).map(([term, label]) => (
        <div key={label} className="rounded-2xl bg-neutral-900 p-2.5 text-left">
          <p className="text-[7.5px] text-white/50">
            Bij <b className="text-white/80">{term}</b>
          </p>
          <p className="text-[9.5px] font-semibold leading-snug">{MENU_QUESTIONS[label].nl}</p>
        </div>
      ))}
    </ResultShell>
  )
}

/** Buitenlands etiket: origineel met gluten gemarkeerd, en "Lees mee in het Nederlands". */
export function ScreenReadAlong() {
  return (
    <ResultShell product="Petits beurre">
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-2.5">
        <XCircle size={20} className="text-danger" />
        <span className="text-[15px] font-bold text-danger">Bevat gluten</span>
      </div>
      <div className="rounded-2xl bg-neutral-900 p-2.5 text-center text-[9px] leading-relaxed text-white/85">
        <p className="mb-1 text-[7.5px] uppercase tracking-wide text-white/50">Ingrediënten</p>
        Farine de <mark className="rounded bg-danger/20 px-0.5 font-semibold text-danger">blé</mark> 75%, sucre, beurre, sel, poudres à lever
      </div>
      <div className="mx-auto flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[8px] font-semibold">Lees mee in het Nederlands</div>
      <div className="rounded-2xl bg-white/[0.07] p-2.5 text-left text-[9px] leading-relaxed">
        <p className="mb-0.5 text-[7.5px] text-white/50">Vertaald uit het Frans</p>
        <mark className="rounded bg-danger/20 px-0.5 font-semibold text-danger">tarwebloem</mark> 75%, suiker, boter, zout, rijsmiddelen
      </div>
    </ResultShell>
  )
}

/** Rood product met "Probeer liever": glutenvrije producten van dezelfde soort. */
export function ScreenAlternative() {
  return (
    <ResultShell product="Kaneelkoeken">
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-2.5">
        <XCircle size={20} className="text-danger" />
        <span className="text-[15px] font-bold text-danger">Bevat gluten</span>
      </div>
      <p className="text-center text-[8px] font-bold uppercase tracking-wide text-safe">Probeer liever</p>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          ['Rijstkoekjes', 'bg-[#e9c995]'],
          ['Maïswafels', 'bg-[#f3df9b]'],
          ['Kokosmakronen', 'bg-[#f1ece2]'],
          ['Havermout-koek', 'bg-[#d9b27a]'],
        ].map(([name, color]) => (
          <div key={name} className="flex flex-col items-center gap-1 rounded-xl bg-neutral-900 p-2 text-center">
            <span className={`h-9 w-9 rounded-lg ${color}`} />
            <span className="text-[8.5px] font-semibold leading-tight">{name}</span>
            <span className="flex items-center gap-0.5 text-[7px] font-semibold text-safe">
              <span className="h-1.5 w-1.5 rounded-full bg-safe" />
              Glutenvrij
            </span>
          </div>
        ))}
      </div>
    </ResultShell>
  )
}

/** Vast product opnieuw gescand: het recept is veranderd. */
export function ScreenRecipe() {
  return (
    <ResultShell product="Chocoladepasta">
      <span className="mx-auto flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-[8px] font-semibold text-warning">
        <Star size={9} fill="currentColor" />
        Bij onze vaste producten
      </span>
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-2.5">
        <XCircle size={20} className="text-danger" />
        <span className="text-[15px] font-bold text-danger">Bevat gluten</span>
      </div>
      <div className="flex flex-col gap-1 rounded-2xl bg-warning/15 p-2.5 text-left ring-1 ring-warning">
        <p className="flex items-center gap-1 text-[11px] font-extrabold text-warning">
          <AlertTriangle size={12} />
          Het recept is veranderd!
        </p>
        <p className="text-[8.5px] leading-snug text-white/85">
          Sinds je laatste scan staan er andere ingrediënten op. <b className="text-white">Eerst was hij groen, nu rood.</b>
        </p>
        <p className="text-[8.5px]">
          <b>Nieuw:</b> tarwebloem
        </p>
      </div>
    </ResultShell>
  )
}

export function ScreenGuide() {
  return (
    <>
      <StatusBar />
      <Title>Gids</Title>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 text-left">
        <p className="text-center text-[14px] font-extrabold leading-tight">Mag ik dit eten?</p>
        <div className="flex items-center justify-between rounded-full bg-white py-0.5 pl-2.5 pr-0.5 text-[9px] text-black">🔍 couscous<span className="rounded-full bg-accent px-2 py-0.5 text-[8px] font-semibold text-white">Zoek</span></div>
        <div className="rounded-2xl bg-danger/15 p-2.5 ring-1 ring-danger/40">
          <p className="text-[13px] font-extrabold leading-none text-danger">Nee</p>
          <p className="text-[8px] text-white/70">Bevat gluten</p>
          <p className="mt-1.5 text-[11px] font-bold">Couscous</p>
          <p className="text-[8.5px] leading-snug text-white/80">Kleine korrels gemaakt van tarwe.</p>
          <p className="mt-1.5 text-[7px] font-bold uppercase text-safe">Neem liever</p>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {['Quinoa', 'Gierst'].map((t) => (
              <span key={t} className="rounded-full bg-safe/15 px-1.5 py-0.5 text-[8px]">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[
            ['Nee', 'text-danger ring-white/10 bg-neutral-900'],
            ['Let op', 'text-warning ring-white/10 bg-neutral-900'],
            ['Mag', 'text-safe ring-white/10 bg-neutral-900'],
          ].map(([w, c]) => (
            <span key={w} className={`rounded-xl py-1.5 text-center text-[9px] font-extrabold ring-1 ${c}`}>
              {w}
            </span>
          ))}
        </div>
      </div>
      <MiniNav active="guide" />
    </>
  )
}

export function ScreenTravel() {
  return (
    <>
      <StatusBar />
      <Title>Kaart voor de bediening</Title>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 text-left">
        <div className="flex items-center gap-2 rounded-xl bg-neutral-900 px-2.5 py-1.5 ring-1 ring-white/10">
          <span className="text-[14px] leading-none">🇮🇹</span>
          <span className="flex-1 text-[10px] font-semibold">Italiano</span>
          <span className="rounded-full bg-accent/20 px-1.5 text-[7px] font-semibold text-accent">Hier</span>
        </div>
        <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-3 text-black">
          <p className="text-[13px] font-extrabold leading-tight">Sono celiaco/a</p>
          <p className="text-[8.5px] font-semibold leading-snug">Non posso mangiare glutine. Anche una piccolissima quantità è troppo.</p>
          {[
            ['Niente di questo nel mio piatto', 'Frumento, orzo, segale, farro…', 'bg-[#ffe3e0] text-[#c0281d]'],
            ['In cucina', 'Padella e tagliere puliti…', 'bg-[#fff1d6] text-[#a35f00]'],
            ['Di solito va bene', 'Riso, patate, carne, pesce…', 'bg-[#e3f6ea] text-[#137a46]'],
          ].map(([h, t, c]) => (
            <div key={h} className={`rounded-lg px-2 py-1 ${c}`}>
              <p className="text-[8px] font-bold">{h}</p>
              <p className="text-[7.5px] text-black/80">{t}</p>
            </div>
          ))}
        </div>
      </div>
      <MiniNav active="guide" />
    </>
  )
}
