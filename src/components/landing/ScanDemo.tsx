import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  FileText,
  Flashlight,
  Image as ImageIcon,
  MessageCircleQuestion,
  UtensilsCrossed,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { MENU_QUESTIONS } from '../../data/menuQuestions'
import { Circle, ModeSwitch, Phone, ScanHeader, StatusBar } from './PhoneScreens'

/**
 * Bewegend voorbeeld op de startpagina, met drie verhaaltjes na elkaar:
 * barcode (rijstwafels → groen), etiket (koekjes → rood, gerstemoutextract) en
 * menukaart (→ oranje, met een vraag voor de bediening). Niets te kiezen: het speelt vanzelf
 * alles af. De drie stappen ernaast lichten mee op; een labeltje in beeld zegt wat er gescand wordt.
 * Eigen ontwerp in de stijl van de site, geen beelden van anderen.
 */

const STEP_MS = 3400

type SceneId = 'barcode' | 'label' | 'menu'

const SCENES: { id: SceneId; label: string; icon: LucideIcon }[] = [
  { id: 'barcode', label: 'Barcode', icon: Barcode },
  { id: 'label', label: 'Etiket', icon: FileText },
  { id: 'menu', label: 'Menukaart', icon: UtensilsCrossed },
]

/** Dezelfde drie stappen voor alles: er hoeft niets gekozen te worden. */
const STEPS = [
  { title: 'Richt je camera', text: 'Op een barcode, een etiket of een menukaart.' },
  { title: 'Hij leest het', text: 'Een barcode leest hij vanzelf. Bij een etiket of menukaart tik je op de knop.' },
  { title: 'Zie de uitslag', text: 'Groen, oranje of rood, met uitleg waarom. Kijk daarna nog even zelf.' },
]

const BARS = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3]

function Bars({ scale = 1 }: { scale?: number }) {
  return (
    <span className="flex h-full items-stretch gap-[2px]">
      {BARS.map((w, i) => (
        <span key={i} className="bg-neutral-900" style={{ width: w * scale }} />
      ))}
    </span>
  )
}

/** Gemarkeerd woord: pas gekleurd als de scanner het gevonden heeft. */
function Hit({ on, tone, children }: { on: boolean; tone: 'danger' | 'warning'; children: ReactNode }) {
  const cls = tone === 'danger' ? 'bg-danger/30 text-red-800' : 'bg-warning/35 text-amber-900'
  return <mark className={`rounded px-0.5 font-bold transition-colors duration-500 ${on ? cls : 'bg-transparent text-inherit'}`}>{children}</mark>
}

/* ---------- Wat er achter de telefoon ligt ---------- */

function Bag() {
  return (
    <div className="relative h-full overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#e9c46a_0%,#d9a441_50%,#b07a2a_100%)] shadow-2xl shadow-black/50">
      <div className="absolute inset-x-0 top-0 h-3 bg-[repeating-linear-gradient(90deg,#b07a2a_0_6px,#e9c46a_6px_12px)] opacity-70" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
      <div className="absolute inset-x-4 top-[14%] text-[#3a2a0c]">
        <p className="font-display text-[22px] font-extrabold leading-none lg:text-[28px]">Rijst</p>
        <p className="font-display text-[22px] font-extrabold leading-none lg:text-[28px]">wafels</p>
        <p className="mt-1 text-[12px] font-semibold lg:text-[14px]">naturel</p>
      </div>
      <div className="absolute left-[12%] top-[42%] aspect-square w-[42%] rounded-full bg-[#f3e2b8] bg-[radial-gradient(rgba(150,105,40,0.35)_1.5px,transparent_2px)] shadow-inner ring-4 ring-[#e8cf94] [background-size:7px_7px]" />
      <div className="absolute bottom-[10%] right-[10%] flex h-[13%] w-[42%] items-center justify-center rounded-md bg-white px-2 py-1.5">
        <Bars scale={0.7} />
      </div>
    </div>
  )
}

