/**
 * "Mijn restaurants": waar kon je goed glutenvrij eten? Alleen op deze telefoon (localStorage).
 * De sterren komen vanzelf uit vier vragen over veilig eten; "Lekker!" is een los hartje.
 */

export type Answer = 'ja' | 'nee' | '?'

export const QUESTIONS = [
  { id: 'menu', text: 'Hadden ze glutenvrije gerechten?', weight: 1.5 },
  { id: 'staff', text: 'Wist de bediening wat coeliakie is?', weight: 1.5 },
  { id: 'fryer', text: 'Hebben ze een aparte frituur?', weight: 1 },
  { id: 'bread', text: 'Was er glutenvrij brood of pasta?', weight: 1 },
] as const

export type QuestionId = (typeof QUESTIONS)[number]['id']

export interface Restaurant {
  id: string
  name: string
  /** Straat of plaats, om hem terug te vinden. */
  place?: string
  lat?: number
  lon?: number
  answers: Partial<Record<QuestionId, Answer>>
  note?: string
  tasty?: boolean
  at: number
}

const KEY = 'glutenscanner.restaurants.v1'

export function loadRestaurants(): Restaurant[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Restaurant[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function store(list: Restaurant[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // Telefoon vol: dan bewaren we niets.
  }
  window.dispatchEvent(new Event('restaurants'))
}

export function saveRestaurant(r: Restaurant) {
  const list = loadRestaurants().filter((x) => x.id !== r.id)
  store([{ ...r, at: Date.now() }, ...list])
}

export function removeRestaurant(id: string) {
  store(loadRestaurants().filter((x) => x.id !== id))
}

/**
 * 1 tot 5 sterren uit de vier vragen. "Weet niet" telt niet mee. Nog niets beantwoord: null.
 * Weet de bediening niet wat coeliakie is, dan nooit meer dan 3 sterren: dan is het niet veilig.
 */
export function stars(answers: Restaurant['answers']): number | null {
  let got = 0
  let total = 0
  for (const q of QUESTIONS) {
    const a = answers[q.id]
    if (a === 'ja' || a === 'nee') {
      total += q.weight
      if (a === 'ja') got += q.weight
    }
  }
  if (total === 0) return null
  const s = 1 + Math.round((got / total) * 4)
  return answers.staff === 'nee' ? Math.min(s, 3) : s
}

/** Afstand in meters tussen twee punten (voor "in de buurt"). */
export function distance(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const r = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * r * Math.asin(Math.sqrt(h))
}

export interface Nearby {
  id: string
  name: string
  place?: string
  lat: number
  lon: number
  meters: number
}

/** Je plek, één keer gevraagd. Weigert de gebruiker, dan null. */
export function where(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}

/**
 * Restaurants, cafés en snackbars binnen 250 meter, via OpenStreetMap (gratis, geen account).
 * Alleen je plek (afgerond) gaat daarheen, verder niets.
 */
export async function nearby(at: { lat: number; lon: number }): Promise<Nearby[]> {
  const lat = at.lat.toFixed(4)
  const lon = at.lon.toFixed(4)
  const query = `[out:json][timeout:15];nwr(around:250,${lat},${lon})[amenity~"^(restaurant|cafe|fast_food|ice_cream|pub|bar|food_court|biergarten)$"][name];out center 40;`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as {
    elements?: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[]
  }
  return (data.elements ?? [])
    .map((e): Nearby | null => {
      const p = e.center ?? (e.lat !== undefined && e.lon !== undefined ? { lat: e.lat, lon: e.lon } : null)
      const t = e.tags ?? {}
      if (!p || !t.name) return null
      const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ')
      const place = [street, t['addr:city']].filter(Boolean).join(', ') || undefined
      return { id: `osm-${e.type}-${e.id}`, name: t.name, place, lat: p.lat, lon: p.lon, meters: Math.round(distance(at, p)) }
    })
    .filter((x): x is Nearby => x !== null)
    .sort((a, b) => a.meters - b.meters)
    .slice(0, 15)
}

/* ---- Delen via een link (alles zit in de link, net als de lijst voor opa en oma) ---- */

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

const A: Record<Answer, string> = { ja: 'j', nee: 'n', '?': '-' }
const FROM_A: Record<string, Answer> = { j: 'ja', n: 'nee', '-': '?' }

export function restaurantsUrl(list: Restaurant[]): string {
  const data = {
    t: Math.round(Date.now() / 1000),
    r: list.map((r) => [r.name, r.place ?? '', QUESTIONS.map((q) => A[r.answers[q.id] ?? '?']).join(''), r.tasty ? 1 : 0, r.note ?? '']),
  }
  return `${window.location.origin}/restaurants#${toBase64Url(JSON.stringify(data))}`
}

export function readSharedRestaurants(hash: string): { at: number; list: Restaurant[] } | null {
  try {
    const raw = JSON.parse(fromBase64Url(hash.replace(/^#/, ''))) as { t?: number; r?: [string, string, string, number, string][] }
    if (!Array.isArray(raw.r)) return null
    const list = raw.r
      .filter((x) => Array.isArray(x) && typeof x[0] === 'string')
      .map(([name, place, codes, tasty, note], i) => ({
        id: `gedeeld-${i}`,
        name: name.slice(0, 80),
        place: place?.slice(0, 80) || undefined,
        answers: Object.fromEntries(QUESTIONS.map((q, k) => [q.id, FROM_A[codes?.[k] ?? '-'] ?? '?'])),
        tasty: tasty === 1,
        note: typeof note === 'string' ? note.slice(0, 200) || undefined : undefined,
        at: 0,
      }))
    return { at: (raw.t ?? 0) * 1000, list }
  } catch {
    return null
  }
}
