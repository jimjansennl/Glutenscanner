import type { AnalysisContext, GlutenAnalysis, GlutenMatch, MatchSource } from '../types/product'

interface Trigger {
  /** Nederlandse naam die we aan de gebruiker tonen, ook bij buitenlandse termen. */
  label: string
  pattern: RegExp
  /** Advies dat bij een menukaart-match wordt getoond. */
  tip?: string
}

/**
 * Harde gluten-bronnen in NL / EN / DE / FR / ES / IT / PT / PL. De tekst is vooraf
 * genormaliseerd (kleine letters, geen accenten), dus "sémola" wordt "semola".
 * Nederlandse termen matchen ook midden in samenstellingen (volkorentarwemeel,
 * gerstemout); korte woorden gebruiken woordgrenzen ("goat" ≠ "oat", "orzo" ≠ "orzon").
 */
const GLUTEN_TRIGGERS: Trigger[] = [
  {
    label: 'Tarwe',
    pattern: /tarwe|wheat|weizen|froment|\bble\b|\bdurum|trigo|frumento|grano (?:tenero|duro)|pszen/g,
  },
  { label: 'Gerst', pattern: /gerst|barley|\borge\b|cebada|\borzo\b|cevada|jeczmien/g },
  { label: 'Rogge', pattern: /rogge|\brye\b|roggen|seigle|centeno|segale|centeio|\bzyto\b/g },
  { label: 'Spelt', pattern: /spelt|dinkel|epeautre|espelta|\bfarro\b/g },
  { label: 'Haver', pattern: /haver|\boat(?:s|meal)?\b|hafer|avoine|\bavena\b|aveia|owies/g },
  { label: 'Kamut', pattern: /kamut|khorasan/g },
  { label: 'Bulgur', pattern: /bulgur|boulgour|burghul/g },
  { label: 'Couscous', pattern: /couscous|cuscus/g },
  { label: 'Mout', pattern: /mout(?!on)|\bmalt(?:ed|s|a|e|o)?\b|malz/g },
  { label: 'Griesmeel', pattern: /griesmeel|semolina|semoule|griess|\bsemola\b/g },
  { label: 'Deegwaren', pattern: /deegwar/g },
  { label: 'Seitan', pattern: /seitan/g },
  { label: 'Oergraan', pattern: /triticale|\bemmer\b|einkorn|eenkoorn|freekeh/g },
  { label: 'Gluten', pattern: /gluten|glutine/g },
]

/** Glutenvrije meelsoorten die als los woord vóór "flour"/"bloem" staan. */
const GF_FLOUR_BEFORE =
  'rice|brown rice|corn|maize|potato|tapioca|almond|coconut|chickpea|gram|soy|soya|pea|bean|teff|sorghum|millet|quinoa|amaranth|cassava|chestnut|lupin|banana|rijst|mais|aardappel|amandel|kokos'

/** Glutenvrije meelsoorten ná "harina de" / "farina di" / "farine de". */
const GF_FLOUR_AFTER =
  'arroz|riso|riz|maiz|mais|milho|garbanzos?|ceci|grao|almendras?|mandorle|amandes?|patata|pomme de terre|castanas?|castagne|chataigne|tapioca|yuca|mandioca|quinoa|sorgo|sarrasin|coco'

/** "harina de trigo": het graan zelf is al een harde match, de bloem hoeft niet ook als twijfel. */
const GLUTEN_GRAINS_AFTER = 'trigo|frumento|grano|centeno|cebada|espelta|segale|orzo|avena|farro|centeio|cevada|aveia|ble|seigle|orge|epeautre|kamut'

/** Termen die vaak (maar niet altijd) gluten bevatten: twijfelgevallen. */
const SUSPICIOUS_TRIGGERS: Trigger[] = [
  {
    label: 'Croutons',
    pattern: /crouton|picatoste|crostini/g,
    tip: 'Vraag de salade zonder croutons, en of ze er niet eerst op hebben gelegen.',
  },
  {
    label: 'Paneermeel',
    pattern: /paneermeel|gepaneerd|breadcrumb|breaded|panko|paniermehl|paniert|chapelure|pan rallado|pangrattato|empanad|impanat/g,
    tip: 'Een paneerlaag bevat vrijwel altijd tarwe: vraag naar een ongepaneerde variant.',
  },
  {
    label: 'Pasta / noedels',
    pattern: /\bpasta\b|noedel|noodle|vermicelli|fideo|spaghett|tagliatell|lasagn|ravioli|gnocchi|tortellini/g,
    tip: 'Vraag naar glutenvrije pasta, en of die in apart water wordt gekookt.',
  },
  {
    label: 'Sojasaus',
    pattern: /sojasaus|soy ?sauce|shoyu|salsa de soja|salsa di soia|molho de soja|sauce soja|teriyaki|hoisin/g,
    tip: 'Gewone sojasaus wordt gebrouwen met tarwe: vraag of de keuken tamari (glutenvrij) gebruikt.',
  },
  { label: 'Bier', pattern: /\bbier\b|\bbeer\b|cerveza|\bbirra\b|cerveja|\bbiere\b/g },
  {
    label: 'Brood',
    pattern: /brood|\bbread\b|beschuit|\bpane\b|\bpain\b|bocadillo|focaccia|bruschetta/g,
    tip: 'Vraag het gerecht zonder brood, en of brood apart wordt geserveerd.',
  },
  {
    // Kale "bloem"/"flour"/"harina" is meestal tarwe; "rice flour", "harina de arroz" e.d. niet.
    label: 'Bloem',
    pattern: new RegExp(
      `(?<!(?:${GF_FLOUR_BEFORE}) )\\b(?:bloem|flour|mehl)\\b|\\b(?:harina|farina|farine|farinha)\\b(?! (?:de |di |d'|da )?(?:${GF_FLOUR_AFTER}|${GLUTEN_GRAINS_AFTER}))`,
      'g',
    ),
  },
]

