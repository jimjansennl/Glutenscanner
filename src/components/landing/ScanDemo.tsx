import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Flashlight, Image as ImageIcon } from 'lucide-react'
import { Circle, ModeSwitch, Phone, ScanHeader, StatusBar } from './PhoneScreens'

/**
 * Bewegend voorbeeld op de startpagina: een telefoon richt op een zak rijstwafels, het kader
 * springt om de barcode en de uitslag komt omhoog. Rechts (op de telefoon eronder) lichten de
 * drie stappen mee op. Eigen ontwerp in de stijl van de site, geen beelden van anderen.
 */

const STEP_MS = 3400

const STEPS = [
  { title: 'Richt je camera', text: 'Kies onderin barcode of etiket en richt je camera op de verpakking.' },
  { title: 'Hij leest vanzelf', text: 'Het kader springt om de barcode. Bij een etiket of menukaart tik je op de knop.' },
  { title: 'Zie de uitslag', text: 'Groen, oranje of rood, met uitleg waarom. Kijk daarna nog even zelf op de verpakking.' },
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

/** Zak rijstwafels achter de telefoon. */
function Bag({ step }: { step: number }) {
  return (
    <div
      className="absolute left-[6%] top-[12%] h-[74%] w-[44%] transition-all duration-700 ease-out motion-reduce:transition-none lg:left-[10%] lg:w-[36%]"
      style={{ transform: `rotate(${step === 2 ? -10 : -4}deg) translateX(${step === 2 ? -12 : 0}%)`, opacity: step === 2 ? 0.55 : 1 }}
      aria-hidden
    >
      <div className="relative h-full overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#e9c46a_0%,#d9a441_50%,#b07a2a_100%)] shadow-2xl shadow-black/50">
        {/* gekartelde rand bovenaan */}
        <div className="absolute inset-x-0 top-0 h-3 bg-[repeating-linear-gradient(90deg,#b07a2a_0_6px,#e9c46a_6px_12px)] opacity-70" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
        <div className="absolute inset-x-4 top-[14%] text-[#3a2a0c]">
          <p className="font-display text-[22px] font-extrabold leading-none lg:text-[28px]">Rijst</p>
          <p className="font-display text-[22px] font-extrabold leading-none lg:text-[28px]">wafels</p>
          <p className="mt-1 text-[12px] font-semibold lg:text-[14px]">naturel</p>
        </div>
        <div className="absolute left-[12%] top-[42%] aspect-square w-[42%] rounded-full bg-[#f3e2b8] bg-[radial-gradient(rgba(150,105,40,0.35)_1.5px,transparent_2px)] [background-size:7px_7px] shadow-inner ring-4 ring-[#e8cf94]" />
        <div className="absolute bottom-[10%] right-[10%] flex h-[13%] w-[42%] items-center justify-center rounded-md bg-white px-2 py-1.5">
          <Bars scale={0.7} />
        </div>
      </div>
    </div>
  )
}

/** Wat de camera ziet: een stuk van de zak met de barcode, en het kader dat erom springt. */
function CameraView({ step }: { step: number }) {
  const found = step >= 1
  // Kader: eerst het brede barcodekader, daarna strak om de barcode.
  const frame = found ? { left: '16%', top: '35%', width: '68%', height: '21%' } : { left: '8%', top: '24%', width: '84%', height: '34%' }
  const code = found ? { left: '20%', top: '38%' } : { left: '30%', top: '42%' }
  return (
    <div className="relative flex-1 overflow-hidden bg-[linear-gradient(160deg,#e2b85c_0%,#d29a3b_55%,#a87226_100%)]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_18px,rgba(255,255,255,0.08)_18px_20px)]" />
      <div
        className="absolute flex h-[15%] w-[60%] items-center justify-center rounded-lg bg-white px-3 py-2 transition-all duration-700 ease-out motion-reduce:transition-none"
        style={code}
      >
        <Bars />
      </div>
      <div
        className="absolute rounded-2xl shadow-[0_0_0_999px_rgba(0,0,0,0.38)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
        style={frame}
      >
        {['left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-xl', 'right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-xl', 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl', 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl'].map((c) => (
          <span key={c} className={`absolute h-5 w-5 border-accent ${c}`} />
        ))}
        {!found && <span className="absolute inset-x-3 h-0.5 animate-scanline bg-accent shadow-[0_0_8px_1px] shadow-accent motion-reduce:animate-none" />}
        {found && <span className="absolute inset-0 animate-pop-in rounded-2xl ring-2 ring-accent/70" />}
      </div>
      {found && (
        <span className="absolute left-1/2 top-[62%] -translate-x-1/2 animate-slide-up whitespace-nowrap rounded-full bg-accent px-3 py-1 text-[9px] font-semibold">
          Gevonden!
        </span>
      )}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-5 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
          <Flashlight size={13} />
        </span>
        <ModeSwitch active="barcode" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50">
          <ImageIcon size={13} />
        </span>
      </div>
    </div>
  )
}

/** De uitslag schuift van onderen omhoog over het camerabeeld. */
function ResultSheet({ show }: { show: boolean }) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 top-[18%] flex flex-col items-center gap-2 rounded-t-[28px] bg-neutral-950 px-4 pt-6 text-center shadow-[0_-12px_40px_rgba(0,0,0,0.6)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{ transform: show ? 'translateY(0)' : 'translateY(105%)' }}
      aria-hidden={!show}
    >
      <span className="h-1 w-10 rounded-full bg-white/20" />
      <p className="mt-2 text-[11px] font-semibold text-white/80">Rijstwafels naturel</p>
      <div className={show ? 'animate-pop-in' : ''}>
        <Circle tone="safe">
          <CheckCircle2 size={44} />
        </Circle>
      </div>
      <span className="text-[24px] font-bold text-safe">Glutenvrij</span>
      <span className="rounded-full bg-safe/15 px-2 py-0.5 text-[8px] font-semibold text-safe">Met glutenvrij-logo</span>
      <div className="mt-2 w-full rounded-2xl bg-neutral-900 p-3 text-[9px] text-white/80">
        <p className="mb-1 text-[8px] uppercase tracking-wide text-white/50">Ingrediënten</p>
        Volkoren rijst 99%, zeezout
      </div>
    </div>
  )
}

