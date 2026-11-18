import { useState } from 'react'
import { Ban, Check, ChevronDown, CookingPot, Eye, EyeOff, MapPin, X, type LucideIcon } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { readJson, writeJson } from '../lib/storage'

/**
 * Kaart voor de bediening: in de taal van het land laat je zien wat je niet mag,
 * waar de keuken op moet letten en wat meestal wél kan. Eigen tekst en opbouw.
 */

type Lang = 'nl' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'no' | 'da' | 'sv'

interface Card {
  name: string
  flag: string
  title: string
  intro: string
  /** Niet in mijn eten / In de keuken / Dit kan meestal wel. */
  blocks: [string, string][]
  close: string
}

const CARDS: Record<Lang, Card> = {
  nl: {
    name: 'Nederlands',
    flag: '🇳🇱',
    title: 'Ik heb coeliakie',
    intro: 'Ik mag geen gluten eten. Ook een klein beetje is al te veel.',
    blocks: [
      ['Niet in mijn eten', 'Tarwe, gerst, rogge, spelt en gewone haver. Dus ook geen bloem, brood, paneermeel, pasta, beslag, sojasaus, bier of saus die met bloem gebonden is.'],
      ['In de keuken', 'Graag een schone pan, plank en schoon bestek. Niet frituren in vet waar ook gepaneerde dingen in gaan. Geen pastawater en geen gedeelde broodrooster.'],
      ['Dit kan meestal wel', 'Rijst, aardappel, maïs, vers vlees, vis, ei, groente, fruit en naturel zuivel.'],
    ],
    close: 'Twijfelt u over een gerecht? Zeg het gerust. Dank u wel!',
  },
  en: {
    name: 'English',
    flag: '🇬🇧',
    title: 'I have coeliac disease',
    intro: "I can't eat gluten. Even a tiny amount is too much.",
    blocks: [
      ['Not in my food', 'Wheat, barley, rye, spelt and regular oats. So no flour, bread, breadcrumbs, pasta, batter, soy sauce, beer, or sauces thickened with flour.'],
      ['In the kitchen', 'Please use a clean pan, board and utensils. No frying in oil that is also used for breaded food. No pasta water and no shared toaster.'],
      ['Usually fine', 'Rice, potatoes, corn, fresh meat, fish, eggs, vegetables, fruit and plain dairy.'],
    ],
    close: 'Not sure about a dish? Please just tell me. Thank you!',
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    title: 'Ich habe Zöliakie',
    intro: 'Ich darf kein Gluten essen. Schon eine kleine Menge ist zu viel.',
    blocks: [
      ['Nicht in meinem Essen', 'Weizen, Gerste, Roggen, Dinkel und normaler Hafer. Also kein Mehl, Brot, Paniermehl, keine Nudeln, kein Backteig, keine Sojasoße, kein Bier und keine mit Mehl gebundene Soße.'],
      ['In der Küche', 'Bitte eine saubere Pfanne, ein sauberes Brett und sauberes Besteck. Nicht in Fett frittieren, in dem auch Paniertes frittiert wird. Kein Nudelwasser und kein gemeinsamer Toaster.'],
      ['Meist in Ordnung', 'Reis, Kartoffeln, Mais, frisches Fleisch, Fisch, Eier, Gemüse, Obst und naturbelassene Milchprodukte.'],
    ],
    close: 'Sind Sie bei einem Gericht unsicher? Sagen Sie es mir bitte. Vielen Dank!',
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    title: 'Je suis cœliaque',
    intro: "Je ne peux pas manger de gluten. Même une toute petite quantité, c'est trop.",
    blocks: [
      ['Pas dans mon assiette', "Blé, orge, seigle, épeautre et avoine ordinaire. Donc pas de farine, pain, chapelure, pâtes, pâte à frire, sauce soja, bière, ni de sauce liée à la farine."],
      ['En cuisine', "Merci d'utiliser une poêle, une planche et des ustensiles propres. Pas de friture dans une huile utilisée pour des produits panés. Pas d'eau de cuisson des pâtes, ni de grille-pain partagé."],
      ['En général sans problème', 'Riz, pommes de terre, maïs, viande fraîche, poisson, œufs, légumes, fruits et produits laitiers nature.'],
    ],
    close: "Un doute sur un plat ? N'hésitez pas à me le dire. Merci beaucoup !",
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    title: 'Soy celíaco/a',
    intro: 'No puedo comer gluten. Incluso una cantidad muy pequeña es demasiado.',
    blocks: [
      ['Nada de esto en mi plato', 'Trigo, cebada, centeno, espelta y avena normal. Es decir: nada de harina, pan, pan rallado, pasta, rebozado, salsa de soja, cerveza ni salsas espesadas con harina.'],
      ['En la cocina', 'Por favor, use una sartén, una tabla y utensilios limpios. No fría en aceite que se usa para productos empanados. Nada de agua de cocer pasta ni tostadora compartida.'],
      ['Normalmente sin problema', 'Arroz, patatas, maíz, carne fresca, pescado, huevos, verduras, fruta y lácteos naturales.'],
    ],
    close: '¿Tiene dudas sobre un plato? Dígamelo, por favor. ¡Muchas gracias!',
  },
  it: {
    name: 'Italiano',
    flag: '🇮🇹',
    title: 'Sono celiaco/a',
    intro: 'Non posso mangiare glutine. Anche una piccolissima quantità è troppo.',
    blocks: [
      ['Niente di questo nel mio piatto', 'Frumento, orzo, segale, farro e avena normale. Quindi niente farina, pane, pangrattato, pasta, pastella, salsa di soia, birra né salse addensate con farina.'],
      ['In cucina', "Per favore usate una padella, un tagliere e utensili puliti. Non friggete nell'olio usato per cibi impanati. Niente acqua di cottura della pasta né tostapane in comune."],
      ['Di solito va bene', 'Riso, patate, mais, carne fresca, pesce, uova, verdure, frutta e latticini al naturale.'],
    ],
    close: 'Avete dubbi su un piatto? Ditemelo pure. Grazie mille!',
  },
  pt: {
    name: 'Português',
    flag: '🇵🇹',
    title: 'Tenho doença celíaca',
    intro: 'Não posso comer glúten. Mesmo uma quantidade muito pequena já é demais.',
    blocks: [
      ['Nada disto no meu prato', 'Trigo, cevada, centeio, espelta e aveia normal. Ou seja: nada de farinha, pão, pão ralado, massa, polme, molho de soja, cerveja nem molhos engrossados com farinha.'],
      ['Na cozinha', 'Por favor, use uma frigideira, uma tábua e utensílios limpos. Não frite em óleo usado para panados. Nada de água de cozer massa nem torradeira partilhada.'],
      ['Normalmente sem problema', 'Arroz, batata, milho, carne fresca, peixe, ovos, legumes, fruta e lacticínios naturais.'],
    ],
    close: 'Tem dúvidas sobre um prato? Diga-me, por favor. Muito obrigado/a!',
  },
  no: {
    name: 'Norsk',
    flag: '🇳🇴',
    title: 'Jeg har cøliaki',
    intro: 'Jeg kan ikke spise gluten. Selv en liten mengde er for mye.',
    blocks: [
      ['Ikke i maten min', 'Hvete, bygg, rug, spelt og vanlig havre. Altså ikke mel, brød, brødsmuler, pasta, røre, soyasaus, øl eller saus jevnet med mel.'],
      ['På kjøkkenet', 'Bruk gjerne ren panne, rent skjærebrett og rene redskaper. Ikke frityrstek i olje som også brukes til panert mat. Ikke pastavann eller felles brødrister.'],
      ['Vanligvis greit', 'Ris, poteter, mais, ferskt kjøtt, fisk, egg, grønnsaker, frukt og naturelle meieriprodukter.'],
    ],
    close: 'Er du usikker på en rett? Si gjerne fra. Tusen takk!',
  },
  da: {
    name: 'Dansk',
    flag: '🇩🇰',
    title: 'Jeg har cøliaki',
    intro: 'Jeg kan ikke tåle gluten. Selv en lille smule er for meget.',
    blocks: [
      ['Ikke i min mad', 'Hvede, byg, rug, spelt og almindelig havre. Altså ikke mel, brød, rasp, pasta, dej til friture, sojasauce, øl eller sauce jævnet med mel.'],
      ['I køkkenet', 'Brug venligst en ren pande, et rent skærebræt og rene redskaber. Ikke friturestegning i olie, der også bruges til paneret mad. Ikke pastavand eller fælles brødrister.'],
      ['Normalt fint', 'Ris, kartofler, majs, frisk kød, fisk, æg, grøntsager, frugt og naturelle mejeriprodukter.'],
    ],
    close: 'Er du i tvivl om en ret? Så sig det endelig. Mange tak!',
  },
  sv: {
    name: 'Svenska',
    flag: '🇸🇪',
    title: 'Jag har celiaki',
    intro: 'Jag kan inte äta gluten. Även en liten mängd är för mycket.',
    blocks: [
      ['Inte i min mat', 'Vete, korn, råg, dinkel och vanlig havre. Alltså inget mjöl, bröd, ströbröd, pasta, frityrsmet, sojasås, öl eller sås redd med mjöl.'],
      ['I köket', 'Använd gärna en ren stekpanna, skärbräda och rena redskap. Fritera inte i olja som också används till panerad mat. Inget pastavatten eller delad brödrost.'],
      ['Brukar gå bra', 'Ris, potatis, majs, färskt kött, fisk, ägg, grönsaker, frukt och naturella mejeriprodukter.'],
    ],
    close: 'Är du osäker på en rätt? Säg gärna till. Tack så mycket!',
  },
}

