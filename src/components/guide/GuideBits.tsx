import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'
import type { RiskLevel } from '../../data/glutenGuide'
import { BAR, COLOR_ORDER, type Item } from '../../data/guideItems'
import { RISK_UI } from './guideUi'

/** Bouwstenen van de gids, gedeeld door de app en de website (beide donker). */

/** Kleurbalkje: in één oogopslag hoeveel er niet mag, oplet of mag. */
export function RiskBar({ items }: { items: Item[] }) {
  return (
    <span className="flex h-2 w-full overflow-hidden rounded-full bg-white/10" aria-hidden>
      {COLOR_ORDER.map((r) => {
        const n = items.filter((i) => i.risk === r).length
        return n ? <span key={r} className={BAR[r]} style={{ width: `${(n / items.length) * 100}%` }} /> : null
      })}
    </span>
  )
}

export function RiskPill({ risk, size = 'sm' }: { risk: RiskLevel; size?: 'sm' | 'lg' }) {
  const ui = RISK_UI[risk]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${ui.solid} ${
        size === 'lg' ? 'px-4 py-1.5 text-[17px]' : 'min-w-[64px] px-2.5 py-1 text-[13px]'
      }`}
    >
      {ui.word}
    </span>
  )
}

export function Instead({ items, center = false }: { items: string[]; center?: boolean }) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="text-[13px] font-bold uppercase tracking-wide text-safe">Neem liever</p>
      <div className={`mt-1.5 flex flex-wrap gap-1.5 ${center ? 'justify-center' : ''}`}>
        {items.map((a) => (
          <span key={a} className="rounded-full bg-safe/15 px-3 py-1.5 text-[15px] font-medium text-white">
            {a}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Tip({ text, center = false }: { text?: string; center?: boolean }) {
  if (!text) return null
  return (
    <p className={`flex items-start gap-2 text-[15px] leading-snug text-white/80 ${center ? 'justify-center text-left' : ''}`}>
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-[#ffd75e]" aria-hidden />
      {text}
    </p>
  )
}

/** Het grote antwoord bovenaan bij zoeken. `center`: alles in het midden (website). */
export function AnswerCard({ item, center = false }: { item: Item; center?: boolean }) {
  const ui = RISK_UI[item.risk]
  const Icon = ui.icon
  return (
    <article className={`animate-slide-up flex flex-col gap-3 rounded-[28px] p-5 ring-2 ${ui.soft} ${center ? 'items-center text-center' : ''}`}>
      <div className={`flex items-center gap-3 ${center ? 'justify-center text-left' : ''}`}>
        <Icon size={40} className={`shrink-0 ${ui.text}`} />
        <div className="min-w-0">
          <p className={`text-[28px] font-extrabold leading-none ${ui.text}`}>{ui.word}</p>
          <p className="mt-1 text-[15px] font-semibold text-white/70">{ui.long}</p>
        </div>
      </div>
      <h3 className="text-[24px] font-bold leading-tight">{item.name}</h3>
      <p className="text-[17px] leading-snug text-white/85">{item.why}</p>
      <Tip text={item.tip} center={center} />
      <Instead items={item.instead} center={center} />
    </article>
  )
}

/** Compacte rij die openklapt: kleur, naam, één regel uitleg. */
export function ItemRow({ item, open, onToggle, showGroup }: { item: Item; open: boolean; onToggle: () => void; showGroup?: boolean }) {
  return (
    <li className="border-b border-surface-line last:border-0">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 py-3.5 text-left active:opacity-70">
        <RiskPill risk={item.risk} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[17px] font-semibold leading-tight">{item.name}</span>
          {!open && (
            <span className="truncate text-[14px] text-muted">
              {showGroup && <span className="text-accent">{item.group} · </span>}
              {item.why}
            </span>
          )}
        </span>
        <ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {open && (
        <div className="animate-slide-up flex flex-col gap-3 pb-4 pl-[76px]">
          <p className="text-[16px] leading-snug text-white/85">{item.why}</p>
          <Tip text={item.tip} />
          <Instead items={item.instead} />
        </div>
      )}
    </li>
  )
}

export function ItemList({ items, showGroup }: { items: Item[]; showGroup?: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <ul>
      {items.map((item) => (
        <ItemRow
          key={item.key}
          item={item}
          showGroup={showGroup}
          open={open === item.key}
          onToggle={() => setOpen((k) => (k === item.key ? null : item.key))}
        />
      ))}
    </ul>
  )
}

