import { fold } from '../lib/fold'

/**
 * Haalt uit een rommelige etikettekst (foto of database) alleen de ingrediëntenlijst:
 * alles na "Ingrediënten:" tot aan allergenen, voedingswaarde, bewaaradvies enz.
 * Daarna los per ingrediënt, zodat de uitslag ze als rustige blokjes kan tonen.
 */

export interface IngredientItem {
  /** Wat er staat, netjes geschreven ("Rijstebloem", "Pinda 35%"). */
  name: string
  /** Wat er tussen haakjes stond ("olijven, stabilisator: E579"). */
  detail?: string
}

export interface IngredientList {
  items: IngredientItem[]
  /** "Kan … bevatten" of "Kan sporen van … bevatten". */
  mayContain?: string
}

const START = /(?:[il1|\\]?)(ngredi[eë]nten|ingredients?|ingr[eé]dients|zutaten|ingredientes|ingredienti|ingredienser|ingrediencie|sk[lł]adniki)\s*[:;]/i

/** Waar de lijst ophoudt: na de ingrediënten komt vaak dit soort tekst. */
const STOP =
  /(\ballergenen|\ballergie|\bkan\b[^.]{0,60}\bbevatten|\bkan sporen|\bwaarschuwing|voedingswaarde|verpakt onder|ten ?minste houdbaar|\bbewaar|consumentenservice|\bnutrition|\bmay contain|\bkann spuren|\bpeut contenir|\bpuede contener|\bpu[oò] contenere|\bnährwert|\bvaleurs nutritives|\bpro ?100 ?g|\bper ?100 ?g)/i

const MAY_CONTAIN = /\b(kan (sporen van )?[^.]{2,120}?bevatten|may contain[^.]{2,120}|kann spuren[^.]{2,120}|peut contenir[^.]{2,120})/i

/** OCR breekt woorden af aan het eind van een regel: "aman- delen", "CASHEW- NOTEN". */
function joinBreaks(s: string): string {
  return s.replace(/(\p{L})[-‐]\s+(\p{Ll}|\p{Lu}{2,})/gu, (_, a: string, b: string) => a + b)
}

/** Splits op komma's (en puntkomma's), maar niet binnen haakjes. */
function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  const chars = [...s]
  chars.forEach((ch, i) => {
    if (ch === '(' || ch === '[') depth++
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    // "1,8%" is een getal, geen nieuw ingrediënt.
    const decimal = ch === ',' && /\d/.test(chars[i - 1] ?? '') && /\d/.test(chars[i + 1] ?? '')
    if ((ch === ',' || ch === ';') && depth === 0 && !decimal) {
      out.push(cur)
      cur = ''
    } else cur += ch
  })
  out.push(cur)
  return out
}

/** "PINDA 35%" → "Pinda 35%"; gewone woorden houden hun eigen schrijfwijze. */
function tidy(s: string): string {
  let t = s.replace(/\s+/g, ' ').replace(/^[\s.:*…-]+|[\s.:*…]+$/g, '').trim()
  if (/\p{Lu}{3,}/u.test(t) && t === t.toUpperCase()) t = t.toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** `fromDatabase`: tekst uit de productdatabase is altijd een lijst, ook met maar één ingrediënt. */
export function parseIngredientList(text: string, fromDatabase = false): IngredientList | null {
  const clean = joinBreaks(text.replace(/_/g, ''))
  const start = clean.search(START)
  // Zonder het woord "Ingrediënten" alleen doorgaan als het echt op een lijst lijkt.
  let body = start >= 0 ? clean.slice(start).replace(START, '') : clean
  const stop = body.search(STOP)
  if (stop > 0) body = body.slice(0, stop)

  // Zonder "Ingrediënten" staat er vaak eerst een zin over het product ("Gekruide mix van pinda's. PINDA 35%").
  // Die zin hoort niet bij het eerste ingrediënt.
  if (start < 0) body = body.replace(/^[^,]*[.!?]\s+(?=\p{Lu})/u, '')

  const items: IngredientItem[] = []
  for (const raw of splitTop(body)) {
    const m = raw.match(/^([^([]*)[([](.*)[)\]]?\s*$/s)
    const name = tidy(m ? m[1] : raw)
    const detail = m ? tidy(m[2]).replace(/[)\]]+$/, '') : undefined
    // Losse rommel van de foto (te kort, alleen cijfers of puntjes) overslaan.
    if (name.replace(/[^\p{L}]/gu, '').length < 2) continue
    items.push(detail ? { name, detail: detail.charAt(0).toLowerCase() + detail.slice(1) } : { name })
  }
  if (items.length === 0 || (!fromDatabase && (items.length < 2 || (start < 0 && items.length < 4)))) return null

  const may = clean.match(MAY_CONTAIN)
  return { items, mayContain: may ? tidy(may[0]) : undefined }
}

/**
 * Meel of zetmeel van iets zonder gluten: daar schrik je van ("bloem!"), maar het mag.
 * Alleen als er geen glutenwoord in hetzelfde ingrediënt staat.
 */
const SAFE_FLOUR = /(rijst|ma[iï]s|mais|boekweit|aardappel|tapioca|cassave|quinoa|gierst|teff|amarant|sorghum|kikkererwt|kokos|amandel|rice|corn|potato|buckwheat|reis|kartoffel|riz|ma[iï]s|patate|arroz)/
const FLOURISH = /(bloem|meel|zetmeel|flour|starch|mehl|st[aä]rke|farine|amidon|harina|almid[oó]n|farina|amido)/

export function looksSafeFlour(name: string): boolean {
  const f = fold(name)
  return FLOURISH.test(f) && SAFE_FLOUR.test(f)
}