/** Achterkant van een pak koekjes met een ingrediëntenlijst. */
function Pack() {
  return (
    <div className="relative h-full overflow-hidden rounded-[18px] bg-[#c8463a] shadow-2xl shadow-black/50">
      <div className="absolute inset-x-0 top-0 h-[18%] bg-[#a8352b]" />
      <p className="absolute left-4 top-[5%] font-display text-[20px] font-extrabold text-[#ffe9c7] lg:text-[24px]">Koekjes</p>
      <div className="absolute inset-x-[8%] top-[24%] rounded-xl bg-[#fff6e6] p-3 text-[9px] leading-relaxed text-neutral-700 lg:text-[10.5px]">
        <p className="font-bold">Ingrediënten:</p>
        <p>Rijstmeel, suiker, cacaoboter, gerstemoutextract, zout, emulgator (sojalecithine).</p>
        <p className="mt-1 text-neutral-500">Kan sporen van melk bevatten.</p>
      </div>
      <div className="absolute bottom-[8%] left-[8%] flex h-[11%] w-[40%] items-center justify-center rounded-md bg-white px-2 py-1">
        <Bars scale={0.55} />
      </div>
    </div>
  )
}

/** Menukaart van een restaurant. */
function MenuCard() {
  return (
    <div className="relative h-full overflow-hidden rounded-[14px] bg-[#f6efe1] px-5 py-6 text-[#2b2418] shadow-2xl shadow-black/50 ring-1 ring-[#e3d6bb]">
      <p className="text-center font-display text-[20px] font-extrabold tracking-[0.2em] lg:text-[24px]">MENU</p>
      <div className="mx-auto mt-1 h-px w-16 bg-[#2b2418]/30" />
      {['Tomatensoep', 'Caesarsalade', 'Schnitzel met friet', 'Zalm met groente'].map((d) => (
        <p key={d} className="mt-3 flex justify-between gap-2 text-[11px] font-semibold lg:text-[13px]">
          {d}
          <span className="text-[#2b2418]/40">····</span>
        </p>
      ))}
    </div>
  )
}

/* ---------- Wat de camera ziet ---------- */

function BarcodeView({ step }: { step: number }) {
  const found = step >= 1
  const frame = found ? { left: '16%', top: '35%', width: '68%', height: '21%' } : { left: '8%', top: '24%', width: '84%', height: '34%' }
  const code = found ? { left: '20%', top: '38%' } : { left: '30%', top: '42%' }
  return (
    <div className="relative flex-1 overflow-hidden bg-[linear-gradient(160deg,#e2b85c_0%,#d29a3b_55%,#a87226_100%)]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
      <div className="absolute flex h-[15%] w-[60%] items-center justify-center rounded-lg bg-white px-3 py-2 transition-all duration-700 ease-out motion-reduce:transition-none" style={code}>
        <Bars />
      </div>
      <div
        className="absolute rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.38)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
        style={frame}
      >
        <Corners />
        {!found && <span className="absolute inset-x-3 h-0.5 animate-scanline bg-accent shadow-[0_0_8px_1px] shadow-accent motion-reduce:animate-none" />}
        {found && <span className="absolute inset-0 animate-pop-in rounded-2xl ring-2 ring-accent/70" />}
      </div>
      {found && <Pill className="top-[62%]">Gevonden!</Pill>}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-5 text-white">
        <RoundIcon icon={Flashlight} />
        <ModeSwitch active="barcode" />
        <RoundIcon icon={ImageIcon} />
      </div>
    </div>
  )
}