const BLOCK_STYLE: { icon: LucideIcon; cls: string }[] = [
  { icon: Ban, cls: 'bg-[#ffe3e0] text-[#c0281d]' },
  { icon: CookingPot, cls: 'bg-[#fff1d6] text-[#a35f00]' },
  { icon: Check, cls: 'bg-[#e3f6ea] text-[#137a46]' },
]

/** Tijdzone van de telefoon → taal van het land. Telefoons passen de tijdzone vanzelf aan op reis. */
const ZONE_LANG: Record<string, Lang> = {
  'Europe/Amsterdam': 'nl',
  'Europe/London': 'en',
  'Europe/Dublin': 'en',
  'Europe/Malta': 'en',
  'Europe/Berlin': 'de',
  'Europe/Vienna': 'de',
  'Europe/Zurich': 'de',
  'Europe/Paris': 'fr',
  'Europe/Luxembourg': 'fr',
  'Europe/Monaco': 'fr',
  'Europe/Madrid': 'es',
  'Atlantic/Canary': 'es',
  'Africa/Ceuta': 'es',
  'Europe/Rome': 'it',
  'Europe/Lisbon': 'pt',
  'Atlantic/Madeira': 'pt',
  'Atlantic/Azores': 'pt',
  'Europe/Oslo': 'no',
  'Europe/Copenhagen': 'da',
  'Europe/Stockholm': 'sv',
}

