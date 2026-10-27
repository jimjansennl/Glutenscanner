import { AlertTriangle, BadgeCheck, CheckCircle2, Database, MessageCircleQuestion, XCircle, type LucideIcon } from 'lucide-react'
import { describeMatch } from '../../services/glutenParser'
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

/** Groepeert matches per gluten-bron: "Tarwe" → ["tarwebloem", "trigo"]. */
function groupByLabel(matches: GlutenMatch[]) {
  const groups = new Map<string, { matches: GlutenMatch[]; sources: Set<MatchSource> }>()
  for (const m of matches) {
    const g = groups.get(m.label) ?? { matches: [], sources: new Set() }
    if (!g.matches.some((x) => x.term === m.term)) g.matches.push(m)
    g.sources.add(m.source)
    groups.set(m.label, g)
  }
  return [...groups.entries()]
}

/** "trigo → tarwe": buitenlandse termen direct met Nederlandse vertaling. */
function termText(m: GlutenMatch): string {
  const label = m.label.toLowerCase()
  return m.term.includes(label) || m.label.includes('/') ? m.term : `${m.term} → ${label}`
}

function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-2 text-center text-[13px] font-medium uppercase tracking-wide text-muted">{children}</h3>
}

function MatchList({ title, matches, chip }: { title: string; matches: GlutenMatch[]; chip: string }) {
  if (matches.length === 0) return null
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <ul className="divide-y divide-surface-line overflow-hidden rounded-2xl bg-surface-raised">
        {groupByLabel(matches).map(([label, { matches, sources }]) => (
          <li key={label} className="flex flex-col items-center gap-1 px-4 py-3 text-center">
            <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${chip}`}>{label}</span>
            <span className="text-[15px] text-white/90">{matches.map(termText).join(', ')}</span>
            <span className="text-xs text-muted">{[...sources].map((s) => SOURCE_LABEL[s]).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Tips({ tips }: { tips: string[] }) {
  if (tips.length === 0) return null
  return (
    <section>
      <SectionTitle>Vraag in het restaurant</SectionTitle>
      <ul className="flex flex-col gap-2">
        {tips.map((tip) => (
          <li key={tip} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-raised px-4 py-3 text-center">
            <MessageCircleQuestion size={18} className="text-safe" aria-hidden />
            <span className="text-[15px] leading-snug text-white/90">{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ResultCard({ analysis }: { analysis: GlutenAnalysis }) {
  const style = STATUS[analysis.status]
  const Icon = style.icon
  // Bij een gluten-match de bron feitelijk benoemen, met vertaling van buitenlandse termen.
  const sources = [
    ...new Set(analysis.matches.map((m) => (m.source === 'traces' ? `sporen van ${describeMatch(m)}` : describeMatch(m)))),
  ].slice(0, 4)

  return (
    <article className="animate-slide-up flex flex-col gap-6 rounded-[28px] bg-surface p-6" aria-live="polite">
      <header className="flex flex-col items-center gap-5 pt-4 text-center">
        <div className={`animate-pop-in flex h-40 w-40 items-center justify-center rounded-full ring-4 ${style.circle}`}>
          <Icon className={style.text} size={96} strokeWidth={2} aria-hidden />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h2 className={`text-[34px] font-bold leading-tight tracking-tight ${style.text}`}>{style.title}</h2>
          {analysis.certified && (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-safe/15 px-3 py-1 text-[13px] font-semibold text-safe">
              <BadgeCheck size={16} />
              Gecertificeerd glutenvrij
            </span>
          )}
          {analysis.status === 'danger' && sources.length > 0 && (
            <p className="text-[17px] text-white">
              Getraceerde glutenbron: <span className="font-semibold">{sources.join(', ')}</span>
            </p>
          )}
        </div>
      </header>

      <ul className="flex flex-col items-center gap-1 text-center">
        {/* Bij gluten staat de bron al onder de titel; dan alleen de duiding tonen. */}
        {(analysis.status === 'danger' ? ['Niet geschikt bij coeliakie of glutenintolerantie.'] : analysis.reasons).map((r) => (
          <li key={r} className="text-[15px] leading-snug text-muted">
            {r}
          </li>
        ))}
      </ul>

      <MatchList title="Glutenbevattende granen" matches={analysis.matches} chip={STATUS.danger.chip} />
      <MatchList title="Twijfelachtig" matches={analysis.warnings} chip={STATUS.warning.chip} />
      {analysis.contradictory && (
        <section className="flex flex-col items-center gap-1.5 rounded-2xl bg-warning/10 px-4 py-3 text-center ring-1 ring-warning/40">
          <AlertTriangle size={18} className="text-warning" aria-hidden />
          <p className="text-[15px] font-semibold text-warning">Tegenstrijdige ingrediëntenlijst</p>
          <p className="text-[13px] leading-snug text-white/80">
            Er staat &quot;glutenvrij&quot;, maar de lijst noemt ook een glutenbron. Het risico gaat voor: bij twijfel
            niet eten en de verpakking controleren.
          </p>
        </section>
      )}
      {analysis.certified && (analysis.conflicts?.length ?? 0) > 0 && (
        <section className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-raised px-4 py-3 text-center">
          <Database size={18} className="text-muted" aria-hidden />
          <p className="text-[15px] leading-snug text-white/90">
            De database noemt ook: <span className="font-semibold">{analysis.conflicts!.join(', ')}</span>
          </p>
          <p className="text-[13px] leading-snug text-muted">
            Waarschijnlijk vervuilde data. De glutenvrij-claim op het product gaat voor; controleer bij twijfel het
            logo op de verpakking.
          </p>
        </section>
      )}
      <Tips tips={analysis.tips ?? []} />
    </article>
  )
}
