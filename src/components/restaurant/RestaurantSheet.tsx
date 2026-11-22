import { useEffect, useMemo, useState } from 'react'
import { Heart, Loader2, MapPin, Search, Star, Store, Trash2, X } from 'lucide-react'
import {
  QUESTIONS,
  distance,
  loadRestaurants,
  nearby,
  removeRestaurant,
  saveRestaurant,
  stars,
  where,
  type Answer,
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

const ANSWERS: [Answer, string][] = [
  ['ja', 'Ja'],
  ['nee', 'Nee'],
  ['?', 'Weet niet'],
]

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
        {chosen ? <Rate restaurant={chosen} isNew={!initial && !loadRestaurants().some((r) => r.id === chosen.id)} onDone={onClose} /> : <Pick onPick={setChosen} />}
      </div>
    </div>
  )
}

/** Stap 1: restaurant kiezen. Eerst in de buurt, anders zelf typen. */
function Pick({ onPick }: { onPick: (r: Restaurant) => void }) {
  const [state, setState] = useState<'zoeken' | 'klaar' | 'geen-plek' | 'mislukt'>('zoeken')
  const [list, setList] = useState<Nearby[]>([])
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null)
  const [typed, setTyped] = useState('')
  const saved = useMemo(() => loadRestaurants(), [])

  useEffect(() => {
    let stop = false
    void (async () => {
      const at = await where()
      if (stop) return
      if (!at) return setState('geen-plek')
      setHere(at)
      try {
        const found = await nearby(at)
        if (stop) return
        setList(found)
        setState('klaar')
      } catch {
        if (!stop) setState('mislukt')
      }
    })()
    return () => {
      stop = true
    }
  }, [])

  // Al bewaarde restaurants vlakbij (binnen 300 m) komen bovenaan.
  const savedNear = here ? saved.filter((r) => r.lat !== undefined && r.lon !== undefined && distance(here, { lat: r.lat, lon: r.lon }) < 300) : []
  const fresh = list.filter((n) => !saved.some((r) => r.id === n.id))

  const pickNearby = (n: Nearby) => onPick({ id: n.id, name: n.name, place: n.place, lat: n.lat, lon: n.lon, answers: {}, at: 0 })
  const pickTyped = () => {
    const name = typed.trim()
    if (!name) return
    const same = saved.find((r) => r.name.toLowerCase() === name.toLowerCase())
    onPick(same ?? { id: `eigen-${crypto.randomUUID()}`, name, lat: here?.lat, lon: here?.lon, answers: {}, at: 0 })
  }

  return (
    <>
      {state === 'zoeken' && (
        <p className="flex items-center justify-center gap-2 py-6 text-[16px] text-white/70">
          <Loader2 size={18} className="animate-spin" />
          Ik zoek restaurants in de buurt…
        </p>
      )}
      {state === 'geen-plek' && <p className="text-center text-[16px] text-white/70">Ik weet niet waar je bent. Typ hieronder de naam van het restaurant.</p>}
      {state === 'mislukt' && <p className="text-center text-[16px] text-white/70">Zoeken in de buurt lukte niet. Typ hieronder de naam.</p>}

      {(savedNear.length > 0 || fresh.length > 0) && (
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
            <li key={n.id}>
              <button onClick={() => pickNearby(n)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-surface-raised">
                <MapPin size={20} className="shrink-0 text-white/50" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-semibold">{n.name}</span>
                  {n.place && <span className="block truncate text-[13px] text-muted">{n.place}</span>}
                </span>
                <span className="shrink-0 text-[13px] text-muted">{n.meters} m</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {state === 'klaar' && fresh.length === 0 && savedNear.length === 0 && (
        <p className="text-center text-[16px] text-white/70">Ik vind hier geen restaurants. Typ hieronder de naam.</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          pickTyped()
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="rest-name" className="px-1 text-[14px] text-muted">
          {state === 'klaar' ? 'Staat hij er niet bij? Typ de naam.' : 'Naam van het restaurant'}
        </label>
        <div className="flex gap-2">
          <input
            id="rest-name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            maxLength={80}
            placeholder="Bijvoorbeeld Pizzeria Roma"
            className="min-w-0 flex-1 rounded-full bg-surface px-4 py-3 text-[17px] outline-none ring-accent focus:ring-2"
          />
          <button type="submit" disabled={!typed.trim()} className="rounded-full bg-safe px-4 text-black disabled:opacity-40" aria-label="Verder">
            <Search size={20} />
          </button>
        </div>
      </form>
      {state !== 'geen-plek' && <p className="text-center text-[13px] text-muted">Je plek wordt alleen gebruikt om restaurants in de buurt te vinden.</p>}
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
    saveRestaurant({ ...restaurant, answers, tasty, note: note.trim() || undefined })
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
        {QUESTIONS.map((q) => (
          <div key={q.id} className="rounded-[20px] bg-surface p-4">
            <p className="text-[17px] font-semibold leading-snug">{q.text}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {ANSWERS.map(([a, label]) => {
                const on = answers[q.id] === a
                return (
                  <button
                    key={a}
                    onClick={() => setAnswers((x) => ({ ...x, [q.id]: a }))}
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
