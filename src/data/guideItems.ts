/**
 * Gedeelde gidsgegevens voor de app (tabblad Gids) en de website (pagina Glutengids):
 * één lijst met alles wat je kunt opzoeken, de thema's en de acht groepen.
 */
import { GUIDE, type RiskLevel } from './glutenGuide'
import { INGREDIENT_TABS, NATURALLY_GLUTEN_FREE, type IngredientEntry } from './ingredientGuide'
import { glutenGrainsIn, normalize } from '../services/glutenParser'
import { DRINKS, EVERYDAY } from './everyday'

export const COLOR_ORDER: RiskLevel[] = ['hoog', 'middel', 'laag']
/** Thema's die samen "Feestelijk eten" vormen; ze staan niet nog eens los bij Thema's. */
export const FEAST_IDS = ['feestdagen', 'snoep-borrel', 'jus-bouillon', 'brood-desserts']
export const RISK_RANK: Record<RiskLevel, number> = { hoog: 0, middel: 1, laag: 2 }
export const BAR: Record<RiskLevel, string> = { hoog: 'bg-danger', middel: 'bg-warning', laag: 'bg-safe' }

export interface Item {
  key: string
  name: string
  risk: RiskLevel
  /** Eén of twee zinnen: waarom deze kleur. */
  why: string
  tip?: string
  instead: string[]
  group: string
  /** Hoort in de lijsten Nee / Let op / Mag (alleen eten, geen uitleg of situaties). */
  food: boolean
}

/** Woorden die niets zeggen over de inhoud: tellen niet mee bij het zoeken naar dubbelingen. */
const STOP = new Set(['een', 'het', 'de', 'met', 'van', 'en', 'of', 'in', 'op', 'je', 'eigen', 'glutenvrij', 'glutenvrije', 'erop', 'zonder', 'voor', 'mee', 'neem', 'vraag', 'naar', 'uit', 'is', 'er', 'dat', 'die', 'ook'])
const words = (t: string) => new Set(normalize(t).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)))

/**
 * "Neem liever" zonder dubbelingen: geen "Geen alternatief nodig", en niets wat de tip al zegt
 * (tip "Neem eigen brood mee" + "Eigen glutenvrij brood" is dubbel).
 */
export function cleanInstead(instead: string[], tip?: string): string[] {
  const tipWords = tip ? words(tip) : new Set<string>()
  return instead.filter((a) => {
    if (a === 'Geen alternatief nodig') return false
    const w = [...words(a)]
    if (w.length === 0) return false
    const shared = w.filter((x) => tipWords.has(x)).length
    return !(shared >= 2 && shared / w.length >= 0.6)
  })
}

/** Thema's die over situaties of etiketten gaan, niet over eten: alleen zoeken en thema. */
const NOT_FOOD_THEMES = ['etiket', 'school']
export const sortName = (a: Item, b: Item) => a.name.replace(/^\W+/, '').localeCompare(b.name.replace(/^\W+/, ''), 'nl')

function fromEntry(e: IngredientEntry, group: string): Item {
  return {
    key: `${group}/${e.name}`,
    name: e.name,
    risk: e.risk,
    why: e.note ? `${e.summary}. ${e.note}` : `${e.summary}.`,
    tip: e.tip,
    instead: cleanInstead(e.alternatives, e.tip),
    group,
    food: true,
  }
}

export const THEME_ITEMS: Record<string, Item[]> = Object.fromEntries(
  GUIDE.map((c) => [
    c.id,
    c.items.map((i) => ({
      key: `${c.id}/${i.name}`,
      name: i.name,
      risk: i.risk,
      why: i.where,
      tip: i.tip ?? i.checklist[0],
      instead: cleanInstead(i.alternatives, i.tip ?? i.checklist[0]),
      group: c.title,
      food: !NOT_FOOD_THEMES.includes(c.id),
    })),
  ]),
)

/** Thema-items die al als ingrediënt in de gids staan (ze blijven wel op hun themapagina). */
const SEARCH_DUPES = ['Bier', 'Borrelnoten & chips met smaak', 'IJs & desserts met koek', 'Peperkoek & kruidkoek']

