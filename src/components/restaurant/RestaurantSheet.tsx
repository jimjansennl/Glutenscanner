import { useEffect, useMemo, useState } from 'react'
import { Heart, Loader2, MapPin, Search, Star, Store, Trash2, X } from 'lucide-react'
import {
  QUESTIONS,
  distance,
  loadRestaurants,
  far,
  nearby,
  removeRestaurant,
  saveRestaurant,
  searchByName,
  stars,
  where,
  type Nearby,
  type Restaurant,
} from '../../services/restaurants'

/** 1 tot 5 sterren; null = nog geen sterren. */
export function Stars({ value, size = 18 }: { value: number | null; size?: number }) {
  if (value === null) return <span className="text-[14px] text-muted">Nog geen sterren</span>
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} van de 5 sterren`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? 'text-[#ffd75e]' : 'text-white/20'} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  )
}

interface Props {
  /** Bestaand restaurant bewerken; leeg = eerst een restaurant kiezen. */
  initial?: Restaurant
  onClose: () => void
}

/**
 * Restaurant bewaren: kies een restaurant in de buurt (of typ de naam), beantwoord vier vragen,
 * de sterren komen vanzelf. Los daarvan een hartje "Lekker!" en een notitie.
 */
export function RestaurantSheet({ initial, onClose }: Props) {
  const [chosen, setChosen] = useState<Restaurant | null>(initial ?? null)

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-black text-white">
      <header className="relative flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold">
          <Store size={19} className="text-safe" />
          {chosen ? 'Hoe was het?' : 'Welk restaurant?'}
        </h1>
        <button onClick={onClose} className="absolute right-4 rounded-full bg-white/10 p-2.5 active:bg-white/20" aria-label="Sluiten">
          <X size={22} />
        </button>
      </header>
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {chosen ? (
          <Rate restaurant={chosen} isNew={!initial && !loadRestaurants().some((r) => r.id === chosen.id)} onDone={onClose} />
        ) : (
          <Pick onPick={setChosen} />
        )}
      </div>
    </div>
  )
}

/** Stap 1: restaurant kiezen. Om je heen (500 m), of zoeken op naam (15 km), of zelf typen. */
function Pick({ onPick }: { onPick: (r: Restaurant) => void }) {
  const [state, setState] = useState<'zoeken' | 'klaar' | 'geen-plek' | 'mislukt'>('zoeken')
  const [list, setList] = useState<Nearby[]>([])
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null)
  const [typed, setTyped] = useState('')
  const [found, setFound] = useState<{ q: string; list: Nearby[] } | null>(null)
  const saved = useMemo(() => loadRestaurants(), [])

  useEffect(() => {
    let stop = false
    void (async () => {
      const at = await where()
      if (stop) return
      if (!at) return setState('geen-plek')
      setHere(at)
      try {
        const near = await nearby(at)
        if (stop) return
        setList(near)
        setState('klaar')
      } catch {
        if (!stop) setState('mislukt')
      }
    })()
    return () => {
      stop = true
    }
  }, [])

  // Zoeken op naam, even wachten tot je klaar bent met typen.
  const q = typed.trim()
  useEffect(() => {
    // Wachten tot we weten of we je plek hebben; daarna zoeken, met of zonder plek.
    if (state === 'zoeken' || q.length < 2) return
    let stop = false
    const timer = setTimeout(async () => {
      const res = await searchByName(q, here).catch(() => [])
      if (!stop) setFound({ q, list: res })
    }, 500)
    return () => {
      stop = true
      clearTimeout(timer)
    }
  }, [here, q, state])

  const searching = state !== 'zoeken' && q.length >= 2
  const results = searching && found?.q === q ? found.list : null
  const savedMatch = q.length >= 2 ? saved.filter((r) => r.name.toLowerCase().includes(q.toLowerCase())) : []

  // Al bewaarde restaurants vlakbij (binnen 500 m) komen bovenaan.
  const savedNear = here ? saved.filter((r) => r.lat !== undefined && r.lon !== undefined && distance(here, { lat: r.lat, lon: r.lon }) < 500) : []
  const fresh = list.filter((n) => !saved.some((r) => r.id === n.id))

  const fromOsm = (n: Nearby): Restaurant =>
    saved.find((r) => r.id === n.id) ?? {
      id: n.id,
      name: n.name,
      place: n.place,
      lat: n.lat,
      lon: n.lon,
      answers: {},
      at: 0,
    }
  const pickTyped = () => {
    if (!q) return
    const same = saved.find((r) => r.name.toLowerCase() === q.toLowerCase())
    onPick(
      same ?? {
        id: `eigen-${crypto.randomUUID()}`,
        name: q,
        answers: {},
        at: 0,
      },
    )
  }

  const Row = ({ n }: { n: Nearby }) => {
    const known = saved.find((r) => r.id === n.id)
    return (
      <li>
        <button onClick={() => onPick(fromOsm(n))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-raised">
          {known ? <Store size={20} className="shrink-0 text-safe" /> : <MapPin size={20} className="shrink-0 text-white/50" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] font-semibold">{n.name}</span>
            <span className="block truncate text-[13px] text-muted">{known ? 'Al bewaard' : n.place}</span>
          </span>
          {n.meters !== undefined && <span className="shrink-0 text-[13px] text-muted">{far(n.meters)}</span>}
        </button>
      </li>
    )
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (results?.length === 1) onPick(fromOsm(results[0]))
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="rest-name" className="px-1 text-[14px] text-muted">
          {here ? 'Zoek op naam, of kies hieronder' : 'Zoek op naam'}
        </label>
        <div className="relative">
          <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            id="rest-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            maxLength={80}
            autoComplete="off"
            placeholder="Bijvoorbeeld Roma"
            className="w-full rounded-full bg-white py-3 pl-11 pr-4 text-[17px] text-black outline-none ring-accent focus:ring-2"
          />
        </div>
      </form>

      {q.length >= 2 ? (
        <>
          {savedMatch.length > 0 && (
            <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
              {savedMatch.map((r) => (
                <li key={r.id}>
                  <button onClick={() => onPick(r)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-raised">
                    <Store size={20} className="shrink-0 text-safe" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[17px] font-semibold">{r.name}</span>
                      <span className="text-[13px] text-muted">Al bewaard</span>
                    </span>
                    <Stars value={stars(r.answers)} size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {searching && !results && (
            <p className="flex items-center justify-center gap-2 py-2 text-[15px] text-white/70">
              <Loader2 size={16} className="animate-spin" />
              Ik zoek "{q}"…
            </p>
          )}
          {results && results.filter((n) => !savedMatch.some((r) => r.id === n.id)).length > 0 && (
            <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
              {results
                .filter((n) => !savedMatch.some((r) => r.id === n.id))
                .map((n) => (
                  <Row key={n.id} n={n} />
                ))}
            </ul>
          )}
          {results && results.length === 0 && savedMatch.length === 0 && (
            <p className="text-center text-[15px] text-white/70">Niets gevonden. Probeer een deel van de naam, of bewaar hem zonder adres.</p>
          )}
          <button onClick={pickTyped} className="rounded-full bg-surface py-3 text-[16px] font-semibold active:bg-surface-raised">
            "{q}" bewaren zonder adres
          </button>
        </>
      ) : (
        <>
          {state === 'zoeken' && (
            <p className="flex items-center justify-center gap-2 py-4 text-[16px] text-white/70">
              <Loader2 size={18} className="animate-spin" />
              Ik zoek restaurants om je heen…
            </p>
          )}
          {state === 'geen-plek' && (
            <p className="text-center text-[15px] leading-snug text-white/70">
              Ik weet niet waar je bent, dus ik zoek in heel Nederland. Typ de naam van het restaurant.
              <br />
              <span className="text-muted">Restaurants om je heen zien? Zet locatie aan voor je browser in de instellingen van je telefoon.</span>
            </p>
          )}
          {state === 'mislukt' && <p className="text-center text-[16px] text-white/70">Zoeken om je heen lukte niet. Typ de naam.</p>}
          {(savedNear.length > 0 || fresh.length > 0) && (
            <>
              <h2 className="px-1 text-[15px] font-semibold text-muted">Om je heen</h2>
              <ul className="divide-y divide-surface-line overflow-hidden rounded-[22px] bg-surface">
                {savedNear.map((r) => (
                  <li key={r.id}>
                    <button onClick={() => onPick(r)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-raised">
                      <Store size={20} className="shrink-0 text-safe" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[17px] font-semibold">{r.name}</span>
                        <span className="text-[13px] text-muted">Al bewaard</span>
                      </span>
                      <Stars value={stars(r.answers)} size={14} />
                    </button>
                  </li>
                ))}
                {fresh.map((n) => (
                  <Row key={n.id} n={n} />
                ))}
              </ul>
            </>
          )}
          {state === 'klaar' && fresh.length === 0 && savedNear.length === 0 && (
            <p className="text-center text-[16px] text-white/70">Geen restaurants om je heen. Zoek hierboven op naam.</p>
          )}
        </>
      )}
      {state !== 'geen-plek' && <p className="text-center text-[13px] text-muted">Je plek wordt alleen gebruikt om restaurants te vinden.</p>}
    </>
  )
}

/** Stap 2: vier vragen, sterren, hartje en notitie. */
function Rate({ restaurant, isNew, onDone }: { restaurant: Restaurant; isNew: boolean; onDone: () => void }) {
  const [answers, setAnswers] = useState(restaurant.answers)
  const [tasty, setTasty] = useState(!!restaurant.tasty)
  const [note, setNote] = useState(restaurant.note ?? '')
  const score = stars(answers)

  const save = () => {
    saveRestaurant({
      ...restaurant,
      answers,
      tasty,
      note: note.trim() || undefined,
    })
    onDone()
  }

  return (
    <>
      <div className="text-center">
        <p className="text-[24px] font-extrabold leading-tight">{restaurant.name}</p>
        {restaurant.place && <p className="text-[15px] text-muted">{restaurant.place}</p>}
        <div className="mt-2 flex justify-center">
          <Stars value={score} size={26} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="px-1 text-center text-[14px] text-muted">Weet je iets niet? Sla die vraag gewoon over.</p>
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-[20px] bg-surface p-4">
            <p className="text-[17px] font-semibold leading-snug">{q.text}</p>
            <div className={`mt-3 grid gap-2 ${q.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {q.options.map(([a, label]) => {
                const on = answers[q.id] === a
                return (
                  <button
                    key={a}
                    // Nog een keer tikken = weer leeg (overgeslagen).
                    onClick={() => setAnswers((x) => ({ ...x, [q.id]: on ? '?' : a }))}
                    aria-pressed={on}
                    className={`rounded-full py-2.5 text-[15px] font-semibold ${on ? 'bg-white text-black' : 'bg-white/10 active:bg-white/20'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setTasty((t) => !t)}
        aria-pressed={tasty}
        className={`flex items-center justify-center gap-2 rounded-full py-3 text-[17px] font-semibold ${tasty ? 'bg-[#ff6b81] text-white' : 'bg-surface'}`}
      >
        <Heart size={20} fill={tasty ? 'currentColor' : 'none'} />
        Lekker!
      </button>

      <div className="flex flex-col gap-2">
        <label htmlFor="rest-note" className="px-1 text-[14px] text-muted">
          Wat was goed? (mag leeg)
        </label>
        <textarea
          id="rest-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Bijvoorbeeld: pizza met glutenvrije bodem"
          className="rounded-[18px] bg-surface px-4 py-3 text-[17px] outline-none ring-accent focus:ring-2"
        />
      </div>

      <button onClick={save} className="rounded-full bg-safe py-3.5 text-[17px] font-bold text-black active:opacity-80">
        {isNew ? 'Bewaar restaurant' : 'Opslaan'}
      </button>
      {!isNew && (
        <button
          onClick={() => {
            removeRestaurant(restaurant.id)
            onDone()
          }}
          className="flex items-center justify-center gap-1.5 py-2 text-[15px] text-danger"
        >
          <Trash2 size={16} />
          Verwijderen
        </button>
      )}
    </>
  )
}
