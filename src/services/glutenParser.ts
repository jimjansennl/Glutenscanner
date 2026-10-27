import type { GlutenAnalysis, GlutenMatch, MatchSource } from '../types/product'

interface Trigger {
  label: string
  pattern: RegExp
}

/**
 * Harde gluten-bronnen (NL / EN / DE / FR). Nederlandse termen matchen ook
 * midden in samenstellingen (volkorentarwemeel, gerstemout); korte Engelse
 * woorden gebruiken woordgrenzen om "goat" ≠ "oat" en "dryer" ≠ "rye" te houden.
 */
const GLUTEN_TRIGGERS: Trigger[] = [
  { label: 'Tarwe', pattern: /tarwe|wheat|weizen|froment|\bble\b|\bdurum/g },
  { label: 'Gerst', pattern: /gerst|barley|\borge\b/g },
  { label: 'Rogge', pattern: /rogge|\brye\b|roggen|seigle/g },
  { label: 'Spelt', pattern: /spelt|dinkel|epeautre/g },
  { label: 'Haver', pattern: /haver|\boat(?:s|meal)?\b|hafer|avoine/g },
  { label: 'Kamut', pattern: /kamut|khorasan/g },
  { label: 'Bulgur', pattern: /bulgur|boulgour/g },
  { label: 'Couscous', pattern: /couscous/g },
  { label: 'Mout', pattern: /mout(?!on)|\bmalt(?:ed|s)?\b|malz/g },
  { label: 'Griesmeel', pattern: /griesmeel|semolina|semoule|griess/g },
  { label: 'Deegwaren', pattern: /deegwar/g },
  { label: 'Seitan', pattern: /seitan/g },
  { label: 'Oergraan', pattern: /triticale|\bemmer\b|einkorn|eenkoorn|\bfarro\b|freekeh/g },
  { label: 'Gluten', pattern: /gluten/g },
]

/** Glutenvrije meelsoorten die als los woord vóór "flour"/"bloem" staan. */
const GF_FLOUR_BASES =
  'rice|brown rice|corn|maize|potato|tapioca|almond|coconut|chickpea|gram|soy|soya|pea|bean|teff|sorghum|millet|quinoa|amaranth|cassava|chestnut|lupin|banana|rijst|mais|aardappel|amandel|kokos'

/** Termen die vaak (maar niet altijd) gluten bevatten: twijfelgevallen. */
const SUSPICIOUS_TRIGGERS: Trigger[] = [
  { label: 'Croutons', pattern: /crouton/g },
  { label: 'Paneermeel', pattern: /paneermeel|gepaneerd|breadcrumb|panko|paniermehl|chapelure/g },
  { label: 'Pasta / noedels', pattern: /\bpasta\b|noedel|noodle|vermicelli/g },
  { label: 'Sojasaus', pattern: /sojasaus|soy ?sauce|shoyu/g },
  { label: 'Bier', pattern: /\bbier\b|\bbeer\b/g },
  { label: 'Brood', pattern: /brood|\bbread\b|beschuit/g },
  // Kale "bloem"/"flour" is meestal tarwe; "rice flour", "corn flour" e.d. niet.
  { label: 'Bloem', pattern: new RegExp(`(?<!(?:${GF_FLOUR_BASES}) )\\b(?:bloem|flour)\\b`, 'g') },
]

/** Wegstrepen vóór het matchen: bevatten "tarwe"/"wheat" maar zijn glutenvrij. */
const EXCLUSIONS = /(?:boekweit|buckwheat|buchweizen|ble noir|sarrasin)\p{L}*(?: (?:flour|meel|bloem|mehl))?/gu

/** "glutenvrij" e.d. mag niet als "gluten" matchen. */
const NEGATIONS = /glutenvrij\w*|gluten[- ]?free|sans gluten|zonder gluten|glutenfrei\w*|senza glutine|sin gluten|sem gluten/g

/** Glutenvrije haver: geen harde trigger, wel twijfel (avenine / certificering). */
const GLUTEN_FREE_OATS = /(?:glutenvrije|gluten[- ]?free|glutenfreier?) ?(?:haver\w*|oat\w*|hafer\w*)/g

