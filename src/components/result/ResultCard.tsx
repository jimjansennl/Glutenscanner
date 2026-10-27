import { AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import type { GlutenAnalysis, GlutenMatch, GlutenStatus, MatchSource } from '../../types/product'

interface StatusStyle {
  icon: LucideIcon
  title: string
  hero: string
  ring: string
  chip: string
  accent: string
}

const STATUS: Record<GlutenStatus, StatusStyle> = {
  safe: {
    icon: CheckCircle2,
    title: 'Glutenvrij / Veilig',
    hero: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-200',
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    accent: 'text-emerald-700',
  },
  danger: {
    icon: XCircle,
    title: 'Bevat Gluten!',
    hero: 'from-red-500 to-rose-600',
    ring: 'ring-red-200',
    chip: 'bg-red-50 text-red-800 ring-red-200',
    accent: 'text-red-700',
  },
  warning: {
    icon: AlertTriangle,
    title: 'Let op: twijfelgeval',
    hero: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-200',
    chip: 'bg-amber-50 text-amber-900 ring-amber-200',
    accent: 'text-amber-700',
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
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      <ul className="flex flex-col gap-2">
        {groupByLabel(matches).map(([label, { terms, sources }]) => (
          <li key={label} className={`rounded-xl px-3 py-2.5 ring-1 ${chip}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{label}</span>
              <span className="text-[11px] font-medium opacity-70">
                {[...sources].map((s) => SOURCE_LABEL[s]).join(' · ')}
              </span>
            </div>
            <p className="mt-0.5 text-sm opacity-80">{[...terms].join(', ')}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ResultCard({ analysis }: { analysis: GlutenAnalysis }) {
  const style = STATUS[analysis.status]
  const Icon = style.icon

  return (
    <article
      className={`animate-slide-up overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-900/10 ring-1 ${style.ring}`}
      aria-live="polite"
    >
      <header className={`flex flex-col items-center gap-3 bg-gradient-to-br px-6 pb-7 pt-8 text-white ${style.hero}`}>
        <div className="animate-pop-in rounded-full bg-white p-2 shadow-lg">
          <Icon className={style.accent} size={84} strokeWidth={2.25} aria-hidden />
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight drop-shadow-sm">{style.title}</h2>
      </header>

      <div className="flex flex-col gap-5 p-5">
        <ul className="flex flex-col gap-1">
          {analysis.reasons.map((r) => (
            <li key={r} className="text-[15px] leading-snug text-gray-700">
              {r}
            </li>
          ))}
        </ul>

        <MatchList title="Gevonden gluten-bronnen" matches={analysis.matches} chip={STATUS.danger.chip} />
        <MatchList title="Twijfelachtig" matches={analysis.warnings} chip={STATUS.warning.chip} />
      </div>
    </article>
  )
}
