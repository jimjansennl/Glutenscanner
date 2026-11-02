import { ChevronLeft } from 'lucide-react'

/** Compacte titelbalk bovenaan elk tabblad, zoals de iOS-navigatiebalk. */
export function PageHeader({ title, onBack, className = '' }: { title: string; onBack?: () => void; className?: string }) {
  return (
    <header className={`sticky top-0 z-20 flex h-14 items-end justify-center border-b border-white/5 bg-black/85 pb-2 pt-[env(safe-area-inset-top)] backdrop-blur-xl ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          className="absolute bottom-1 left-2 rounded-full p-2 text-accent active:opacity-60"
          aria-label="Terug"
        >
          <ChevronLeft size={28} />
        </button>
      )}
      <h1 className="text-[19px] font-semibold">{title}</h1>
    </header>
  )
}
