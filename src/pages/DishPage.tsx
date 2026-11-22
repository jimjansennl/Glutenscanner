import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2, MessageCircleQuestion, Plus, RefreshCw, UtensilsCrossed, WifiOff, X } from 'lucide-react'
import { DISH_PARTS, GROUP_TITLE, PICK_ORDER, type DishGroup } from '../data/dishParts'
import { SaveRestaurantButton } from '../components/restaurant/SaveRestaurantButton'
import { askDish, clearWaiting, saveWaiting, shrink, type DishAnswer, type DishError, type DishPick } from '../services/dish'

interface Props {
  imageUrl: string
  /** De foto; ontbreekt als het antwoord al klaarstaat (foto van eerder, zonder internet gemaakt). */
  image?: Blob
  /** Antwoord dat al binnen is. */
  answer?: DishAnswer
  onClose: () => void
  /** Toch een etiket of menukaart: de tekst laten lezen. */
  onReadText: () => void
  onTravelCard: () => void
}

type State = 'kijken' | 'klaar' | DishError

const GROUPS: DishGroup[] = ['let', 'vraag', 'goed']

/**
 * Uitslag van een foto van een bord eten. Bewust zonder groen, oranje of rood: gluten zie je niet.
 * Per onderdeel een rustige tip en de vraag voor de bediening. Klopt iets niet, dan tik je het weg
 * of zet je het om ("Of is het rijst?"); mist er iets, dan tik je het aan.
 */
