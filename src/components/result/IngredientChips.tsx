import { useState, type ReactNode } from 'react'
import { AlertTriangle, Check, ChevronDown, ShieldCheck, XCircle } from 'lucide-react'
import { fold } from '../../lib/fold'
import { looksSafeFlour, type IngredientList } from '../../services/ingredientList'
import type { GlutenMatch } from '../../types/product'

/**
 * De ingrediënten als losse blokjes in plaats van een lap tekst: gluten rood, twijfel oranje,
 * "bloem" zonder gluten (zoals rijstebloem) groen met een vinkje, de rest rustig grijs.
 * Bovenaan één zin met de samenvatting. De volledige tekst van de foto zit achter een knopje.
 */

type Kind = 'danger' | 'warning' | 'safe' | 'plain'

const CHIP: Record<Kind, string> = {
  danger: 'bg-danger/15 text-danger ring-1 ring-danger/40',
  warning: 'bg-warning/15 text-warning ring-1 ring-warning/40',
  safe: 'bg-safe/10 text-safe ring-1 ring-safe/25',
  plain: 'bg-surface-raised text-white/85',
}

const ICON: Partial<Record<Kind, ReactNode>> = {
  danger: <XCircle size={15} className="shrink-0" />,
  warning: <AlertTriangle size={15} className="shrink-0" />,
  safe: <Check size={15} className="shrink-0" />,
}

function kindOf(text: string, danger: string[], warning: string[]): Kind {
  const f = fold(text)
  if (danger.some((t) => f.includes(t))) return 'danger'
  if (warning.some((t) => f.includes(t))) return 'warning'
  if (looksSafeFlour(text)) return 'safe'
  return 'plain'
}

export function IngredientChips({
  list,
  danger,
  warning,
  fullText,
}: {
  list: IngredientList
  danger: GlutenMatch[]
  warning: GlutenMatch[]
  /** De hele tekst van de foto, achter een knopje. Leeg laten als dat niets toevoegt. */
  fullText?: ReactNode
}) {
  const [showAll, setShowAll] = useState(false)
  // Sporen tellen niet mee voor de blokjes: die staan bij "Kan bevatten".
  const dangerTerms = danger.filter((m) => m.source !== 'traces').map((m) => fold(m.term))
  const warningTerms = warning.map((m) => fold(m.term))
  const kinds = list.items.map((it) => kindOf(`${it.name} ${it.detail ?? ''}`, dangerTerms, warningTerms))
  const total = list.items.length
  const bad = kinds.filter((k) => k === 'danger').length
  const doubt = kinds.filter((k) => k === 'warning').length
  const mayGluten = list.mayContain ? danger.some((m) => m.source === 'traces') || /gluten|tarwe|gerst|rogge|spelt|haver|wheat|weizen|bl[eé]/i.test(list.mayContain) : false

  const summary =
    bad > 0
      ? { tone: 'text-danger', icon: <XCircle size={18} />, text: `${bad === 1 ? '1 ingrediënt' : `${bad} ingrediënten`} van de ${total} ${bad === 1 ? 'bevat' : 'bevatten'} gluten.` }
      : doubt > 0
        ? { tone: 'text-warning', icon: <AlertTriangle size={18} />, text: `Bij ${doubt} van de ${total} ingrediënten moet je opletten.` }
        : { tone: 'text-safe', icon: <ShieldCheck size={18} />, text: `Alle ${total} ingrediënten bekeken. Geen gluten gevonden.` }

  return (
    <section className="flex flex-col gap-4 rounded-[22px] bg-surface p-4">
      <h3 className="text-center text-[13px] font-medium uppercase tracking-wide text-muted">Ingrediënten</h3>

      <p className={`text-center text-[16px] font-semibold leading-snug ${summary.tone}`}>
        <span className="mr-1.5 inline-block align-[-3px]">{summary.icon}</span>
        {summary.text}
      </p>

      <ul className="flex flex-wrap justify-center gap-2">
        {list.items.map((it, i) => (
          <li key={`${it.name}-${i}`} className={`flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-[15px] font-medium ${CHIP[kinds[i]]}`}>
            {ICON[kinds[i]]}
            <span className="min-w-0">
              {it.name}
              {it.detail && <span className="ml-1 text-[13px] font-normal opacity-60">({it.detail})</span>}
            </span>
          </li>
        ))}
      </ul>

      {kinds.includes('safe') && bad === 0 && (
        <p className="text-center text-[13px] text-muted">
          <Check size={14} className="mr-1 inline-block align-[-2px] text-safe" />
          Groen = bloem of zetmeel zonder gluten. Dat mag.
        </p>
      )}

      {list.mayContain && (
        <p
          className={`rounded-2xl px-4 py-2.5 text-center text-[14px] leading-snug ${
            mayGluten ? 'bg-warning/10 text-warning' : 'bg-surface-raised text-white/70'
          }`}
        >
          {list.mayContain}
          {!mayGluten && <span className="mt-0.5 block text-[12px] text-muted">Daar zit geen gluten bij.</span>}
        </p>
      )}

      {fullText && (
        <div className="text-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1 text-[14px] font-medium text-accent active:opacity-60"
            aria-expanded={showAll}
          >
            {showAll ? 'Verberg de hele tekst' : 'Toon alle tekst van de foto'}
            <ChevronDown size={16} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
          {showAll && <p className="mt-3 text-[14px] leading-relaxed text-white/70">{fullText}</p>}
        </div>
      )}
    </section>
  )
}
