/**
 * Onderdelen van een gerecht, met een rustige tip per onderdeel. Gluten zie je niet op een foto,
 * dus we zeggen nooit "glutenvrij": alleen waar gluten vaak zitten en wat je kunt vragen.
 *
 * De AI (api/gerecht.ts) kiest alleen uit deze id's; de tips schrijven wij zelf.
 * Voeg je hier een onderdeel toe, zet de id dan ook in PARTS in api/gerecht.ts.
 */
export type DishGroup = 'let' | 'vraag' | 'goed'

export interface DishPart {
  label: string
  emoji: string
  group: DishGroup
  tip: string
  /** Vraag voor de bediening (alleen bij 'let' en 'vraag'). */
  ask?: string
}

export const DISH_PARTS: Record<string, DishPart> = {
  pasta: { label: 'Pasta', emoji: '🍝', group: 'let', tip: 'Gewone pasta is van tarwe. Alleen goed als het glutenvrije pasta is.', ask: 'Is de pasta glutenvrij, en gekookt in schoon water?' },
  orzo: { label: 'Orzo', emoji: '🍚', group: 'let', tip: 'Orzo lijkt op rijst, maar het is pasta van tarwe.', ask: 'Is dit rijst of orzo?' },
  gnocchi: { label: 'Gnocchi', emoji: '🥟', group: 'let', tip: 'Gnocchi zijn van aardappel, maar bijna altijd met tarwebloem erin.', ask: 'Zit er bloem in de gnocchi?' },
  couscous: { label: 'Couscous of bulgur', emoji: '🥣', group: 'let', tip: 'Couscous en bulgur zijn gemaakt van tarwe.', ask: 'Is dit couscous, of quinoa of rijst?' },
  graankorrels: { label: 'Graankorrels', emoji: '🌾', group: 'let', tip: 'Korrels als tarwe, spelt, gerst of farro hebben gluten. Ze lijken soms op maïs of bonen.', ask: 'Welke korrels zijn dit?' },
  noedels: { label: 'Noedels', emoji: '🍜', group: 'let', tip: 'Mie, udon en ramen zijn van tarwe. Rijstnoedels zijn meestal goed.', ask: 'Zijn het rijstnoedels?' },
  brood: { label: 'Brood', emoji: '🍞', group: 'let', tip: 'Gewoon brood is van tarwe. Let ook op kruimels op je bord.', ask: 'Hebben jullie glutenvrij brood?' },
  wrap: { label: 'Wrap, pannenkoek of crêpe', emoji: '🌯', group: 'let', tip: 'Het deeg of beslag is meestal van tarwebloem. Puur boekweit is wel goed.', ask: 'Waar is het beslag van gemaakt?' },
  pizza: { label: 'Pizza of hartige taart', emoji: '🍕', group: 'let', tip: 'De bodem is bijna altijd van tarwebloem.', ask: 'Hebben jullie een glutenvrije bodem, apart gebakken?' },
  gepaneerd: { label: 'Gepaneerd', emoji: '🍗', group: 'let', tip: 'Een krokant laagje is meestal paneermeel of bloem: tarwe. Denk aan schnitzel, kroket en kibbeling.', ask: 'Waar is het krokante laagje van?' },
  beslag: { label: 'Gefrituurd in beslag', emoji: '🍤', group: 'let', tip: 'Beslag, zoals bij tempura, is meestal van tarwebloem.', ask: 'Waar is het beslag van gemaakt?' },
  gehaktballen: { label: 'Gehaktballen', emoji: '🧆', group: 'let', tip: 'In gehakt zit vaak paneermeel of oud brood.', ask: 'Zit er paneermeel in het gehakt?' },
  worst: { label: 'Worst', emoji: '🌭', group: 'let', tip: 'Worst bevat vaak bloem, paneermeel of beschuit.', ask: 'Zit er bloem of paneermeel in de worst?' },
  saus: { label: 'Dikke of romige saus', emoji: '🥫', group: 'let', tip: 'Dikke sauzen en jus zijn vaak gebonden met bloem.', ask: 'Is de saus gebonden met bloem?' },
  taart: { label: 'Taart, gebak of koek', emoji: '🍰', group: 'let', tip: 'Bijna altijd gemaakt met tarwebloem.', ask: 'Is dit glutenvrij gebakken?' },
  kruimels: { label: 'Kruimels of crumble', emoji: '🍪', group: 'let', tip: 'Kruimels zijn vaak fijngemaakte koek, zoals speculaas of biscuit.', ask: 'Waar zijn de kruimels van?' },
  croutons: { label: 'Croutons', emoji: '🥖', group: 'let', tip: 'Croutons zijn stukjes brood. Eraf halen is niet genoeg: er blijven kruimels achter.', ask: 'Kunt u de salade maken zonder croutons?' },
  sojasaus: { label: 'Aziatische saus', emoji: '🥢', group: 'vraag', tip: 'Gewone sojasaus wordt gemaakt met tarwe. Tamari is meestal goed.', ask: 'Gebruiken jullie gewone sojasaus of tamari?' },
  friet: { label: 'Friet', emoji: '🍟', group: 'vraag', tip: 'Friet zelf is meestal goed. Maar niet als hij in dezelfde frituur gaat als kroketten of snacks.', ask: 'Hebben jullie een aparte frituur voor friet?' },
  soep: { label: 'Soep', emoji: '🍲', group: 'vraag', tip: 'Soep is vaak gebonden met bloem, of gemaakt met bouillon waar gluten in zitten.', ask: 'Zit er bloem of gewone bouillon in de soep?' },
  risotto: { label: 'Risotto', emoji: '🍚', group: 'vraag', tip: 'Rijst is goed. Maar de bouillon kan gluten bevatten.', ask: 'Welke bouillon zit in de risotto?' },
  dressing: { label: 'Dressing', emoji: '🥗', group: 'vraag', tip: 'In dressing zit soms sojasaus, mosterd met bloem of moutazijn.', ask: 'Wat zit er in de dressing?' },
  marinade: { label: 'Gemarineerd vlees of vis', emoji: '🍖', group: 'vraag', tip: 'Marinades en kruidenmixen bevatten soms sojasaus of bloem.', ask: 'Wat zit er in de marinade?' },
  gratin: { label: 'Korstje uit de oven', emoji: '🧀', group: 'vraag', tip: 'Een gratinkorstje is vaak kaas, maar soms zit er paneermeel in.', ask: 'Zit er paneermeel in het korstje?' },
  toetje: { label: 'Toetje', emoji: '🍮', group: 'vraag', tip: 'Vla, yoghurt en pudding zijn meestal goed. Let op koekjes of kruimels erop.', ask: 'Zit er koek in het toetje?' },
  rijst: { label: 'Rijst', emoji: '🍚', group: 'goed', tip: 'Rijst is glutenvrij.' },
  groentenoedels: { label: 'Groenteslierten', emoji: '🥒', group: 'goed', tip: 'Dit is groente, geen pasta. Let wel op de saus.' },
  aardappel: { label: 'Aardappel', emoji: '🥔', group: 'goed', tip: 'Aardappels zijn glutenvrij. Rösti en kroketjes soms niet: daar zit vaak bloem in.' },
  quinoa: { label: 'Quinoa, polenta of boekweit', emoji: '🌽', group: 'goed', tip: 'Van zichzelf glutenvrij.' },
  vlees: { label: 'Vlees, vis of kip', emoji: '🐟', group: 'goed', tip: 'Puur vlees, vis en kip zijn glutenvrij. Zit er een korstje of marinade op, kijk dan bij die tip.' },
  groente: { label: 'Groente', emoji: '🥦', group: 'goed', tip: 'Groente is glutenvrij.' },
  salade: { label: 'Sla en rauwkost', emoji: '🥬', group: 'goed', tip: 'Sla en rauwkost zijn glutenvrij. Let op de dressing.' },
  peulvruchten: { label: 'Bonen, linzen of erwten', emoji: '🫘', group: 'goed', tip: 'Peulvruchten zijn glutenvrij.' },
  ei: { label: 'Ei', emoji: '🥚', group: 'goed', tip: 'Ei is glutenvrij.' },
  kaas: { label: 'Kaas of zuivel', emoji: '🧀', group: 'goed', tip: 'Kaas, melk en yoghurt zijn glutenvrij.' },
  fruit: { label: 'Fruit', emoji: '🍓', group: 'goed', tip: 'Fruit is glutenvrij.' },
  noten: { label: 'Noten of zaden', emoji: '🥜', group: 'goed', tip: 'Noten en zaden zijn glutenvrij. Gezouten of gebrande noten soms met een laagje.' },
}

/** Volgorde in de lijst om zelf aan te tikken: eerst wat je het vaakst ziet. */
export const PICK_ORDER = [
  'pasta', 'rijst', 'aardappel', 'friet', 'vlees', 'groente', 'salade', 'saus',
  'gepaneerd', 'gehaktballen', 'worst', 'brood', 'wrap', 'pizza', 'noedels', 'soep',
  'risotto', 'orzo', 'gnocchi', 'couscous', 'graankorrels', 'groentenoedels', 'quinoa', 'peulvruchten',
  'sojasaus', 'dressing', 'marinade', 'beslag', 'gratin', 'croutons', 'kruimels', 'taart',
  'toetje', 'ei', 'kaas', 'fruit', 'noten',
]

export const GROUP_TITLE: Record<DishGroup, string> = {
  let: 'Hier zitten vaak gluten',
  vraag: 'Even navragen',
  goed: 'Meestal goed',
}