export function ScanDemo() {
  const [step, setStep] = useState(0)
  const [round, setRound] = useState(0) // telt mee bij een klik, zodat de tijd opnieuw begint
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
    const t = window.setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS)
    return () => window.clearTimeout(t)
  }, [visible, step, round])

  const pick = (i: number) => {
    setStep(i)
    setRound((r) => r + 1)
  }

  const phoneTilt = ['rotate(8deg) translate(10%, 4%)', 'rotate(3deg) translate(4%, 0)', 'rotate(0deg) translate(0, -2%)'][step]

  return (
    <div ref={ref} className="mx-auto mt-12 grid max-w-6xl grid-cols-1 items-center gap-8 lg:mt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      {/* Het toneel */}
      <div className="relative h-[460px] overflow-hidden rounded-[36px] bg-[#10140f] lg:h-[600px] lg:rounded-[40px]">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
        <Bag step={step} />
        <div
          className="absolute left-1/2 top-1/2 origin-center [--dx:-44%] transition-transform lg:[--dx:-30%] duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translate(var(--dx), -50%) ${phoneTilt}` }}
        >
          <div className="scale-[0.76] lg:scale-100">
            <Phone className="ring-1 ring-white/10">
              <StatusBar />
              <ScanHeader />
              <div className="relative flex flex-1 flex-col">
                <CameraView step={step} />
                <ResultSheet show={step === 2} />
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
            <li key={title}>
              <button
                onClick={() => pick(i)}
                className={`relative flex w-full items-start gap-4 overflow-hidden rounded-[26px] p-5 text-left transition lg:p-6 ${
                  active ? 'bg-white shadow-xl shadow-black/5 ring-1 ring-neutral-200' : 'hover:bg-white/60'
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
                    key={`${step}-${round}`}
                    className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent motion-reduce:hidden"
                    style={{ animation: `demo-progress ${STEP_MS}ms linear both` }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
