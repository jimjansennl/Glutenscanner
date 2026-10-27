import { Check, HeartPulse, ShieldAlert } from 'lucide-react'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PROFILES, type SafetyProfile } from '../services/profile'

interface Props {
  profile: SafetyProfile
  onProfileChange: (profile: SafetyProfile) => void
}

const ICONS: Record<SafetyProfile, { icon: typeof ShieldAlert; color: string }> = {
  strict: { icon: ShieldAlert, color: 'text-danger bg-danger/15' },
  sensitive: { icon: HeartPulse, color: 'text-warning bg-warning/15' },
}

export function SettingsPage({ profile, onProfileChange }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="pt-4 text-center text-[34px] font-bold leading-tight tracking-tight">Instellingen</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-center text-[13px] font-medium uppercase tracking-wide text-muted">Veiligheidsprofiel</h2>
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Veiligheidsprofiel">
          {(Object.keys(PROFILES) as SafetyProfile[]).map((id) => {
            const selected = id === profile
            const { icon: Icon, color } = ICONS[id]
            return (
              <button
                key={id}
                role="radio"
                aria-checked={selected}
                onClick={() => onProfileChange(id)}
                className={`relative flex flex-col items-center gap-2 rounded-[22px] bg-surface p-5 text-center transition-shadow ${
                  selected ? 'ring-2 ring-safe' : 'active:bg-surface-raised'
                }`}
              >
                {selected && (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-safe text-black">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
                  <Icon size={24} />
                </span>
                <span className="text-[17px] font-semibold">{PROFILES[id].title}</span>
                <span className="text-[15px] leading-snug text-muted">{PROFILES[id].description}</span>
              </button>
            )
          })}
        </div>
        <p className="px-4 text-center text-[13px] leading-snug text-muted">
          Geldt direct voor nieuwe scans én je historie. Harde glutenbronnen zijn in beide profielen altijd rood.
        </p>
      </section>

      <section className="flex flex-col items-center gap-2 rounded-[22px] bg-surface p-5 text-center">
        <h2 className="text-[13px] font-medium uppercase tracking-wide text-muted">Over deze app</h2>
        <p className="text-[15px] leading-relaxed text-white/85">
          Gratis, zonder limieten en zonder account. Je profiel en historie blijven alleen op dit toestel.
        </p>
        <p className="text-[13px] leading-relaxed text-muted">
          Productdata: Open Food Facts (ODbL). {DISCLAIMER_SHORT}
        </p>
      </section>
    </main>
  )
}