/** "Kan sporen bevatten van …" en varianten: alles tot het einde van de zin. */
const TRACE_PHRASES =
  /(?:kan sporen(?: bevatten)?(?: van)?|sporen van|bevat mogelijk|may contain|traces? of|peut contenir(?: des traces de)?|kann spuren(?: von)?|kann .{0,30}?enthalten|in een (?:omgeving|bedrijf) waar)([^.;\n]*)/g

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[_*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Het volledige woord rond een match, zodat we "tarwebloem" tonen i.p.v. "tarwe". */
function wordAt(text: string, index: number, length: number): string {
  let start = index
  let end = index + length
  while (start > 0 && /[\p{L}-]/u.test(text[start - 1])) start--
  while (end < text.length && /[\p{L}-]/u.test(text[end])) end++
  return text.slice(start, end)
}

function findMatches(text: string, triggers: Trigger[], source: MatchSource): GlutenMatch[] {
  const found: GlutenMatch[] = []
  for (const { label, pattern } of triggers) {
    for (const m of text.matchAll(pattern)) {
      found.push({ label, term: wordAt(text, m.index, m[0].length), source })
    }
  }
  return found
}

function dedupe(matches: GlutenMatch[]): GlutenMatch[] {
  const seen = new Set<string>()
  return matches.filter((m) => {
    const key = `${m.label}|${m.term}|${m.source}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Haalt sporen-zinnen uit een ingrediëntentekst en geeft beide delen terug. */
function splitTraces(text: string): { body: string; traces: string[] } {
  const traces: string[] = []
  const body = text.replace(TRACE_PHRASES, (_, rest: string) => {
    traces.push(rest)
    return ' '
  })
  return { body, traces }
}

interface ScanInput {
  text: string
  source: MatchSource
  /** Sporen-tekst: alles wat hier matcht wordt een waarschuwing, geen gevaar. */
  isTraces?: boolean
}

function scan(inputs: ScanInput[]): Pick<GlutenAnalysis, 'matches' | 'warnings'> {
  const matches: GlutenMatch[] = []
  const warnings: GlutenMatch[] = []

  for (const input of inputs) {
    const normalized = normalize(input.text)
    if (!normalized) continue

    const { body, traces } = input.isTraces ? { body: '', traces: [normalized] } : splitTraces(normalized)

    for (const trace of traces) {
      const clean = trace.replace(EXCLUSIONS, ' ').replace(NEGATIONS, ' ')
      warnings.push(...findMatches(clean, [...GLUTEN_TRIGGERS, ...SUSPICIOUS_TRIGGERS], 'traces'))
    }

    let clean = body.replace(EXCLUSIONS, ' ')
    for (const m of clean.matchAll(GLUTEN_FREE_OATS)) {
      warnings.push({ label: 'Glutenvrije haver', term: m[0], source: input.source })
    }
    clean = clean.replace(GLUTEN_FREE_OATS, ' ').replace(NEGATIONS, ' ')

    matches.push(...findMatches(clean, GLUTEN_TRIGGERS, input.source))
    warnings.push(...findMatches(clean, SUSPICIOUS_TRIGGERS, input.source))
  }

  return { matches: dedupe(matches), warnings: dedupe(warnings) }
}

function hasNegation(text: string): boolean {
  return new RegExp(NEGATIONS.source).test(normalize(text))
}

function conclude(
  { matches, warnings }: Pick<GlutenAnalysis, 'matches' | 'warnings'>,
  hasData: boolean,
  labeledGlutenFree: boolean,
): GlutenAnalysis {
  if (matches.length > 0) {
    const labels = [...new Set(matches.map((m) => m.label.toLowerCase()))]
    return {
      status: 'danger',
      matches,
      warnings,
      reasons: [`Bevat ${labels.join(', ')}.`],
    }
  }

  if (warnings.length > 0) {
    const reasons: string[] = []
    if (warnings.some((w) => w.source === 'traces')) reasons.push('Kan sporen van gluten bevatten.')
    if (warnings.some((w) => w.source !== 'traces')) reasons.push('Bevat ingrediënten die vaak gluten bevatten.')
    return { status: 'warning', matches, warnings, reasons }
  }

  if (!hasData) {
    return {
      status: 'warning',
      matches,
      warnings,
      reasons: ['Productdata ontbreekt: ingrediënten konden niet gecontroleerd worden.'],
    }
  }

  return {
    status: 'safe',
    matches,
    warnings,
    reasons: [
      labeledGlutenFree
        ? 'Product is gelabeld als glutenvrij en bevat geen gluten-bronnen.'
        : 'Geen gluten-bronnen gevonden in ingrediënten en allergenen.',
    ],
  }
}

/** Subset van een Open Food Facts product die we gebruiken. */
export interface OffProductFields {
  ingredients_text?: string
  ingredients_text_nl?: string
  ingredients_text_en?: string
  allergens?: string
  allergens_tags?: string[]
  traces?: string
  traces_tags?: string[]
  labels_tags?: string[]
}

/** Tags als "en:gluten" → "gluten". */
function tagsToText(tags: string[] = []): string {
  return tags.map((t) => t.replace(/^\w{2}:/, '').replace(/-/g, ' ')).join(', ')
}

export function analyzeOffProduct(p: OffProductFields): GlutenAnalysis {
  const ingredientTexts = [p.ingredients_text, p.ingredients_text_nl, p.ingredients_text_en].filter(
    (t): t is string => !!t?.trim(),
  )
  const allergensText = [p.allergens ?? '', tagsToText(p.allergens_tags)].join(', ')
  const tracesText = [p.traces ?? '', tagsToText(p.traces_tags)].join(', ')

  const result = scan([
    ...ingredientTexts.map((text) => ({ text, source: 'ingredients' as const })),
    { text: allergensText, source: 'allergens' },
    { text: tracesText, source: 'traces', isTraces: true },
  ])

  const hasData = ingredientTexts.length > 0 || (p.allergens_tags?.length ?? 0) > 0
  const labeledGlutenFree = (p.labels_tags ?? []).some((t) => /no-gluten|gluten-free|sans-gluten/.test(t))
  return conclude(result, hasData, labeledGlutenFree)
}

/** Vrije tekst analyseren: OCR van een etiket, menukaart of QR-inhoud. */
export function analyzeText(text: string): GlutenAnalysis {
  const result = scan([{ text, source: 'text' }])
  return conclude(result, text.trim().length > 0, hasNegation(text))
}
