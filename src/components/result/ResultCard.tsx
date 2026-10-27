import { AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import type { GlutenAnalysis, GlutenMatch, GlutenStatus, MatchSource } from '../../types/product'

interface StatusStyle {
  icon: LucideIcon
  title: string
  /** Tekstkleur van icoon en titel. */
  text: string
  /** Gekleurde cirkel: getinte vulling, felle rand en gloed. */
  circle: string
  chip: string
}

const STATUS: Record<GlutenStatus, StatusStyle> = {
  safe: {
    icon: CheckCircle2,
    title: 'Glutenvrij',
    text: 'text-safe',
    circle: 'bg-safe/15 ring-safe shadow-[0_0_60px_-4px] shadow-safe/60',
    chip: 'bg-safe/10 text-safe',
  },
  danger: {
    icon: XCircle,
    title: 'Bevat Gluten!',
    text: 'text-danger',
    circle: 'bg-danger/15 ring-danger shadow-[0_0_60px_-4px] shadow-danger/60',
    chip: 'bg-danger/10 text-danger',
  },
  warning: {
    icon: AlertTriangle,
    title: 'Twijfelgeval',
    text: 'text-warning',
    circle: 'bg-warning/15 ring-warning shadow-[0_0_60px_-4px] shadow-warning/60',
    chip: 'bg-warning/10 text-warning',
  },
}

const SOURCE_LABEL: Record<MatchSource, string> = {
  ingredients: 'Ingrediënten',
  allergens: 'Allergenen',
  traces: 'Sporen',
  text: 'Tekst',
}

/** Groepeert matches per gluten-bron: "Tarwe" → ["tarwebloem", "tarwezetmeel"]. */
function groupByLabel(matches: GlutenMatch[]) {
  const groups = new Map<string, { terms: Set<string>; sources: Set<MatchSource> }>()
  for (const m of matches) {
    const g = groups.get(m.label) ?? { terms: new Set(), sources: new Set() }
    g.terms.add(m.term)
    g.sources.add(m.source)
    groups.set(m.label, g)
  }
  return [...groups.entries()]
}

function MatchList({ title, matches, chip }: { title: string; matches: GlutenMatch[]; chip: string }) {
  if (matches.length === 0) return null
  return (
    <section>
      <h3 className="mb-2 px-1 text-[13px] font-medium uppercase tracking-wide text-muted">{title}</h3>
      <ul className="divide-y divide-surface-line overflow-hidden rounded-2xl bg-surface-raised">
        {groupByLabel(matches).map(([label, { terms, sources }]) => (
          <li key={label} className="flex items-center gap-3 px-4 py-3">
            <span className={`rounded-lg px-2 py-1 text-[13px] font-semibold ${chip}`}>{label}</span>
            <span className="min-w-0 flex-1 truncate text-[15px] text-white/90">{[...terms].join(', ')}</span>
            <span className="shrink-0 text-xs text-muted">{[...sources].map((s) => SOURCE_LABEL[s]).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ResultCard({ analysis }: { analysis: GlutenAnalysis }) {
  const style = STATUS[analysis.status]
  const Icon = style.icon
  // Bij gevaar het schadelijke ingrediënt direct onder de titel noemen.
  const culprits = [...new Set(analysis.matches.map((m) => m.term))].slice(0, 3)

  return (
    <article className="animate-slide-up flex flex-col gap-6 rounded-[28px] bg-surface p-6" aria-live="polite">
      <header className="flex flex-col items-center gap-5 pt-4 text-center">
        <div className={`animate-pop-in flex h-40 w-40 items-center justify-center rounded-full ring-4 ${style.circle}`}>
          <Icon className={style.text} size={96} strokeWidth={2} aria-hidden />
        </div>
        <div>
          <h2 className={`text-[34px] font-bold leading-tight tracking-tight ${style.text}`}>{style.title}</h2>
          {analysis.status === 'danger' && culprits.length > 0 && (
            <p className="mt-1 text-[17px] text-white">
              Schadelijk ingrediënt: <span className="font-semibold">{culprits.join(', ')}</span>
            </p>
          )}
        </div>
      </header>

      <ul className="flex flex-col gap-1 text-center">
        {analysis.reasons.map((r) => (
          <li key={r} className="text-[15px] leading-snug text-muted">
            {r}
          </li>
        ))}
      </ul>

      <MatchList title="Gevonden gluten-bronnen" matches={analysis.matches} chip={STATUS.danger.chip} />
      <MatchList title="Twijfelachtig" matches={analysis.warnings} chip={STATUS.warning.chip} />
    </article>
  )
}
