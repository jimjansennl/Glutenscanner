import type { ReactNode } from 'react'
import { Camera, ChevronRight, Infinity as InfinityIcon, Languages, ScanBarcode, Settings, ShieldCheck } from 'lucide-react'
import { PROFILES, type SafetyProfile } from '../services/profile'

interface Props {
  profile: SafetyProfile
  onScan: (mode: 'barcode' | 'photo') => void
  onTravelCard: () => void
  onSettings: () => void
}

function SecondaryCard({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-[22px] bg-surface p-4 text-center active:bg-surface-raised"
    >
      {icon}
      <span className="text-[17px] font-semibold leading-tight">{title}</span>
      <span className="text-[13px] leading-snug text-muted">{subtitle}</span>
    </button>
  )
}

export function HomePage({ profile, onScan, onTravelCard, onSettings }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="relative flex flex-col items-center gap-1 pb-2 text-center">
        <button
          onClick={onSettings}
          className="absolute -top-2 right-0 rounded-full bg-surface p-2.5 text-muted active:bg-surface-raised"
          aria-label="Instellingen"
        >
          <Settings size={20} />
        </button>
        <h1 className="text-[34px] font-bold leading-tight tracking-tight">Glutenscanner</h1>
        <p className="flex items-center gap-1.5 text-[15px] text-muted">
          <InfinityIcon size={16} className="text-safe" />
          Gratis en onbeperkt scannen
        </p>
      </header>

      <button
        onClick={() => onScan('barcode')}
        className="relative flex flex-col items-center overflow-hidden rounded-[28px] bg-surface px-6 py-9 text-center transition-transform active:scale-[0.98]"
      >
        <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/3 rounded-full bg-safe/20 blur-3xl" aria-hidden />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-safe/15 ring-2 ring-safe shadow-[0_0_36px_-4px] shadow-safe/60">
          <ScanBarcode size={44} className="text-safe" />
        </span>
        <span className="relative mt-6 text-[26px] font-bold tracking-tight">Scan barcode</span>
        <span className="relative mt-1 text-[15px] text-muted">EAN, UPC of QR-code. Direct resultaat.</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <SecondaryCard
          onClick={() => onScan('photo')}
          icon={
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/15">
              <Camera size={24} className="text-warning" />
            </span>
          }
          title="Foto / Menu"
          subtitle="Etiket of menukaart"
        />
        <SecondaryCard
          onClick={onTravelCard}
          icon={
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
              <Languages size={24} className="text-sky-400" />
            </span>
          }
          title="Reiskaart"
          subtitle="Uitleg voor de bediening"
        />
      </div>

      <button
        onClick={onSettings}
        className="flex items-center justify-center gap-1.5 self-center rounded-full bg-surface px-4 py-2 text-[13px] text-muted active:bg-surface-raised"
      >
        <ShieldCheck size={15} className="text-safe" />
        Profiel: <span className="font-semibold text-white">{PROFILES[profile].title}</span>
        <ChevronRight size={14} />
      </button>
    </main>
  )
}
