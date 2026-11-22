import { useEffect, useState } from 'react'
import { Heart, Plus, Share2, Store } from 'lucide-react'
import { loadRestaurants, restaurantsUrl, stars, type Restaurant } from '../../services/restaurants'
import { RestaurantSheet, Stars } from './RestaurantSheet'

/** Bewaarde restaurants, opnieuw gelezen zodra er iets verandert. */
function useRestaurants(): Restaurant[] {
  const [list, setList] = useState(loadRestaurants)
  useEffect(() => {
    const update = () => setList(loadRestaurants())
    window.addEventListener('restaurants', update)
    return () => window.removeEventListener('restaurants', update)
  }, [])
  return list
}

/** Beste eerst: meeste sterren, dan lekker, dan nieuwste. */
function sorted(list: Restaurant[]): Restaurant[] {
  return [...list].sort((a, b) => (stars(b.answers) ?? 0) - (stars(a.answers) ?? 0) || Number(!!b.tasty) - Number(!!a.tasty) || b.at - a.at)
}

/** "Mijn restaurants" in Geschiedenis, met delen via een link. */
export function MyRestaurants() {
  const list = useRestaurants()
  const [open, setOpen] = useState<Restaurant | 'nieuw' | null>(null)
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = restaurantsUrl(sorted(list))
    const text = 'Hier kun je goed glutenvrij eten:'
    try {
      if (navigator.share) await navigator.share({ title: 'Mijn restaurants', text, url })
      else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setCopied(true)
      }
    } catch {
      // Delen afgebroken.
    }
  }

  return (
    <section>
      <h2 className="mb-2 flex items-center justify-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-safe">
        <Store size={14} />
        Mijn restaurants
      </h2>
      {list.length === 0 ? (
        <button
          onClick={() => setOpen('nieuw')}
          className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-surface px-4 py-4 text-[16px] font-semibold active:bg-surface-raised"
        >
          <Plus size={18} />
          Bewaar een restaurant waar je hebt gegeten
        </button>
      ) : (
        <>
          <div className="mb-3 flex justify-center gap-2">
            <button onClick={() => setOpen('nieuw')} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold active:bg-white/20">
              <Plus size={16} />
              Nieuw
            </button>
            <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold active:bg-white/20">
              <Share2 size={16} />
              {copied ? 'Link gekopieerd!' : 'Deel de lijst'}
            </button>
          </div>
          <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
            {sorted(list).map((r) => (
              <li key={r.id}>
                <button onClick={() => setOpen(r)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-raised">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[17px]">{r.name}</span>
                      {r.tasty && <Heart size={14} className="shrink-0 text-[#ff6b81]" fill="currentColor" aria-label="Lekker" />}
                    </span>
                    {(r.note || r.place) && <span className="block truncate text-[13px] text-muted">{r.note ?? r.place}</span>}
                  </span>
                  <Stars value={stars(r.answers)} size={14} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {open && <RestaurantSheet initial={open === 'nieuw' ? undefined : open} onClose={() => setOpen(null)} />}
    </section>
  )
}
