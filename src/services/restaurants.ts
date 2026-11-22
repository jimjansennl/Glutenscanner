/**
 * "Mijn restaurants": waar kon je goed glutenvrij eten? Alleen op deze telefoon (localStorage).
 * De sterren komen vanzelf uit vier vragen over veilig eten; "Lekker!" is een los hartje.
 */

/** "half" = een beetje (een paar gerechten, de bediening wist er een beetje van). '?' = niet beantwoord. */
export type Answer = 'ja' | 'half' | 'nee' | '?'

/**
 * Per vraag de knoppen (zonder "Weet niet": niet aantikken = overslaan) en de korte zinnen voor de
 * gedeelde lijst. Een antwoord "half" telt voor de helft mee.
 */
export const QUESTIONS = [
  {
    id: 'menu',
    text: 'Hadden ze glutenvrije gerechten?',
    weight: 1.5,
    options: [
      ['ja', 'Veel keus'],
      ['half', 'Een paar'],
      ['nee', 'Nee'],
    ],
    said: {
      ja: 'Veel glutenvrije gerechten',
      half: 'Een paar glutenvrije gerechten',
      nee: 'Geen glutenvrije gerechten',
    },
  },
  {
    id: 'staff',
    text: 'Wist de bediening wat coeliakie is?',
    weight: 1.5,
    options: [
      ['ja', 'Ja, goed'],
      ['half', 'Een beetje'],
      ['nee', 'Nee'],
    ],
    said: {
      ja: 'Bediening weet het',
      half: 'Bediening wist er een beetje van',
      nee: 'Bediening wist het niet',
    },
  },
  {
    id: 'fryer',
    text: 'Hebben ze een aparte frituur?',
    weight: 1,
    options: [
      ['ja', 'Ja'],
      ['nee', 'Nee'],
    ],
    said: {
      ja: 'Aparte frituur',
      half: 'Aparte frituur',
      nee: 'Geen aparte frituur',
    },
  },
  {
    id: 'bread',
    text: 'Was er glutenvrij brood of pasta?',
    weight: 1,
    options: [
      ['ja', 'Ja'],
      ['nee', 'Nee'],
    ],
    said: {
      ja: 'Glutenvrij brood of pasta',
      half: 'Glutenvrij brood of pasta',
      nee: 'Geen glutenvrij brood of pasta',
    },
  },
] as const satisfies readonly {
  id: string
  text: string
  weight: number
  options: readonly (readonly [Answer, string])[]
  said: Record<'ja' | 'half' | 'nee', string>
}[]

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
 * Weinig antwoorden = weinig zekerheid: met 1 antwoord max. 3 sterren, met 2 max. 4.
 */