/** Etiket of menukaart: groot kader, sluiterknop, flits en dan gekleurde woorden. */
function TextView({ step, kind }: { step: number; kind: 'label' | 'menu' }) {
  const read = step >= 1
  return (
    <div className={`relative flex-1 overflow-hidden ${kind === 'label' ? 'bg-[#b23b30]' : 'bg-[#e9dfca]'}`}>
      <div
        className="absolute inset-x-4 top-8 overflow-hidden rounded-xl bg-[#fff8ea] p-3.5 text-[11.5px] leading-relaxed shadow-lg text-neutral-800 transition-transform duration-700 motion-reduce:transition-none"
        style={{ transform: read ? 'scale(1)' : 'scale(0.94) rotate(-2deg)' }}
      >
        {kind === 'label' ? (
          <>
            <p className="mb-1 font-bold">Ingrediënten:</p>
            <p>
              Rijstmeel, suiker, cacaoboter, <Hit on={read} tone="danger">gerstemoutextract</Hit>, zout, emulgator (sojalecithine).
            </p>
            <p className="mt-1 text-neutral-500">Kan sporen van melk bevatten.</p>
          </>
        ) : (
          <>
            <p className="text-center font-display text-[15px] font-extrabold tracking-[0.2em]">MENU</p>
            <p className="mt-2">Tomatensoep</p>
            <p className="mt-1">
              <Hit on={read} tone="warning">Caesarsalade</Hit> met croutons
            </p>
            <p className="mt-1">
              <Hit on={read} tone="warning">Schnitzel</Hit> met friet
            </p>
            <p className="mt-1">Zalm met groente</p>
          </>
        )}
      </div>
      <div className="absolute inset-x-1.5 top-1.5 bottom-[90px] rounded-2xl">
        <Corners />
        {!read && <span className="absolute inset-x-3 h-0.5 animate-scanline bg-accent shadow-[0_0_8px_1px] shadow-accent motion-reduce:animate-none" />}
      </div>
      {/* Flits als de foto genomen wordt */}
      {step === 1 && <span className="pointer-events-none absolute inset-0 animate-[flash_0.6s_ease-out_both] bg-white motion-reduce:hidden" />}
      {read && <Pill className="bottom-[100px]">{kind === 'label' ? 'Gerst gevonden' : '2 dingen navragen'}</Pill>}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 text-white">
        <ModeSwitch active="text" />
        <div className="flex items-center gap-7">
          <RoundIcon icon={Flashlight} />
          <span className={`rounded-full border-[3px] border-white p-0.5 transition-transform duration-200 ${step === 1 ? 'scale-90' : ''}`}>
            <span className="block h-9 w-9 rounded-full bg-white" />
          </span>
          <RoundIcon icon={ImageIcon} />
        </div>
      </div>
    </div>
  )
}

function Corners() {
  return (
    <>
      {['left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-xl', 'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-xl', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl'].map((c) => (
        <span key={c} className={`absolute h-5 w-5 border-accent ${c}`} />
      ))}
    </>
  )
}

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`absolute left-1/2 -translate-x-1/2 animate-slide-up whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[9px] font-semibold text-white ${className}`}>
      {children}
    </span>
  )
}

function RoundIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
      <Icon size={13} />
    </span>
  )
}

/* ---------- De uitslag ---------- */

function Result({ scene, show }: { scene: SceneId; show: boolean }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 top-[14%] flex flex-col items-center gap-2 rounded-t-[28px] bg-neutral-950 px-4 pt-5 text-center shadow-[0_-12px_40px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ transform: show ? 'translateY(0)' : 'translateY(105%)' }}
      aria-hidden={!show}
    >
      <span className="h-1 w-10 rounded-full bg-white/20" />
      {scene === 'barcode' && (
        <>
          <p className="mt-1 text-[11px] font-semibold text-white/80">Rijstwafels naturel</p>
          <div className={show ? 'animate-pop-in' : ''}>
            <Circle tone="safe">
              <CheckCircle2 size={44} />
            </Circle>
          </div>
          <span className="text-[24px] font-bold text-safe">Glutenvrij</span>
          <span className="rounded-full bg-safe/15 px-2 py-0.5 text-[8px] font-semibold text-safe">Met glutenvrij-logo</span>
          <Box title="Ingrediënten">Volkoren rijst 99%, zeezout</Box>
        </>
      )}
      {scene === 'label' && (
        <>
          <p className="mt-1 text-[11px] font-semibold text-white/80">Etiket</p>
          <div className={show ? 'animate-pop-in' : ''}>
            <Circle tone="danger">
              <XCircle size={44} />
            </Circle>
          </div>
          <span className="text-[24px] font-bold text-danger">Bevat gluten</span>
          <span className="text-[10px] text-white/80">
            Gevonden: <b className="text-white">gerstemoutextract</b>
          </span>
          <Box title="Waarom?">Gerstemout is gemaakt van gerst. Daar zit gluten in.</Box>
        </>
      )}
      {scene === 'menu' && (
        <>
          <p className="mt-1 text-[11px] font-semibold text-white/80">Menukaart</p>
          <div className={show ? 'animate-pop-in' : ''}>
            <Circle tone="warning">
              <AlertTriangle size={40} />
            </Circle>
          </div>
          <span className="text-[22px] font-bold text-warning">Twijfel</span>
          <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide text-warning">
            <MessageCircleQuestion size={10} />
            Vraag de bediening
          </p>
          <Box title="Bij schnitzel">{MENU_QUESTIONS.Paneermeel.nl}</Box>
        </>
      )}
    </div>
  )
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-1 w-full rounded-2xl bg-neutral-900 p-3 text-left text-[9.5px] leading-snug text-white/85">
      <p className="mb-1 text-[8px] uppercase tracking-wide text-white/50">{title}</p>
      {children}
    </div>
  )
}