/**
 * Restaurantrisico's: verborgen bloem, gedeelde frituur en andere kruisbesmetting.
 * Alleen bij menukaart-analyse, op etiketten zou "saus" of "gefrituurd" ruis zijn.
 */
const RESTAURANT_RISKS: Trigger[] = [
  {
    label: 'Gebonden saus',
    pattern: /\broux\b|bechamel|besciamella|veloute|\bjus\b|gravy|demi[- ]?glace|roomsaus|bruine saus|gebonden|(?<!soja)saus\b|(?<!soy )sauce\b|\bsalsa\b/g,
    tip: 'Vraag of de saus gebonden is met tarwebloem (roux) of met maïzena.',
  },
  {
    label: 'Dressing',
    pattern: /dressing|vinaigrette|\balino\b|condimento/g,
    tip: 'Vraag naar de dressing: die bevat soms moutazijn, sojasaus of bloem.',
  },
  {
    label: 'Gedeelde frituur',
    pattern: /frituur|gefrituurd|\bfriet|patat|\bfries\b|fried|\bfrit[oa]s?\b|fritt[oi]|fritura|frittura|\bfrites\b/g,
    tip: 'Vraag of er een aparte frituur is: gedeelde olie met gepaneerde producten geeft kruisbesmetting.',
  },
  {
    label: 'Beslag / tempura',
    pattern: /beslag|batter|tempura|rebozad|pastella|beignet|in pastella/g,
    tip: 'Beslag en tempura worden bijna altijd met tarwebloem gemaakt.',
  },
  {
    label: 'Korst / deeg',
    pattern: /gegratineerd|gratin|korst|crust|crumble|quiche|\btaart|\btarte?\b|\bpie\b|bladerdeeg|hojaldre|sfoglia|pizza|\bwrap\b|empanada|strudel/g,
    tip: 'Korsten, bladerdeeg en gratinlagen bevatten meestal tarwebloem.',
  },
  {
    label: 'Gebonden soep',
    pattern: /\bsoep\b|\bsoup\b|\bsopa\b|\bzuppa\b|bisque|chowder|veloute/g,
    tip: 'Soepen worden vaak gebonden met bloem: vraag hoe deze soep gebonden is.',
  },
  {
    label: 'Gedeelde grill / wok',
    pattern: /\bwok\b|plancha|\bgrill|barbecue|\bbbq\b/g,
    tip: 'Vraag of de grill of wok ook voor gerechten met gluten wordt gebruikt.',
  },
]

const GENERAL_MENU_TIP = 'Meld je glutenintolerantie altijd expliciet aan de bediening en vraag naar kruisbesmetting in de keuken.'

