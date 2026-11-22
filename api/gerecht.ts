/**
 * Bekijkt een foto van een gerecht met AI (Claude) en geeft terug welke onderdelen erop liggen.
 * De AI kiest alleen uit vaste onderdelen (zie src/data/dishParts.ts); de tips schrijft de app zelf.
 * De foto wordt niet bewaard.
 *
 * Nodig in Vercel: ANTHROPIC_API_KEY. Optioneel: GERECHT_PER_DAG (standaard 300).
 */

/** Zelfde id's als DISH_PARTS in src/data/dishParts.ts, met een uitleg voor de AI. */
const PARTS: Record<string, string> = {
  pasta: 'any wheat pasta shape (spaghetti, penne, fusilli, cavatelli, lasagne, ravioli…)',
  orzo: 'orzo / risoni (rice-shaped pasta), often confused with rice',
  gnocchi: 'gnocchi',
  couscous: 'couscous or bulgur',
  graankorrels: 'whole grain kernels like wheat berries, spelt, farro, barley, freekeh',
  noedels: 'noodles (mie, udon, ramen, rice noodles)',
  brood: 'bread, toast, sandwich, bun, slider, garlic bread, crostini, pan con tomate, crackers, breadsticks',
  wrap: 'flour wrap, tortilla wrap, pancake, crêpe, pita, naan, flatbread',
  pizza: 'pizza, quiche, savoury pie or tart with a dough crust',
  bladerdeeg: 'puff pastry or filled pastry pockets (Wellington, vol-au-vent, sausage roll, empanadas)',
  vulling: 'stuffing inside meat, poultry or vegetables (rolled roast, stuffed chicken, stuffed peppers)',
  gepaneerd: 'breaded or crumb-coated food (schnitzel, croquette, bitterbal, croquetas, nuggets, fish fingers, breaded fish)',
  beslag: 'deep fried in batter (tempura, battered fish, calamari rings, onion rings, kibbeling)',
  gehaktballen: 'minced meat: meatballs, patties, burgers, or loose fried mince',
  kruidenmix: 'dish typically made with a ready-made seasoning mix (Dutch macaroni with mince, nasi, bami, taco/chili mince)',
  worst: 'sausages',
  saus: 'thick, creamy or brown sauce or gravy',
  taart: 'cake, pie, pastry, cookies, biscuits, brownies',
  kruimels: 'crumbs or crumble topping (cookie crumbs, crumble)',
  croutons: 'croutons',
  sojasaus: 'Asian-style sauce (soy, teriyaki, satay, hoisin)',
  friet: 'french fries / chips, potato wedges, deep-fried potato cubes (patatas bravas)',
  soep: 'soup',
  risotto: 'risotto',
  bloemlaagje: 'pan-fried fish or meat without visible crumbs (often dusted with flour)',
  vleeswaren: 'ham, bacon, lardons, cured or sliced meats',
  dressing: 'salad dressing, mayonnaise-like sauce on salad',
  marinade: 'visibly marinated, glazed or spice-rubbed meat or fish',
  gratin: 'oven dish with a baked cheese crust or gratin (often with white sauce underneath)',
  bier: 'glasses or bottles of beer visible on the table',
  stamppot: 'Dutch stamppot, hutspot or mashed potatoes',
  dip: 'dips in small bowls: hummus, guacamole, aioli, salsa, tzatziki',
  toetje: 'dessert in a glass or bowl (yoghurt, custard, pudding, mousse, ice cream)',
  tomatensaus: 'tomato sauce, bolognese-style or chunky vegetable tomato sauce (not thick creamy sauce)',
  rijst: 'plain rice',
  groentenoedels: 'vegetable noodles (courgetti / zucchini spirals), looks like pasta',
  aardappel: 'potatoes (boiled, roasted, mashed, rösti)',
  quinoa: 'quinoa, polenta, buckwheat, millet',
  vlees: 'plain meat, fish, chicken, shrimp, tofu, tempeh',
  groente: 'vegetables (cooked or roasted)',
  salade: 'lettuce, leafy salad, coleslaw, raw vegetables',
  peulvruchten: 'beans, lentils, chickpeas, peas',
  ei: 'egg',
  kaas: 'cheese, mozzarella, burrata, yoghurt, cream',
  fruit: 'fruit, pomegranate seeds, berries',
  noten: 'nuts or seeds (sesame, pecans, pine nuts)',
}