export function DishPage({ imageUrl, image, answer, onClose, onReadText, onTravelCard }: Props) {
  const [state, setState] = useState<State>(answer ? 'klaar' : 'kijken')
  const [dish, setDish] = useState(answer?.dish ?? '')
  const [several, setSeveral] = useState(answer?.several ?? false)
  const [parts, setParts] = useState<DishPick[]>(answer?.parts ?? [])
  const [picking, setPicking] = useState(false)
  const [byAi, setByAi] = useState(!!answer)
  const base64 = useRef<string | null>(null)
  const readText = useRef(onReadText)
  useEffect(() => {
    readText.current = onReadText
  }, [onReadText])

  const look = useCallback(async () => {
    if (!image) return
    try {
      base64.current ??= await shrink(image)
      const res = await askDish(base64.current)
      clearWaiting()
      // Geen eten (toch een etiket of menukaart)? Dan meteen de tekst laten lezen.
      if (!res.food) {
        readText.current()
        return
      }
      setDish(res.dish)
      setSeveral(res.several)
      // Wat de gebruiker zelf al had aangetikt, blijft staan.
      setParts((own) => [...res.parts, ...own.filter((p) => !res.parts.some((r) => r.id === p.id))])
      setByAi(true)
      setState('klaar')
    } catch (e) {
      const err: DishError = e === 'offline' || e === 'limiet' ? e : 'mislukt'
      if (err === 'offline' && base64.current) saveWaiting(await shrink(image, 640, 0.7))
      setState(err)
      setPicking(true)
    }
  }, [image])

  // Via een ref: het bekijken gebeurt op de achtergrond (na het verkleinen), niet tijdens het tekenen.
  const lookRef = useRef(look)
  useEffect(() => {
    lookRef.current = look
  }, [look])
  useEffect(() => {
    if (!answer) void lookRef.current()
  }, [answer])

  // Weer internet terwijl dit scherm openstaat: meteen alsnog bekijken.
  useEffect(() => {
    if (state !== 'offline') return
    const again = () => {
      setState('kijken')
      void look()
    }
    window.addEventListener('online', again)
    return () => window.removeEventListener('online', again)
  }, [state, look])

  const toggle = (id: string) =>
    setParts((p) => (p.some((x) => x.id === id) ? p.filter((x) => x.id !== id) : [...p, { id }]))
  const swap = (id: string) =>
    setParts((p) => p.map((x) => (x.id === id && x.alt ? { id: x.alt, alt: x.id } : x)))

  const asks = [...new Set(parts.map((p) => DISH_PARTS[p.id]).filter((d) => d.group !== 'goed' && d.ask).map((d) => d.ask!))]
  const showList = state === 'klaar' || parts.length > 0

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-black text-white">
      <header className="relative flex items-center justify-center p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="flex items-center gap-2 text-[17px] font-semibold">
          <UtensilsCrossed size={19} className="text-safe" />
          Gerecht
        </h1>
        <button onClick={onClose} className="absolute right-4 rounded-full bg-white/10 p-2.5 active:bg-white/20" aria-label="Sluiten">
          <X size={22} />
        </button>
      </header>

      <div className="flex flex-col gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="relative overflow-hidden rounded-[24px]">
          <img src={imageUrl} alt="Je foto" className="h-48 w-full object-cover" />
          {state === 'kijken' && (
            <>
              <span className="absolute inset-x-0 h-1 animate-scanline bg-safe shadow-[0_0_24px_6px] shadow-safe/70" />
              <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-black/70 px-4 py-2 text-[15px] font-semibold backdrop-blur-xl">
                <Loader2 size={16} className="animate-spin" />
                Ik bekijk je gerecht…
              </span>
            </>
          )}
        </div>

        {state === 'klaar' && (
          <div className="text-center">
            {dish && <p className="text-[26px] font-extrabold leading-tight">{dish}</p>}
            <p className="mt-1 text-[16px] leading-snug text-white/75">Gluten zie je niet op een foto. Hier let je op.</p>
            {several && (
              <p className="mt-2 text-[15px] leading-snug text-muted">
                {parts.some((p) => p.id === 'brood' || p.id === 'wrap')
                  ? 'Gedeelde schalen? Kruimels van brood komen dan makkelijk overal in. Neem als eerste, of vraag een eigen schaaltje.'
                  : 'Ik zie meer gerechten. Kijk bij elk gerecht even naar de tips.'}
              </p>
            )}
          </div>
        )}

        {state === 'offline' && (
          <Note icon={<WifiOff size={20} />}>
            Geen internet. Ik bekijk de foto zodra je weer internet hebt. Tik intussen aan wat erin zit.
          </Note>
        )}
        {(state === 'mislukt' || state === 'limiet') && (
          <Note icon={<RefreshCw size={20} />}>
            {state === 'limiet' ? 'Het is nu even te druk.' : 'Het lukte niet om de foto te bekijken.'} Tik zelf aan wat erin zit, of{' '}
            <button
              onClick={() => {
                setState('kijken')
                void look()
              }}
              className="font-semibold text-accent underline"
            >
              probeer het opnieuw
            </button>
            .
          </Note>
        )}
        {showList &&
          GROUPS.map((g) => {
            const list = parts.filter((p) => DISH_PARTS[p.id].group === g)
            if (list.length === 0) return null
            return (
              <section key={g} className="flex flex-col gap-2">
                <h2 className="px-1 text-[15px] font-semibold text-muted">{GROUP_TITLE[g]}</h2>
                {list.map((p) => {
                  const d = DISH_PARTS[p.id]
                  return (
                    <div key={p.id} className="flex gap-3 rounded-[20px] bg-surface p-4">
                      <span className="text-[26px] leading-none">{d.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[17px] font-bold">{d.label}</p>
                        <p className="mt-0.5 text-[15px] leading-snug text-white/80">{d.tip}</p>
                        {p.alt && (
                          <button onClick={() => swap(p.id)} className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-[14px] font-semibold">
                            Of {DISH_PARTS[p.alt].plural ? 'zijn' : 'is'} het {DISH_PARTS[p.alt].label.toLowerCase()}?
                          </button>
                        )}
                      </div>
                      <button onClick={() => toggle(p.id)} className="self-start rounded-full p-1 text-white/40 active:text-white" aria-label={`${d.label} weghalen`}>
                        <X size={18} />
                      </button>
                    </div>
                  )
                })}
              </section>
            )
          })}

        {state !== 'kijken' && (
          <section className="flex flex-col gap-3">
            {!picking ? (
              <button onClick={() => setPicking(true)} className="flex items-center justify-center gap-2 rounded-full bg-surface py-3 text-[16px] font-semibold">
                <Plus size={18} />
                Mist er iets? Tik het aan
              </button>
            ) : (
              <>
                <h2 className="px-1 text-[15px] font-semibold text-muted">Wat zit erin?</h2>
                <div className="flex flex-wrap gap-2">
                  {PICK_ORDER.map((id) => {
                    const on = parts.some((p) => p.id === id)
                    return (
                      <button
                        key={id}
                        onClick={() => toggle(id)}
                        aria-pressed={on}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-semibold ${on ? 'bg-white text-black' : 'bg-surface'}`}
                      >
                        <span>{DISH_PARTS[id].emoji}</span>
                        {DISH_PARTS[id].label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {asks.length > 0 && (
          <section className="rounded-[24px] bg-surface p-4">
            <h2 className="flex items-center gap-2 text-[17px] font-bold">
              <MessageCircleQuestion size={20} className="text-safe" />
              Vraag de bediening
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-[16px] leading-snug text-white/85">
              {asks.map((q) => (
                <li key={q}>• {q}</li>
              ))}
            </ul>
            <button onClick={onTravelCard} className="mt-3 text-[15px] font-semibold text-accent">
              Laat de kaart voor de bediening zien
            </button>
          </section>
        )}

        {state !== 'kijken' && <SaveRestaurantButton />}

        {byAi && <p className="text-center text-[13px] text-muted">De foto is even bekeken door AI en niet bewaard.</p>}
      </div>
    </div>
  )
}

function Note({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[20px] bg-surface p-4 text-[16px] leading-snug text-white/85">
      <span className="mt-0.5 shrink-0 text-white/60">{icon}</span>
      <p>{children}</p>
    </div>
  )
}
