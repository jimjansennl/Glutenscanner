/**
 * Gedeelde gidsgegevens voor de app (tabblad Gids) en de website (pagina Glutengids):
 * één lijst met alles wat je kunt opzoeken, de thema's en de acht groepen.
 */
import { GUIDE, type RiskLevel } from './glutenGuide'
import { INGREDIENT_TABS, NATURALLY_GLUTEN_FREE, type IngredientEntry } from './ingredientGuide'
import { normalize } from '../services/glutenParser'

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
    instead: e.alternatives.filter((a) => a !== 'Geen alternatief nodig'),
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
      tip: i.checklist[0],
      instead: i.alternatives.filter((a) => a !== 'Geen alternatief nodig'),
      group: c.title,
      food: !NOT_FOOD_THEMES.includes(c.id),
    })),
  ]),
)

/** Alles wat je kunt opzoeken, zonder dubbele namen (ingrediënten gaan voor). */
export const ALL_ITEMS: Item[] = (() => {
  const seen = new Set<string>()
  const list = [
    ...INGREDIENT_TABS.flatMap((t) => t.entries.map((e) => fromEntry(e, t.label))),
    ...NATURALLY_GLUTEN_FREE.map((e) => fromEntry(e, 'Van nature glutenvrij')),
    ...Object.values(THEME_ITEMS).flat(),
  ]
  return list.filter((i) => {
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

/** Beste treffers eerst: precies de naam, dan begint ermee, dan ergens in de naam, dan in de uitleg. */
export function search(q: string): Item[] {
  const scored: [number, Item][] = []
  for (const item of ALL_ITEMS) {
    const name = normalize(item.name)
    let score = -1
    if (name === q) score = 0
    else if (name.startsWith(q)) score = 1
    else if (name.split(/[\s/&,()-]+/).some((w) => w.startsWith(q))) score = 2
    else if (name.includes(q)) score = 3
    else if (normalize(`${item.why} ${item.instead.join(' ')}`).includes(q)) score = 4
    if (score >= 0) scored.push([score, item])
  }
  return scored.sort((a, b) => a[0] - b[0] || sortName(a[1], b[1])).map(([, i]) => i)
}


/** Aantal per kleur, alleen eten (voor de kleurvakken). */
export function countFood(risk: RiskLevel): number {
  return ALL_ITEMS.filter((i) => i.food && i.risk === risk).length
}