const SYSTEM = `You look at a photo of food for a gluten-free app used by people with coeliac disease (also children).
Report which components you can SEE, using only these ids:
${Object.entries(PARTS)
  .map(([id, d]) => `- ${id}: ${d}`)
  .join('\n')}

Rules:
- Pick every component that is visible, at most 10. Put components that often hide gluten first.
- Pasta is always pasta, also wholewheat or in a cold pasta salad. A pasta salad usually also has dressing.
- Pan-fried fish or meat: add bloemlaagje. Rolled or stuffed meat: add vulling. Dutch macaroni or nasi: add kruidenmix.
- If a component could easily be a look-alike, give the most likely id and put the other in "alt".
  Examples: orzo vs rijst, gnocchi vs pasta, groentenoedels vs pasta, graankorrels vs peulvruchten,
  gepaneerd vs vlees (tempeh, roasted tofu or crispy skin can look breaded), saus vs tomatensaus.
- "dish": a short Dutch name for the dish as it looks (max 6 words), simple words a child understands.
  Never write "glutenvrij" or anything about gluten in the name.
- If the photo shows no food or drink (a label, a menu, a person, a room), set food to false.
- A table or board with many small dishes (tapas, borrel, buffet, mezze): set several to true, give it a short
  name like "Tapas" or "Borrelplank", and list the components across ALL dishes (at most 10).
- A collage of separate photos: set several to true and describe the biggest dish.
- Ignore people, hands, cutlery and text on the photo.`

const TOOL = {
  name: 'gerecht',
  description: 'Report the visible food components.',
  input_schema: {
    type: 'object',
    properties: {
      food: { type: 'boolean' },
      several: { type: 'boolean' },
      dish: { type: 'string' },
      parts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', enum: Object.keys(PARTS) },
            alt: { type: 'string', enum: Object.keys(PARTS) },
          },
          required: ['id'],
        },
      },
    },
    required: ['food', 'dish', 'parts'],
  },
}

const MAX_BYTES = 1_500_000
const PER_IP_HOUR = 60
const ipHits = new Map<string, number[]>()
let day = ''
let dayCount = 0

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}

function allowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  try {
    const host = new URL(origin).hostname
    return host === 'www.glutenscanner.nl' || host === 'glutenscanner.nl' || host.endsWith('.vercel.app') || host === 'localhost'
  } catch {
    return false
  }
}

/** Zachte grens per server: zo kan niemand de AI eindeloos laten werken. */
function overLimit(ip: string): boolean {
  const now = Date.now()
  const today = new Date().toISOString().slice(0, 10)
  if (today !== day) {
    day = today
    dayCount = 0
  }
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < 3600_000)
  if (hits.length >= PER_IP_HOUR || dayCount >= Number(process.env.GERECHT_PER_DAG ?? 300)) return true
  hits.push(now)
  ipHits.set(ip, hits)
  dayCount++
  return false
}

export async function POST(request: Request): Promise<Response> {
  if (!allowedOrigin(request.headers.get('origin'))) return json({ error: 'origin' }, 403)
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return json({ error: 'niet-ingesteld' }, 503)

  let image: string
  try {
    const body = (await request.json()) as { image?: unknown }
    if (typeof body.image !== 'string' || !/^[A-Za-z0-9+/=]+$/.test(body.image)) return json({ error: 'foto' }, 400)
    image = body.image
  } catch {
    return json({ error: 'foto' }, 400)
  }
  if (image.length * 0.75 > MAX_BYTES) return json({ error: 'te-groot' }, 413)

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'onbekend'
  if (overLimit(ip)) return json({ error: 'limiet' }, 429)

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: process.env.GERECHT_MODEL ?? 'claude-haiku-5-5',
      max_tokens: 600,
      system: SYSTEM,
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'gerecht' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
            { type: 'text', text: 'Which components are on this photo?' },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(25000),
  }).catch(() => null)
  if (!res || !res.ok) return json({ error: 'ai', status: res?.status ?? 0 }, 502)

  const data = (await res.json()) as { content?: { type: string; input?: unknown }[] }
  const input = data.content?.find((c) => c.type === 'tool_use')?.input as
    | { food?: boolean; several?: boolean; dish?: string; parts?: { id?: string; alt?: string }[] }
    | undefined
  if (!input) return json({ error: 'ai' }, 502)

  // Alleen bekende onderdelen, en nooit het woord glutenvrij in de naam.
  const seen = new Set<string>()
  const parts = (input.parts ?? [])
    .filter((p) => p.id && p.id in PARTS && !seen.has(p.id) && seen.add(p.id))
    .slice(0, 10)
    .map((p) => ({ id: p.id as string, ...(p.alt && p.alt in PARTS && p.alt !== p.id ? { alt: p.alt } : {}) }))
  const dish = String(input.dish ?? '')
    .replace(/gluten\s*-?\s*vrij\w*|gluten\w*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/^\p{Ll}/u, (c) => c.toUpperCase())
  return json({ food: input.food !== false, several: !!input.several, dish, parts })
}