/* ---------- Het geheel ---------- */

const OBJECT_STYLE: Record<SceneId, string> = {
  barcode: 'left-[6%] top-[12%] h-[74%] w-[44%] lg:left-[10%] lg:w-[36%]',
  label: 'left-[5%] top-[14%] h-[68%] w-[46%] lg:left-[8%] lg:w-[40%]',
  menu: 'left-[5%] top-[10%] h-[76%] w-[46%] lg:left-[8%] lg:w-[38%]',
}

export function ScanDemo() {
  const [scene, setScene] = useState(0)
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Alleen afspelen als hij in beeld is.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const t = window.setTimeout(() => {
      if (step < 2) setStep(step + 1)
      else {
        setStep(0)
        setScene((s) => (s + 1) % SCENES.length)
      }
    }, STEP_MS)
    return () => window.clearTimeout(t)
  }, [visible, step, scene])

  const { id, label, icon: SceneIcon } = SCENES[scene]
  const phoneTilt = ['rotate(8deg) translate(10%, 4%)', 'rotate(3deg) translate(4%, 0)', 'rotate(0deg) translate(0, -2%)'][step]

  return (
    <div ref={ref} className="mx-auto mt-12 max-w-6xl lg:mt-16">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Het toneel */}
        <div className="relative h-[460px] overflow-hidden rounded-[36px] bg-[#10140f] lg:h-[600px] lg:rounded-[40px]">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
          {/* Wat er nu gescand wordt (geen knop, alleen een labeltje) */}
          <span key={label} className="absolute left-5 top-5 z-10 flex animate-slide-up items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-display text-[15px] font-bold text-white ring-1 ring-white/15 backdrop-blur lg:left-7 lg:top-7 lg:text-[17px]">
            <SceneIcon size={17} className="text-[#7ee2a8]" />
            {label}
          </span>
          <div
            key={id}
            className={`absolute transition-all duration-700 ease-out motion-reduce:transition-none ${OBJECT_STYLE[id]}`}
            style={{ transform: `rotate(${step === 2 ? -10 : -4}deg) translateX(${step === 2 ? -12 : 0}%)`, opacity: step === 2 ? 0.55 : 1 }}
            aria-hidden
          >
            <div className="h-full animate-slide-up">{id === 'barcode' ? <Bag /> : id === 'label' ? <Pack /> : <MenuCard />}</div>
          </div>
          <div
            className="absolute left-1/2 top-1/2 origin-center transition-transform duration-700 ease-out [--dx:-44%] motion-reduce:transition-none lg:[--dx:-30%]"
            style={{ transform: `translate(var(--dx), -50%) ${phoneTilt}` }}
          >
            <div className="scale-[0.76] lg:scale-100">
              <Phone className="ring-1 ring-white/10">
                <StatusBar />
                <ScanHeader />
                <div className="relative flex flex-1 flex-col">
                  {id === 'barcode' ? <BarcodeView step={step} /> : <TextView key={id} step={step} kind={id} />}
                  <Result scene={id} show={step === 2} />
                </div>
              </Phone>
            </div>
          </div>
        </div>

        {/* De drie stappen, de actieve licht op */}
        <ol className="flex flex-col gap-3">
          {STEPS.map(({ title, text }, i) => {
            const active = i === step
            return (
              <li key={i}>
                <div
                  className={`relative flex w-full items-start gap-4 overflow-hidden rounded-[26px] p-5 text-left transition lg:p-6 ${
                    active ? 'bg-white shadow-xl shadow-black/5 ring-1 ring-neutral-200' : ''
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-[18px] font-bold transition ${
                      active ? 'bg-accent text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={`block font-display text-[22px] font-bold lg:text-[24px] ${active ? 'text-[#14130f]' : 'text-neutral-500'}`}>{title}</span>
                    <span className={`mt-1 block text-[16px] leading-relaxed lg:text-[17px] ${active ? 'text-neutral-600' : 'text-neutral-400'}`}>{text}</span>
                  </span>
                  {active && visible && (
                    <span
                      key={`${scene}-${step}`}
                      className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent motion-reduce:hidden"
                      style={{ animation: `demo-progress ${STEP_MS}ms linear both` }}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
