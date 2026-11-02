import type { ReactNode } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Languages,
  MessageCircleQuestion,
  ScanBarcode,
  Settings,
  XCircle,
} from 'lucide-react'

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

function Segmented({ mode }: { mode: 'photo' | 'barcode' }) {
  return (
    <div className="absolute inset-x-0 top-3 flex justify-center">
      <div className="flex rounded-full bg-neutral-700/80 p-0.5 text-[9px] font-semibold backdrop-blur">
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${mode === 'photo' ? 'bg-accent' : 'text-white/80'}`}>
          <Camera size={10} /> Foto
        </span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${mode === 'barcode' ? 'bg-accent' : 'text-white/80'}`}>
          <ScanBarcode size={10} /> Barcode
        </span>
      </div>
    </div>
  )
}

/** Barcode-scanner boven een "verpakking" met streepjescode. */
export function ScreenScanner() {
  return (
    <>
      <StatusBar />
      <Title>Glutenscanner</Title>
      <div className="relative flex-1 overflow-hidden bg-[linear-gradient(160deg,#e9c46a_0%,#d9a441_45%,#b07a2a_100%)]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
        <Segmented mode="barcode" />
        <div className="absolute left-1/2 top-[30%] flex aspect-[3/2] w-[74%] -translate-x-1/2 items-center justify-center rounded-2xl border-2 border-white bg-white/90">
          <div className="flex h-[55%] items-stretch gap-[2px]">
            {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3].map((w, i) => (
              <span key={i} className="bg-neutral-900" style={{ width: w }} />
            ))}
          </div>
          <span className="absolute inset-x-3 top-1/2 h-0.5 bg-accent shadow-[0_0_8px_1px] shadow-accent" />
        </div>
        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-1.5 text-[9px]">
          <span className="rounded-full bg-neutral-800/80 px-3 py-1">Richt de camera op de barcode.</span>
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
      <Title>Glutenscanner</Title>
      <div className="relative flex-1 overflow-hidden bg-[linear-gradient(170deg,#f4efe4,#e2d7c0)]">
        <Segmented mode="photo" />
        <div className="absolute inset-x-5 top-14 rounded-2xl border-2 border-accent/80 p-3 text-[8.5px] leading-relaxed text-neutral-800 shadow-[0_0_18px_rgba(31,164,99,0.45)]">
          <p className="mb-1 font-bold">Ingrediënten:</p>
          <p>
            Rijstmeel, suiker, cacaoboter, <mark className="rounded bg-danger/25 px-0.5 font-bold text-red-800">gerstemoutextract</mark>,
            zout, emulgator (sojalecithine). Kan sporen van melk bevatten.
          </p>
          <span className="absolute inset-x-3 -bottom-px h-0.5 bg-accent shadow-[0_0_8px_1px] shadow-accent" />
        </div>
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center">
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
        <span className="rounded-full bg-safe/15 px-2 py-0.5 text-[8px] font-semibold text-safe">Gecertificeerd glutenvrij</span>
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
        <span className="text-[22px] font-bold text-danger">Bevat Gluten!</span>
        <span className="text-[9px]">
          Getraceerde glutenbron: <b>tarwe (trigo)</b>
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
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-neutral-900 px-3 py-4 text-center">
        <Circle tone="warning">
          <AlertTriangle size={40} />
        </Circle>
        <span className="text-[20px] font-bold text-warning">Twijfelgeval</span>
        <span className="text-[9px] text-white/60">Croutons en dressing op de kaart</span>
      </div>
      <p className="text-center text-[8px] uppercase tracking-wide text-white/50">Vraag in het restaurant</p>
      {['Vraag de salade zonder croutons.', 'Vraag naar de dressing: soms met bloem of sojasaus.'].map((t) => (
        <div key={t} className="flex flex-col items-center gap-1 rounded-2xl bg-neutral-900 p-2 text-center text-[9px]">
          <MessageCircleQuestion size={12} className="text-safe" />
          {t}
        </div>
      ))}
    </ResultShell>
  )
}

export function ScreenGuide() {
  return (
    <>
      <StatusBar />
      <Title>Gids</Title>
      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3">
        <div className="rounded-2xl bg-accent-soft p-2.5 text-center text-[9px] ring-1 ring-accent/40">
          <b>Reiskaart voor restaurants</b>
          <br />
          <span className="text-white/70">in 10 talen</span>
        </div>
        <div className="rounded-2xl bg-neutral-900 p-3 text-center">
          <p className="text-[11px] font-semibold">Graan & risiconiveaus</p>
          {[
            ['Tarwe', 'Hoog risico', 'bg-danger/15 text-danger'],
            ['Gerst', 'Hoog risico', 'bg-danger/15 text-danger'],
            ['Haver', 'Hoog risico', 'bg-danger/15 text-danger'],
          ].map(([n, r, c]) => (
            <div key={n} className="mt-2 flex flex-col items-center gap-0.5 border-t border-white/10 pt-2 text-[10px]">
              {n}
              <span className={`rounded-full px-2 text-[8px] font-semibold ${c}`}>{r}</span>
            </div>
          ))}
          <div className="mt-2 rounded-xl bg-safe/10 p-2 text-[8.5px]">
            <p className="font-semibold text-safe">Glutenvrij alternatief</p>
            ✓ Quinoa · ✓ Boekweit · ✓ Bruine rijst
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-neutral-900 px-3 py-2.5 text-[10px]">
          Feestdagengerechten <ChevronDown size={12} />
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
      <Title>Reiskaart</Title>
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden px-3">
        <div className="flex flex-wrap justify-center gap-1 text-[8px] font-semibold">
          {['Español', 'Italiano', 'Français', 'Svenska', 'Norsk'].map((l, i) => (
            <span key={l} className={`rounded-full px-2 py-1 ${i === 1 ? 'bg-accent' : 'bg-neutral-800 text-white/80'}`}>
              {l}
            </span>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white p-4 text-center text-black">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger text-lg font-black text-white">!</span>
          <p className="text-[15px] font-bold">Sono celiaco/a</p>
          <p className="text-[9.5px] leading-relaxed">
            Non posso mangiare glutine: niente frumento, orzo, segale, farro o avena, nemmeno in salse o pangrattato…
          </p>
        </div>
        <p className="flex items-center justify-center gap-1 text-[9px] text-white/60">
          <Languages size={11} /> Laat dit scherm aan de bediening zien
        </p>
      </div>
      <MiniNav active="guide" />
    </>
  )
}
