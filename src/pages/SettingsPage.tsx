import type { ReactNode } from 'react'
import { ArrowUpRight, Check, ChevronRight, Info, Languages, ScanBarcode, ShieldAlert, ShieldCheck, UserCheck } from 'lucide-react'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PageHeader } from '../components/ui/PageHeader'
import { PROFILES, type SafetyProfile } from '../services/profile'

interface Props {
  profile: SafetyProfile
  onProfileChange: (profile: SafetyProfile) => void
  onTravelCard: () => void
}

const PROFILE_ICONS: Record<SafetyProfile, typeof ShieldCheck> = {
  strict: ShieldCheck,
  sensitive: UserCheck,
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="px-4 text-[20px] font-semibold text-white/60">{title}</h2>}
      <div className="overflow-hidden rounded-[26px] bg-surface">{children}</div>
    </section>
  )
}

/** iOS-achtige rij met icoon links en waarde/pijl rechts; scheidingslijn springt in tot de tekst. */
function Row({
  icon,
  label,
  sub,
  value,
  trailing,
  href,
  onClick,
}: {
  icon: ReactNode
  label: string
  sub?: string
  value?: string
  trailing?: ReactNode
  href?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="flex w-8 shrink-0 justify-center text-white/70">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col border-b border-surface-line py-3.5 pr-4 group-last:border-b-0">
        <span className="flex items-center gap-3">
          <span className="flex-1 text-[17px]">{label}</span>
          {value && <span className="text-[17px] text-muted">{value}</span>}
          {trailing}
        </span>
        {sub && <span className="text-[15px] text-muted">{sub}</span>}
      </span>
    </>
  )
  const className = 'group flex w-full items-center gap-3 pl-4 text-left active:bg-surface-raised'
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    )
  if (onClick)
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    )
  return <div className={className.replace(' active:bg-surface-raised', '')}>{content}</div>
}

export function SettingsPage({ profile, onProfileChange, onTravelCard }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <PageHeader title="Instellingen" />

      <div className="flex flex-col gap-7 px-4 pb-6 pt-5">
        <Group>
          <Row icon={<Info size={22} />} label="Versie" value={__APP_VERSION__} />
          <Row
            icon={<ScanBarcode size={22} />}
            label="Productgegevens van Open Food Facts (ODbL)"
            href="https://world.openfoodfacts.org"
            trailing={<ArrowUpRight size={20} className="text-muted" />}
          />
        </Group>

        <Group title="Veiligheidsprofiel">
          <div className="flex flex-col gap-2 p-2" role="radiogroup" aria-label="Veiligheidsprofiel">
            {(Object.keys(PROFILES) as SafetyProfile[]).map((id) => {
              const selected = id === profile
              const Icon = PROFILE_ICONS[id]
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onProfileChange(id)}
                  className={`flex items-center gap-4 rounded-[20px] border px-4 py-4 text-left transition-colors ${
                    selected ? 'border-accent/60 bg-accent-soft' : 'border-surface-line'
                  }`}
                >
                  <Icon size={26} className={selected ? 'text-accent' : 'text-white/70'} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[19px] font-semibold">{PROFILES[id].title}</span>
                    <span className="text-[15px] leading-snug text-muted">{PROFILES[id].description}</span>
                  </span>
                  {selected ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                      <Check size={18} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-8 w-8 shrink-0 rounded-full border-2 border-white/25" />
                  )}
                </button>
              )
            })}
          </div>
        </Group>

        <Group title="Op reis">
          <Row
            icon={<Languages size={22} />}
            label="Reiskaart voor restaurants"
            sub="Uitleg over coeliakie in 10 talen"
            onClick={onTravelCard}
            trailing={<ChevronRight size={20} className="text-muted" />}
          />
        </Group>

        <Group title="Belangrijk">
          <Row icon={<ShieldAlert size={22} />} label="Medische disclaimer" sub={DISCLAIMER_SHORT} />
        </Group>

        <p className="px-4 text-center text-[13px] leading-relaxed text-muted">
          Volledig gratis: onbeperkt scannen, geen account, geen abonnement. Je profiel en geschiedenis blijven op dit
          toestel.
        </p>
      </div>
    </main>
  )
}