export function stars(answers: Restaurant['answers']): number | null {
  let got = 0
  let total = 0
  let count = 0
  for (const q of QUESTIONS) {
    const a = answers[q.id]
    if (a === 'ja' || a === 'half' || a === 'nee') {
      total += q.weight
      count++
      got += q.weight * (a === 'ja' ? 1 : a === 'half' ? 0.5 : 0)
    }
  }
  if (total === 0) return null
  let s = 1 + Math.round((got / total) * 4)
  if (count <= 2) s = Math.min(s, count + 2)
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
  /** Afstand tot jou; leeg als we je plek niet weten. */
  meters?: number
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

const AMENITY = '[amenity~"^(restaurant|cafe|fast_food|ice_cream|pub|bar|food_court|biergarten)$"]'

async function overpass(at: { lat: number; lon: number }, filter: string, limit: number): Promise<Nearby[]> {
  const query = `[out:json][timeout:20];nwr${filter}${AMENITY}[name];out center ${limit};`
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as {
    elements?: {
      type: string
      id: number
      lat?: number
      lon?: number
      center?: { lat: number; lon: number }
      tags?: Record<string, string>
    }[]
  }
  return (data.elements ?? [])
    .map((e): Nearby | null => {
      const p = e.center ?? (e.lat !== undefined && e.lon !== undefined ? { lat: e.lat, lon: e.lon } : null)
      const t = e.tags ?? {}
      if (!p || !t.name) return null
      const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ')
      const place = [street, t['addr:city']].filter(Boolean).join(', ') || undefined
      return {
        id: `osm-${e.type}-${e.id}`,
        name: t.name,
        place,
        lat: p.lat,
        lon: p.lon,
        meters: Math.round(distance(at, p)),
      }
    })
    .filter((x): x is Nearby => x !== null)
    .sort((a, b) => (a.meters ?? 0) - (b.meters ?? 0))
}

const round = (at: { lat: number; lon: number }) => `${at.lat.toFixed(3)},${at.lon.toFixed(3)}`

/**
 * Restaurants, cafés en snackbars om je heen (500 m), via OpenStreetMap (gratis, geen account).
 * Alleen je plek (afgerond op ±100 m) gaat daarheen, verder niets.
 */
export async function nearby(at: { lat: number; lon: number }): Promise<Nearby[]> {
  return (await overpass(at, `(around:500,${round(at)})`, 60)).slice(0, 15)
}

const KINDS = ['restaurant', 'cafe', 'fast_food', 'ice_cream', 'pub', 'bar', 'food_court', 'biergarten']
const NL_BOX = '3.2,50.7,7.3,53.6'
const OSM_TYPE: Record<string, string> = {
  N: 'node',
  W: 'way',
  R: 'relation',
  node: 'node',
  way: 'way',
  relation: 'relation',
}

/**
 * Zoeken op naam, ook als we je plek niet weten. Snapt halve namen en tikfouten ("rodeo", "de woerd").
 * Met je plek: dichtbij eerst (tot 25 km). Zonder plek: in heel Nederland.
 * Eerst Photon (OpenStreetMap, zoeken terwijl je typt), anders Nominatim (ook OpenStreetMap).
 */
export async function searchByName(name: string, at: { lat: number; lon: number } | null): Promise<Nearby[]> {
  const q = name.trim()
  if (q.length < 2) return []
  const withDistance = (list: Nearby[]) =>
    at
      ? list
          .map((n) => ({ ...n, meters: Math.round(distance(at, n)) }))
          .filter((n) => n.meters < 25000)
          .sort((x, y) => (x.meters ?? 0) - (y.meters ?? 0))
      : list
  try {
    return withDistance(await photon(q, at)).slice(0, 12)
  } catch {
    return withDistance(await nominatim(q, at)).slice(0, 12)
  }
}

async function photon(q: string, at: { lat: number; lon: number } | null): Promise<Nearby[]> {
  const params = new URLSearchParams({ q, limit: '30', lang: 'default' })
  for (const k of KINDS) params.append('osm_tag', `amenity:${k}`)
  if (at) {
    params.set('lat', at.lat.toFixed(2))
    params.set('lon', at.lon.toFixed(2))
  } else params.set('bbox', NL_BOX)
  const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as {
    features?: {
      geometry: { coordinates: [number, number] }
      properties: Record<string, string | number | undefined>
    }[]
  }
  return (data.features ?? [])
    .map((f): Nearby | null => {
      const p = f.properties
      if (!p.name) return null
      const street = [p.street, p.housenumber].filter(Boolean).join(' ')
      return {
        id: `osm-${OSM_TYPE[String(p.osm_type)] ?? 'node'}-${p.osm_id}`,
        name: String(p.name),
        place: [street, p.city].filter(Boolean).join(', ') || undefined,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }
    })
    .filter((x): x is Nearby => x !== null)
}

async function nominatim(q: string, at: { lat: number; lon: number } | null): Promise<Nearby[]> {
  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '30',
    countrycodes: 'nl,be,de',
  })
  if (at) params.set('viewbox', `${at.lon - 0.3},${at.lat + 0.2},${at.lon + 0.3},${at.lat - 0.2}`)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(String(res.status))
  const data = (await res.json()) as {
    osm_type: string
    osm_id: number
    lat: string
    lon: string
    name?: string
    category?: string
    type?: string
    address?: Record<string, string>
  }[]
  return data
    .filter((d) => d.category === 'amenity' && KINDS.includes(d.type ?? '') && d.name)
    .map((d) => {
      const a = d.address ?? {}
      const street = [a.road, a.house_number].filter(Boolean).join(' ')
      return {
        id: `osm-${OSM_TYPE[d.osm_type] ?? 'node'}-${d.osm_id}`,
        name: d.name!,
        place: [street, a.city ?? a.town ?? a.village].filter(Boolean).join(', ') || undefined,
        lat: Number(d.lat),
        lon: Number(d.lon),
      }
    })
}

/** "80 m" of "8,2 km". */
export function far(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} km`
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

const A: Record<Answer, string> = { ja: 'j', half: 'h', nee: 'n', '?': '-' }
const FROM_A: Record<string, Answer> = {
  j: 'ja',
  h: 'half',
  n: 'nee',
  '-': '?',
}

export function restaurantsUrl(list: Restaurant[]): string {
  const data = {
    t: Math.round(Date.now() / 1000),
    r: list.map((r) => [r.name, r.place ?? '', QUESTIONS.map((q) => A[r.answers[q.id] ?? '?']).join(''), r.tasty ? 1 : 0, r.note ?? '']),
  }
  return `${window.location.origin}/restaurants#${toBase64Url(JSON.stringify(data))}`
}

export function readSharedRestaurants(hash: string): { at: number; list: Restaurant[] } | null {
  try {
    const raw = JSON.parse(fromBase64Url(hash.replace(/^#/, ''))) as {
      t?: number
      r?: [string, string, string, number, string][]
    }
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
