import { BookOpen, Camera, Clock3, Settings, type LucideIcon } from 'lucide-react'

export type NavTab = 'scan' | 'history' | 'guide' | 'settings'

const TABS: { id: NavTab; label: string; icon: LucideIcon }[] = [
  { id: 'scan', label: 'Scan', icon: Camera },
  { id: 'history', label: 'Geschiedenis', icon: Clock3 },
  { id: 'guide', label: 'Gids', icon: BookOpen },
  { id: 'settings', label: 'Instellingen', icon: Settings },
]

interface Props {
  active: NavTab | null
  onSelect: (tab: NavTab) => void
}

/** Zwevende tabbalk in pilvorm, zoals iOS 26-apps; het actieve tabblad krijgt een eigen pil. */
export function BottomNav({ active, onSelect }: Props) {
  return (
    <nav className="sticky bottom-0 z-30 bg-gradient-to-t from-black via-black/90 to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <ul className="mx-auto grid max-w-md grid-cols-4 rounded-full border border-white/10 bg-surface/95 p-1.5 shadow-2xl shadow-black backdrop-blur-xl">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
                aria-current={selected ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-0.5 rounded-full py-2 text-[11px] font-semibold transition-colors ${
                  selected ? 'bg-black text-accent' : 'text-white/85 active:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={selected ? 2.4 : 2} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