function zoneLang(): Lang | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (ZONE_LANG[zone]) return ZONE_LANG[zone]
    if (zone.startsWith('America/') || zone.startsWith('Australia/')) return 'en'
  } catch {
    // Geen tijdzone: dan geen voorstel.
  }
  return null
}

const LANG_KEY = 'glutenscanner.travelLang.v1'
const ORDER = Object.keys(CARDS) as Lang[]

export function TravelCardPage({ onBack }: { onBack: () => void }) {
  const here = zoneLang()
  const [lang, setLang] = useState<Lang>(() => {
    // Op reis (niet in Nederland) kiezen we de taal van het land; thuis de laatst gekozen taal.
    if (here && here !== 'nl') return here
    const saved = readJson<string>(LANG_KEY, 'en')
    return saved in CARDS ? (saved as Lang) : 'en'
  })
  const [picker, setPicker] = useState(false)
  const [readAlong, setReadAlong] = useState(false)
  const card = CARDS[lang]

  function choose(next: Lang) {
    setLang(next)
    writeJson(LANG_KEY, next)
    setPicker(false)
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6">
      <PageHeader title="Kaart voor de bediening" onBack={onBack} className="-mx-4" />

      <button
        onClick={() => setPicker(true)}
        className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 text-left ring-1 ring-white/10 active:bg-surface-raised"
        aria-haspopup="dialog"
      >
        <span className="text-[30px] leading-none" aria-hidden>
          {card.flag}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] text-muted">Taal van de kaart</span>
          <span className="text-[19px] font-semibold leading-tight">{card.name}</span>
        </span>
        {here === lang && here !== 'nl' && (
          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[12px] font-semibold text-accent">
            <MapPin size={13} /> Hier
          </span>
        )}
        <ChevronDown size={22} className="shrink-0 text-muted" />
      </button>

      <article lang={lang} key={lang} className="animate-slide-up flex flex-col gap-4 rounded-[28px] bg-white p-6 text-black">
        <header>
          <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">{card.title}</h1>
          <p className="mt-1 text-[19px] font-semibold leading-snug">{card.intro}</p>
        </header>
        {card.blocks.map(([head, text], i) => {
          const { icon: Icon, cls } = BLOCK_STYLE[i]
          return (
            <section key={head} className={`rounded-2xl p-4 ${cls}`}>
              <h2 className="flex items-center gap-2 text-[17px] font-bold">
                <Icon size={20} className="shrink-0" />
                {head}
              </h2>
              <p className="mt-1 text-[17px] leading-snug text-black/85">{text}</p>
            </section>
          )
        })}
        <p className="text-[17px] italic leading-snug text-black/70">{card.close}</p>
      </article>

      {lang !== 'nl' && (
        <button
          onClick={() => setReadAlong((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-full bg-surface py-3 text-[16px] font-semibold text-white/85 active:bg-surface-raised"
          aria-expanded={readAlong}
        >
          {readAlong ? <EyeOff size={18} /> : <Eye size={18} />}
          {readAlong ? 'Verberg Nederlands' : 'Lees mee in het Nederlands'}
        </button>
      )}
      {readAlong && lang !== 'nl' && (
        <div className="animate-slide-up rounded-[22px] bg-surface p-5 text-[15px] leading-snug text-white/80">
          <p className="font-semibold text-white">{CARDS.nl.intro}</p>
          {CARDS.nl.blocks.map(([head, text]) => (
            <p key={head} className="mt-2">
              <b className="text-white">{head}:</b> {text}
            </p>
          ))}
        </div>
      )}

      <p className="px-2 text-center text-[13px] leading-relaxed text-muted">
        Ook met deze kaart kan een keuken een fout maken. Vraag gerust hoe je eten gemaakt wordt.
      </p>

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setPicker(false)} role="dialog" aria-label="Kies een taal">
          <div
            className="animate-slide-up w-full rounded-t-[28px] bg-surface p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[19px] font-bold">Kies een taal</h2>
              <button onClick={() => setPicker(false)} className="rounded-full bg-white/10 p-2" aria-label="Sluiten">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ORDER.map((id) => (
                <button
                  key={id}
                  onClick={() => choose(id)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-[17px] font-medium ${
                    id === lang ? 'bg-accent text-white' : 'bg-black/30 active:bg-black/50'
                  }`}
                >
                  <span className="text-[24px] leading-none" aria-hidden>
                    {CARDS[id].flag}
                  </span>
                  <span className="flex-1">{CARDS[id].name}</span>
                  {id === here && <MapPin size={16} className="shrink-0 opacity-80" aria-label="Hier" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