/** Alles wat je kunt opzoeken, zonder dubbele namen (ingrediënten gaan voor). */
export const ALL_ITEMS: Item[] = (() => {
  const seen = new Set<string>()
  const list = [
    ...INGREDIENT_TABS.flatMap((t) => t.entries.map((e) => fromEntry(e, t.label))),
    ...NATURALLY_GLUTEN_FREE.map((e) => fromEntry(e, 'Van nature glutenvrij')),
    // Alcohol alleen via zoeken, niet in de lijst "Mag" (de app is ook voor kinderen).
    ...DRINKS.map((e) => ({ ...fromEntry(e, 'Drinken'), food: !['Wijn', 'Cider'].includes(e.name) })),
    ...EVERYDAY.map((e) => fromEntry(e, 'Dagelijks')),
    ...Object.values(THEME_ITEMS).flat(),
  ]
  return list.filter((i) => {
    // Bijna hetzelfde als een ingrediënt hierboven: niet twee keer in de zoekresultaten.
    if (SEARCH_DUPES.includes(i.name)) return false
    const k = normalize(i.name)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
})()

/** De acht groepen, met per groep de items: eerst wat niet mag, dan let op, dan mag. */
export const GROUPS = INGREDIENT_TABS.map((t) => ({
  id: t.id,
  label: t.label,
  intro: t.intro,
  items: t.entries
    .map((e) => fromEntry(e, t.label))
    .sort((a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk] || sortName(a, b)),
}))

/** Andere woorden voor hetzelfde: zo vindt "spaghetti" gewoon Pasta. */
const ALIASES: Record<string, string> = {
  spaghetti: 'Pasta', macaroni: 'Pasta', lasagne: 'Pasta', penne: 'Pasta', ravioli: 'Pasta', tortellini: 'Pasta',
  pannenkoek: 'Pannenkoeken & poffertjes', pannekoek: 'Pannenkoeken & poffertjes', poffertjes: 'Pannenkoeken & poffertjes',
  noedels: 'Mie, ramen & udon', noodles: 'Mie, ramen & udon', tosti: 'Brood & beschuit', boterham: 'Brood & beschuit',
  stokbrood: 'Brood & beschuit', crackers: 'Koekjes & crackers', koek: 'Koekjes & crackers', biscuit: 'Koekjes & crackers',
  frikandel: 'Kroket, frikandel & bitterbal', bitterbal: 'Kroket, frikandel & bitterbal', friet: 'Patat', frietjes: 'Patat',
  limonade: 'Limonade & siroop', ranja: 'Limonade & siroop', sinas: 'Frisdrank & cola', fanta: 'Frisdrank & cola',
  ijsthee: 'Frisdrank & cola', chocomel: 'Melk', karnemelk: 'Melk', mayo: 'Ketchup & mayonaise', mayonaise: 'Ketchup & mayonaise',
  frietsaus: 'Ketchup & mayonaise', taart: 'Taart & gebak', gebak: 'Taart & gebak', muffin: 'Cake, muffins & donuts',
  donut: 'Cake, muffins & donuts', brownie: 'Cake, muffins & donuts', nachos: 'Tortillachips & nacho’s', jus: 'Traditionele jus',
  kip: 'Vlees & kip', vlees: 'Vlees & kip', kibbeling: 'Vis', vissticks: 'Vis', winegums: 'Snoep', drop: 'Drop',
  smoothie: 'Sap & smoothie', sap: 'Sap & smoothie', jam: 'Jam & honing', honing: 'Jam & honing', yoghurt: 'Yoghurt & vla', vla: 'Yoghurt & vla',
}

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return d[a.length][b.length]
}

/** Niet in de gids, maar er zit wel een glutengraan in het woord ("tarwebrood", "speltkoek"). */
function grainAnswer(q: string): Item | null {
  const grains = glutenGrainsIn(q)
  if (grains.length === 0) return null
  return {
    key: `zelf/${q}`,
    name: q.charAt(0).toUpperCase() + q.slice(1),
    risk: 'hoog',
    why: `Er zit ${grains.join(' en ')} in. Dat is gluten.`,
    instead: [],
    group: 'Gevonden in het woord',
    food: false,
  }
}

/** Beste treffers eerst: precies de naam, dan begint ermee, dan ergens in de naam, dan in de uitleg. */
export function search(q: string): Item[] {
  const scored: [number, Item][] = []
  for (const item of ALL_ITEMS) {
    const name = normalize(item.name)
    let score = -1
    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.split(/[\s/&,()-]+/).some((w) => w.startsWith(q))) score = 2
    else if (q.length >= 4 && name.includes(q)) score = 3
    // In de uitleg alleen als heel woord-begin en niet te kort (anders vindt "tee" ook "geteeld").
    else if (q.length >= 4 && new RegExp(`(^|[^a-z])${q.replace(/[^a-z0-9 ]/g, '')}`).test(normalize(`${item.why} ${item.instead.join(' ')}`))) score = 4
    if (ALIASES[q] && item.name === ALIASES[q]) score = 0
    if (score >= 0) scored.push([score, item])
  }
  if (!scored.some(([sc]) => sc <= 3)) {
    // Een glutengraan in het woord zelf ("tarwebrood"): dat is een zeker antwoord, bovenaan.
    const grain = grainAnswer(q)
    if (grain) return [grain, ...scored.sort((a, b) => a[0] - b[0]).map(([, i]) => i)]
    // Tikfout ("tee" → Thee, "spagetti" → Pasta): het dichtstbijzijnde woord.
    const max = q.length >= 6 ? 2 : 1
    for (const item of ALL_ITEMS) {
      const ws = [...normalize(item.name).split(/[^a-z0-9]+/), ...Object.entries(ALIASES).filter(([, n]) => n === item.name).map(([w]) => w)]
      const best = Math.min(...ws.filter((w) => w.length >= 3).map((w) => editDistance(w, q)))
      if (q.length >= 3 && best <= max) scored.push([best === 1 ? 3.5 : 3.8, item])
    }
  }
  return scored.sort((a, b) => a[0] - b[0] || sortName(a[1], b[1])).map(([, i]) => i)
}


/** Aantal per kleur, alleen eten (voor de kleurvakken). */
export function countFood(risk: RiskLevel): number {
  return ALL_ITEMS.filter((i) => i.food && i.risk === risk).length
}
