import { BookOpen, Camera, History, House, ScanBarcode, type LucideIcon } from 'lucide-react'

export type NavTab = 'home' | 'barcode' | 'photo' | 'guide' | 'history'

const TABS: { id: NavTab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Start', icon: House },
  { id: 'barcode', label: 'Barcode', icon: ScanBarcode },
  { id: 'photo', label: 'Foto / Menu', icon: Camera },
  { id: 'guide', label: 'Gids', icon: BookOpen },
  { id: 'history', label: 'Historie', icon: History },
]

interface Props {
  active: NavTab
  onSelect: (tab: NavTab) => void
}

/** iOS-achtige tabbalk onderin, doorschijnend zodat hij ook over de camera werkt. */
export function BottomNav({ active, onSelect }: Props) {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/10 bg-black/75 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const selected = id === active
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(id)}
                aria-current={selected ? 'page' : undefined}
                className={`flex w-full flex-col items-center gap-1 pb-2 pt-2.5 text-[10px] font-medium transition-colors ${
                  selected ? 'text-safe' : 'text-muted active:text-white'
                }`}
              >
                <Icon size={24} strokeWidth={selected ? 2.4 : 1.9} />
                {label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