/** Wegstrepen vóór het matchen: bevatten "tarwe"/"wheat"/"trigo" maar zijn glutenvrij (boekweit). */
const EXCLUSIONS =
  /(?:(?:harina|farina|farine|farinha) (?:de |di |d'|da )?)?(?:boekweit|buckwheat|buchweizen|ble noir|sarrasin|trigo sarraceno|grano saraceno|trigo mourisco|sarraceno|saraceno)\p{L}*(?: (?:flour|meel|bloem|mehl))?/gu

/** "glutenvrij" e.d. mag niet als "gluten" matchen. */
const NEGATIONS =
  /glutenvrij\w*|gluten[- ]?free|sans gluten|zonder gluten|glutenfrei\w*|senza glutine|privo di glutine|sin gluten|libre de gluten|sem gluten|isento de gluten|bez glutenu/g

/** Glutenvrije haver: geen harde trigger, wel twijfel (avenine / certificering). */
const GLUTEN_FREE_OATS = /(?:glutenvrije|gluten[- ]?free|glutenfreier?) ?(?:haver\w*|oat\w*|hafer\w*)/g

/**
 * Glutenvrij (Codex-)tarwezetmeel: wettelijk glutenvrij (max. 20 ppm), dus geen tarwe-match.
 * Moet vóór NEGATIONS weg, anders blijft "tarwezetmeel" over en matcht die als tarwe.
 */
const GF_WHEAT_STARCH = new RegExp(
  [
    'glutenvrij\\w* tarwe ?zetmeel',
    'tarwe ?zetmeel \\(?glutenvrij\\)?',
    'gluten[- ]?free wheat ?starch',
    'wheat ?starch \\(?gluten[- ]?free\\)?',
    'amidon de ble sans gluten',
    'glutenfreie?s? weizenstarke',
    'weizenstarke \\(?glutenfrei\\)?',
    'amido di frumento senza glutine',
    'almidon de trigo sin gluten',
  ].join('|'),
  'g',
)

/**
 * Glutenvrij-claim op het product zelf (EU: max. 20 ppm). "niet glutenvrij" telt niet.
 * Werkt op genormaliseerde tekst én op OFF-labeltags ("en:gluten-free", "en:no-gluten").
 */
const GLUTEN_FREE_CLAIM =
  /(?<!(?:niet|not|nicht|non|no|ne) )(?:glutenvrij\w*|gluten[- ]?free|no[- ]gluten|sans[- ]gluten|glutenfrei\w*|senza[- ]glutine|privo di glutine|sin[- ]gluten|libre de gluten|sem[- ]gluten|isento de gluten|bez glutenu|crossed[- ]grain)/

/** "Kan sporen bevatten van …" en varianten: alles tot het einde van de zin. */
const TRACE_PHRASES = new RegExp(
  '(?:' +
    [
      'kan sporen(?: bevatten)?(?: van)?',
      'sporen van',
      'bevat mogelijk',
      'may contain',
      'traces? of',
      'peut contenir(?: des traces de)?',
      'kann spuren(?: von)?',
      'kann .{0,30}?enthalten',
      'puede contener(?: trazas de)?',
      'trazas de',
      'puo contenere(?: tracce di)?',
      'tracce di',
      'pode conter(?: vestigios de)?',
      'in een (?:omgeving|bedrijf) waar',
    ].join('|') +
    ')([^.;\\n]*)',
  'g',
)

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

function scan(inputs: ScanInput[], context: AnalysisContext): Pick<GlutenAnalysis, 'matches' | 'warnings'> {
  const matches: GlutenMatch[] = []
  const warnings: GlutenMatch[] = []
  const suspicious = context === 'menu' ? [...SUSPICIOUS_TRIGGERS, ...RESTAURANT_RISKS] : SUSPICIOUS_TRIGGERS

  for (const input of inputs) {
    const normalized = normalize(input.text)
    if (!normalized) continue

    const { body, traces } = input.isTraces ? { body: '', traces: [normalized] } : splitTraces(normalized)

    for (const trace of traces) {
      const clean = trace.replace(EXCLUSIONS, ' ').replace(NEGATIONS, ' ')
      warnings.push(...findMatches(clean, [...GLUTEN_TRIGGERS, ...SUSPICIOUS_TRIGGERS], 'traces'))
    }

    let clean = body.replace(GF_WHEAT_STARCH, ' ').replace(EXCLUSIONS, ' ')
    for (const m of clean.matchAll(GLUTEN_FREE_OATS)) {
      warnings.push({ label: 'Glutenvrije haver', term: m[0], source: input.source })
    }
    clean = clean.replace(GLUTEN_FREE_OATS, ' ').replace(NEGATIONS, ' ')

    matches.push(...findMatches(clean, GLUTEN_TRIGGERS, input.source))
    warnings.push(...findMatches(clean, suspicious, input.source))
  }

  return { matches: dedupe(matches), warnings: dedupe(warnings) }
}

function hasGlutenFreeClaim(text: string | undefined): boolean {
  return !!text && GLUTEN_FREE_CLAIM.test(normalize(text))
}

function mentionsGfWheatStarch(texts: string[]): boolean {
  return texts.some((t) => new RegExp(GF_WHEAT_STARCH.source).test(normalize(t)))
}

const GF_STARCH_NOTE = 'Bevat glutenvrij tarwezetmeel: dit is wettelijk glutenvrij en telt niet als tarwe.'

/** "tarwe (trigo)": de Nederlandse naam, met de buitenlandse term erbij als die afwijkt. */
export function describeMatch(m: GlutenMatch): string {
  const label = m.label.toLowerCase()
  return m.term.includes(label) ? label : `${label} (${m.term})`
}

function menuTips(warnings: GlutenMatch[]): string[] {
  const triggers = [...SUSPICIOUS_TRIGGERS, ...RESTAURANT_RISKS]
  const tips = new Set<string>()
  for (const w of warnings) {
    const tip = triggers.find((t) => t.label === w.label)?.tip
    if (tip) tips.add(tip)
  }
  tips.add(GENERAL_MENU_TIP)
  return [...tips]
}

interface Evidence {
  hasData: boolean
  /** Waar een glutenvrij-claim is gevonden (productnaam, merk, keurmerk, ingrediënten). */
  claimSources: string[]
  gfWheatStarch: boolean
}

function conclude(
  { matches, warnings }: Pick<GlutenAnalysis, 'matches' | 'warnings'>,
  { hasData, claimSources, gfWheatStarch }: Evidence,
  context: AnalysisContext,
): GlutenAnalysis {
  const tips = context === 'menu' ? menuTips(warnings) : []
  const starchNote = gfWheatStarch ? [GF_STARCH_NOTE] : []

  // Certificering wint: een glutenvrij-claim op het product gaat boven (vaak vervuilde)
  // database-tekst. Tegenstrijdige termen blijven zichtbaar als notitie, niet als blokkade.
  if (context === 'label' && claimSources.length > 0) {
    const conflicts = [...new Set([...matches, ...warnings].map((m) => m.term))]
    return {
      status: 'safe',
      certified: true,
      matches: [],
      warnings: [],
      reasons: [
        `Gecertificeerd glutenvrij product (claim gevonden in: ${claimSources.join(', ')}).`,
        ...starchNote,
      ],
      conflicts,
      tips,
    }
  }

  if (matches.length > 0) {
    const sources = [...new Set(matches.map(describeMatch))]
    return {
      status: 'danger',
      matches,
      warnings,
      reasons: [`Bevat glutenbevattende granen: ${sources.join(", ")}. Niet geschikt bij coeliakie of glutenintolerantie.`],
      tips,
    }
  }

  if (warnings.length > 0) {
    const reasons: string[] = []
    if (warnings.some((w) => w.source === 'traces')) reasons.push('Kan sporen van gluten bevatten.')
    if (warnings.some((w) => w.source !== 'traces')) {
      reasons.push(
        context === 'menu'
          ? 'Op de kaart staan gerechten of bereidingen met een verhoogd glutenrisico.'
          : 'Bevat ingrediënten die vaak gluten bevatten.',
      )
    }
    return { status: 'warning', matches, warnings, reasons, tips }
  }

  if (!hasData) {
    return {
      status: 'warning',
      matches,
      warnings,
      reasons: ['Productdata ontbreekt: ingrediënten konden niet gecontroleerd worden.'],
      tips,
    }
  }

  const reason =
    context === 'menu' ? 'Geen glutenbronnen herkend in deze tekst.' : 'Geen glutenbronnen gevonden in ingrediënten en allergenen.'
  return { status: 'safe', matches, warnings, reasons: [reason, ...starchNote], tips }
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
  labels?: string
  product_name?: string
  product_name_nl?: string
  brands?: string
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

  const result = scan(
    [
      ...ingredientTexts.map((text) => ({ text, source: 'ingredients' as const })),
      { text: allergensText, source: 'allergens' },
      { text: tracesText, source: 'traces', isTraces: true },
    ],
    'label',
  )

  const claimSources = [
    hasGlutenFreeClaim(p.product_name) || hasGlutenFreeClaim(p.product_name_nl) ? 'productnaam' : '',
    hasGlutenFreeClaim(p.brands) ? 'merk' : '',
    hasGlutenFreeClaim(p.labels) || (p.labels_tags ?? []).some((t) => hasGlutenFreeClaim(t.replace(/^\w{2}:/, '')))
      ? 'keurmerk'
      : '',
    ingredientTexts.some(hasGlutenFreeClaim) ? 'ingrediënten' : '',
  ].filter(Boolean)

  return conclude(
    result,
    {
      hasData: ingredientTexts.length > 0 || (p.allergens_tags?.length ?? 0) > 0,
      claimSources,
      gfWheatStarch: mentionsGfWheatStarch(ingredientTexts),
    },
    'label',
  )
}

/** Vrije tekst analyseren: OCR van een etiket of menukaart, of QR-inhoud. */
export function analyzeText(text: string, context: AnalysisContext = 'label'): GlutenAnalysis {
  const result = scan([{ text, source: 'text' }], context)
  return conclude(
    result,
    {
      hasData: text.trim().length > 0,
      // Op een menukaart zegt "glutenvrije pasta" niets over de rest van de kaart.
      claimSources: context === 'label' && hasGlutenFreeClaim(text) ? ['etiket'] : [],
      gfWheatStarch: mentionsGfWheatStarch([text]),
    },
    context,
  )
}
