/**
 * Ingrediëntengids: per glutenbron of -groep wat het is, hoe riskant en wat je
 * in plaats daarvan kunt gebruiken. Algemene voorlichting, geen medisch advies.
 */
import type { RiskLevel } from './glutenGuide'

export interface IngredientEntry {
  name: string
  /** Korte omschrijving onder de naam. */
  summary: string
  risk: RiskLevel
  /** Extra uitleg: waar je het tegenkomt of waarom het risico zo is. */
  note?: string
  alternatives: string[]
}

export interface IngredientTab {
  id: string
  label: string
  intro: string
  entries: IngredientEntry[]
}

export const RISK_INFO: Record<RiskLevel, string> = {
  hoog: 'HOOG RISICO: bevat gluten. Vermijd dit volledig in een glutenvrij dieet.',
  middel: 'LET OP: kan gluten bevatten, afhankelijk van merk, herkomst of bereiding. Controleer altijd het etiket.',
  laag: 'LAAG RISICO: van nature glutenvrij, of zo bewerkt dat het wettelijk glutenvrij is. Meestal veilig.',
}

export const INGREDIENT_TABS: IngredientTab[] = [
  {
    id: 'tarwe',
    label: 'Tarwe',
    intro: 'De belangrijkste glutenbron. Ook oude tarwesoorten en tarweproducten met een andere naam horen hierbij.',
    entries: [
      { name: 'Tarwe', summary: 'Primaire bron van gluten', risk: 'hoog', alternatives: ['Rijstmeel', 'Boekweitmeel', 'Maïsmeel'] },
      {
        name: 'Tarwebloem / tarwemeel',
        summary: 'Veelgebruikt bakingrediënt',
        risk: 'hoog',
        note: 'Staat op etiketten vaak gewoon als "bloem" of "meel".',
        alternatives: ['Glutenvrije bloemmix', 'Rijstmeel', 'Amandelmeel'],
      },
      { name: 'Volkoren tarwe', summary: 'In volkorenbrood, crackers en pasta', risk: 'hoog', alternatives: ['Teffmeel', 'Boekweitmeel', 'Volkoren rijstmeel'] },
      {
        name: 'Tarwezetmeel',
        summary: 'Bindmiddel in sauzen, snoep en vleeswaren',
        risk: 'hoog',
        note: 'Uitzondering: "glutenvrij tarwezetmeel" is speciaal gezuiverd en wettelijk glutenvrij.',
        alternatives: ['Maïszetmeel (maïzena)', 'Aardappelzetmeel', 'Tapiocazetmeel'],
      },
      { name: 'Tarwekiemen', summary: 'In ontbijtgranen en smoothies', risk: 'hoog', alternatives: ['Chiazaad', 'Lijnzaad', 'Hennepzaad'] },
      { name: 'Tarwezemelen', summary: 'Vezels in brood en muesli', risk: 'hoog', alternatives: ['Rijstzemelen', 'Psylliumvezels', 'Lijnzaad'] },
      { name: 'Griesmeel', summary: 'Grove durumtarwe, voor pap en pasta', risk: 'hoog', alternatives: ['Maïsgries (polenta)', 'Rijstgries'] },
      { name: 'Durumtarwe', summary: 'Harde tarwe voor gewone pasta', risk: 'hoog', alternatives: ['Pasta van mais, rijst of peulvruchten'] },
      {
        name: 'Spelt',
        summary: 'Oude tarwevariëteit',
        risk: 'hoog',
        note: 'Wordt soms als "gezonder" verkocht, maar bevat net zoveel gluten.',
        alternatives: ['Boekweit', 'Quinoa', 'Gierst'],
      },
      { name: 'Kamut (khorasan)', summary: 'Oude tarwevariëteit', risk: 'hoog', alternatives: ['Quinoa', 'Amarant'] },
      { name: 'Eenkoorn', summary: 'Oude tarwevariëteit', risk: 'hoog', alternatives: ['Gierst', 'Sorghum'] },
      { name: 'Emmer', summary: 'Oude tarwevariëteit', risk: 'hoog', alternatives: ['Sorghum', 'Teff'] },
      { name: 'Farro', summary: 'Italiaanse naam voor emmer of spelt', risk: 'hoog', alternatives: ['Bruine rijst', 'Wilde rijst'] },
      { name: 'Bulgur', summary: 'Voorgekookte, gebroken tarwe', risk: 'hoog', alternatives: ['Quinoa', 'Boekweit'] },
      { name: 'Couscous', summary: 'Korrels van griesmeel', risk: 'hoog', alternatives: ['Quinoa', 'Gierst', 'Glutenvrije maïscouscous'] },
      { name: 'Freekeh', summary: 'Jonge, geroosterde tarwe', risk: 'hoog', alternatives: ['Wilde rijst', 'Boekweit'] },
      { name: 'Seitan', summary: 'Vleesvervanger van puur tarwegluten', risk: 'hoog', alternatives: ['Tofu', 'Tempeh', 'Peulvruchten'] },
      { name: 'Triticale', summary: 'Kruising van tarwe en rogge', risk: 'hoog', alternatives: ['Teff', 'Amarant'] },
      { name: 'Paneermeel / panko', summary: 'Gedroogd, gemalen tarwebrood', risk: 'hoog', alternatives: ['Glutenvrij paneermeel', 'Gemalen maïsvlokken', 'Amandelmeel'] },
    ],
  },
  {
    id: 'gerst',
    label: 'Gerst',
    intro: 'Gerst zit vaak verstopt als mout: in chocolade, ontbijtgranen, bier en zoetmiddelen.',
    entries: [
      { name: 'Gerst', summary: 'Graan met gluten (hordeïne)', risk: 'hoog', alternatives: ['Bruine rijst', 'Quinoa'] },
      { name: 'Parelgerst / gort', summary: 'Gepelde gerst in soep en stoofpot', risk: 'hoog', alternatives: ['Rijst', 'Gierst', 'Boekweit'] },
      {
        name: 'Mout / gerstemout',
        summary: 'Gekiemde, gedroogde gerst',
        risk: 'hoog',
        note: '"Mout" of "malt" zonder graansoort is bijna altijd gerst.',
        alternatives: ['Rijststroop', 'Ahornsiroop'],
      },
      {
        name: 'Moutextract / gerstemoutextract',
        summary: 'Smaakmaker en zoetmiddel',
        risk: 'hoog',
        note: 'Zit in ontbijtgranen, chocolade, crispy rijst en koekjes.',
        alternatives: ['Ahornsiroop', 'Honing', 'Rijststroop'],
      },
      { name: 'Moutsiroop', summary: 'Stroop van gerstemout', risk: 'hoog', alternatives: ['Ahornsiroop', 'Agavesiroop'] },
      {
        name: 'Moutazijn',
        summary: 'Azijn gebrouwen van gerst',
        risk: 'middel',
        note: 'Wordt in kleine hoeveelheden gebruikt (chips, sauzen). Niet gelabeld glutenvrij: overleg met je diëtist.',
        alternatives: ['Wijnazijn', 'Appelazijn', 'Balsamicoazijn'],
      },
      { name: 'Bier & maltdranken', summary: 'Gebrouwen van gerstemout', risk: 'hoog', note: 'Ook alcoholvrij bier bevat gluten.', alternatives: ['Glutenvrij bier', 'Cider', 'Wijn'] },
      { name: 'Gerstekoffie', summary: 'Koffievervanger van geroosterde gerst', risk: 'hoog', alternatives: ['Gewone koffie', 'Zuivere cichoreikoffie'] },
      {
        name: 'Gerstegras',
        summary: 'Poeder van jonge gerstespruiten',
        risk: 'middel',
        note: 'Het gras zelf bevat weinig gluten, maar zaad en besmetting zijn een risico.',
        alternatives: ['Spirulina', 'Spinaziepoeder'],
      },
    ],
  },
  {
    id: 'rogge',
    label: 'Rogge',
    intro: 'Rogge bevat secaline, een vorm van gluten. Vooral in donker brood en ontbijtkoek.',
    entries: [
      { name: 'Rogge', summary: 'Graan met gluten (secaline)', risk: 'hoog', alternatives: ['Boekweit', 'Teff'] },
      { name: 'Roggemeel', summary: 'Basis van ontbijtkoek en roggebrood', risk: 'hoog', alternatives: ['Boekweitmeel', 'Teffmeel'] },
      { name: 'Roggebrood', summary: 'Compact, donker brood', risk: 'hoog', alternatives: ['Glutenvrij donker brood', 'Glutenvrij zadenbrood'] },
      { name: 'Ontbijtkoek & peperkoek', summary: 'Kruidige koek met roggemeel', risk: 'hoog', alternatives: ['Glutenvrije ontbijtkoek'] },
      { name: 'Pumpernickel', summary: 'Duits roggebrood', risk: 'hoog', alternatives: ['Glutenvrij zadenbrood'] },
      { name: 'Knäckebröd', summary: 'Knapperig roggebrood uit Scandinavië', risk: 'hoog', alternatives: ['Rijstcrackers', 'Maïswafels'] },
      { name: 'Roggevlokken', summary: 'In muesli en granola', risk: 'hoog', alternatives: ['Quinoavlokken', 'Boekweitvlokken'] },
    ],
  },
  {
    id: 'haver',
    label: 'Haver',
    intro:
      'Haver zelf bevat avenine. Gewone haver is bijna altijd besmet met tarwe. Alleen gecertificeerd glutenvrije haver is een optie, en niet voor iedereen.',
    entries: [
      { name: 'Haver', summary: 'Graan, bijna altijd besmet met tarwe', risk: 'hoog', alternatives: ['Gecertificeerd glutenvrije haver', 'Quinoa'] },
      { name: 'Havermout / havervlokken', summary: 'Ontbijtpap en bakken', risk: 'hoog', alternatives: ['Glutenvrije havervlokken', 'Quinoavlokken', 'Boekweitvlokken'] },
      { name: 'Havermelk', summary: 'Plantaardige melk', risk: 'hoog', note: 'Alleen veilig als er "glutenvrij" op staat.', alternatives: ['Glutenvrije havermelk', 'Rijstmelk', 'Amandelmelk'] },
      { name: 'Havermeel', summary: 'Meel van gemalen haver', risk: 'hoog', alternatives: ['Glutenvrij havermeel', 'Rijstmeel'] },
      { name: 'Haverzemelen', summary: 'Vezels in ontbijt en brood', risk: 'hoog', alternatives: ['Rijstzemelen', 'Psylliumvezels'] },
      { name: 'Muesli & granola', summary: 'Mix van vlokken, vaak met haver en mout', risk: 'hoog', alternatives: ['Glutenvrije granola', 'Zelfgemaakt met boekweit en noten'] },
      {
        name: 'Gecertificeerd glutenvrije haver',
        summary: 'Apart geteeld en verwerkt',
        risk: 'middel',
        note: 'Een deel van de mensen met coeliakie reageert ook op pure haver. Overleg met je arts of diëtist.',
        alternatives: ['Quinoavlokken', 'Rijstvlokken'],
      },
    ],
  },
  {
    id: 'derivaten',
    label: 'Derivaten',
    intro: 'Stoffen gemaakt van glutengranen. Sommige zijn zo bewerkt dat er geen gluten meer in zitten, andere juist niet.',
    entries: [
      {
        name: 'Glucosestroop (uit tarwe of gerst)',
        summary: 'Zoetstof in snoep en koek',
        risk: 'laag',
        note: 'Zo ver bewerkt dat het volgens de EU-wet geen gluten meer bevat.',
        alternatives: ['Geen alternatief nodig'],
      },
      { name: 'Dextrose', summary: 'Druivensuiker, soms uit tarwe', risk: 'laag', note: 'Wettelijk vrijgesteld: veilig.', alternatives: ['Geen alternatief nodig'] },
      {
        name: 'Maltodextrine',
        summary: 'Vulstof en zoetmiddel',
        risk: 'laag',
        note: 'Ook uit tarwe gemaakt is het veilig. Niet verwarren met mout.',
        alternatives: ['Geen alternatief nodig'],
      },
      { name: 'Glucose-fructosestroop', summary: 'Zoetstof in frisdrank en snoep', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      {
        name: 'Glutenvrij tarwezetmeel',
        summary: 'Speciaal gezuiverd zetmeel',
        risk: 'laag',
        note: 'Max. 20 ppm gluten; veel gebruikt in glutenvrij brood en koek.',
        alternatives: ['Maïszetmeel', 'Aardappelzetmeel'],
      },
      {
        name: 'Gedistilleerde drank uit graan',
        summary: 'Wodka, whisky, jenever',
        risk: 'laag',
        note: 'Destillatie verwijdert gluten. Let wel op toegevoegde smaakstoffen.',
        alternatives: ['Wijn', 'Rum', 'Tequila'],
      },
      { name: 'Gehydrolyseerd tarwe-eiwit', summary: 'Smaakversterker in soep en saus', risk: 'hoog', alternatives: ['Gistextract (glutenvrij)', 'Tamari'] },
      { name: 'Tarwe-eiwit / tarwegluten', summary: 'In vleesvervangers en brood', risk: 'hoog', alternatives: ['Soja-eiwit', 'Erwteneiwit'] },
      {
        name: 'Gistextract',
        summary: 'Hartige smaakmaker',
        risk: 'middel',
        note: 'Kan van biergist komen en dan gerst bevatten.',
        alternatives: ['Gistextract met glutenvrij-logo', 'Zout en kruiden'],
      },
      { name: 'Biergist', summary: 'Supplement en smaakmaker', risk: 'middel', note: 'Restproduct van bier; kan gerst bevatten.', alternatives: ['Edelgistvlokken'] },
    ],
  },
  {
    id: 'additieven',
    label: 'Additieven',
    intro: 'E-nummers en hulpstoffen. In de EU moet tarwe als bron altijd op het etiket staan, dus de meeste zijn veilig.',
    entries: [
      {
        name: 'Gemodificeerd zetmeel (E1404–E1452)',
        summary: 'Bindmiddel',
        risk: 'laag',
        note: 'In de EU staat "(tarwe)" erbij als het van tarwe is. Buiten de EU: extra opletten.',
        alternatives: ['Maïszetmeel', 'Tapioca'],
      },
      { name: 'Dextrine (E1400)', summary: 'Verdikkingsmiddel', risk: 'laag', note: 'Van tarwe? Dan moet dat in de EU vermeld worden.', alternatives: ['Geen alternatief nodig'] },
      { name: 'Karamel (E150a–d)', summary: 'Kleurstof in cola, saus en drop', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Maltol (E636)', summary: 'Smaakversterker', risk: 'laag', note: 'Ondanks de naam niet van mout gemaakt.', alternatives: ['Geen alternatief nodig'] },
      { name: 'Maltitol (E965)', summary: 'Suikervervanger', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Xanthaangom (E415)', summary: 'Bindmiddel, ook in glutenvrij bakken', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Guarpitmeel (E412)', summary: 'Verdikkingsmiddel', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      {
        name: 'Aroma / natuurlijk aroma',
        summary: 'Smaakstoffen',
        risk: 'middel',
        note: 'Kan moutextract bevatten. In de EU moet een glutenbron vet of apart vermeld worden.',
        alternatives: ['Producten met glutenvrij-logo'],
      },
      {
        name: 'Zetmeel (zonder bron)',
        summary: 'Bindmiddel',
        risk: 'laag',
        note: 'In de EU meestal mais of aardappel; tarwe moet genoemd worden.',
        alternatives: ['Geen alternatief nodig'],
      },
    ],
  },
  {
    id: 'hulpstoffen',
    label: 'Verwerkingshulpstoffen',
    intro: 'Hulpmiddelen bij productie die niet altijd op het etiket staan, maar wel gluten kunnen achterlaten.',
    entries: [
      {
        name: 'Bloem als strooimiddel',
        summary: 'Tegen plakken van deeg en gedroogd fruit',
        risk: 'middel',
        note: 'Bakkers bestuiven bakplaten en deeg met bloem; soms ook dadels of rozijnen.',
        alternatives: ['Glutenvrije bakker', 'Verpakt fruit met glutenvrij-logo'],
      },
      {
        name: 'Gedeelde frituurolie',
        summary: 'Friet uit dezelfde olie als gepaneerde snacks',
        risk: 'hoog',
        alternatives: ['Aparte glutenvrije frituur', 'Friet thuis in schone olie'],
      },
      {
        name: 'Gedeelde productielijnen',
        summary: 'Oorzaak van "kan sporen bevatten"',
        risk: 'middel',
        note: 'Bij Strikte coeliakie geldt dit in de app als onveilig.',
        alternatives: ['Producten met glutenvrij-logo (max. 20 ppm)'],
      },
      {
        name: 'Enzymen in brood',
        summary: 'Bakhulpmiddel, soms van gerstemout',
        risk: 'middel',
        alternatives: ['Gecertificeerd glutenvrij brood'],
      },
      {
        name: 'Losmiddel op snoep',
        summary: 'Tarwezetmeel of bloem tegen plakken',
        risk: 'middel',
        note: 'Bijvoorbeeld op spekjes, drop en kauwgom.',
        alternatives: ['Snoep met glutenvrij-logo'],
      },
      {
        name: 'Gedeelde keukenspullen',
        summary: 'Broodrooster, botervloot, zeef, pastawater',
        risk: 'hoog',
        alternatives: ['Eigen broodrooster of toasterzakjes', 'Aparte botervloot en jampot'],
      },
    ],
  },
  {
    id: 'verborgen',
    label: 'Verborgen bronnen',
    intro: 'Producten waar je geen gluten verwacht, maar die er vaak wel in zitten.',
    entries: [
      { name: 'Sojasaus', summary: 'Gebrouwen met tarwe', risk: 'hoog', note: 'Ook in teriyaki-, hoisin- en oestersaus.', alternatives: ['Tamari', 'Coconut aminos'] },
      { name: 'Drop', summary: 'Nederlandse drop bevat tarwebloem', risk: 'hoog', alternatives: ['Glutenvrije drop'] },
      { name: 'Jus & kant-en-klare sauzen', summary: 'Vaak gebonden met bloem', risk: 'middel', alternatives: ['Saus gebonden met maïzena', 'Glutenvrije sausbinder'] },
      { name: 'Bouillonblokjes', summary: 'Soms met tarwe of gistextract', risk: 'middel', alternatives: ['Glutenvrije bouillon'] },
      { name: 'Vleeswaren & worst', summary: 'Paneermeel of beschuit als bindmiddel', risk: 'middel', note: 'Denk aan rookworst, gehaktballen en hamburgers.', alternatives: ['Puur vlees', 'Vleeswaren met glutenvrij-logo'] },
      { name: 'Surimi / imitatiekrab', summary: 'Vaak met tarwezetmeel', risk: 'middel', alternatives: ['Echte krab of garnalen'] },
      { name: 'Chips met smaak', summary: 'Smaakpoeder met tarwe of moutazijn', risk: 'middel', alternatives: ['Naturel chips'] },
      { name: 'Borrelnoten', summary: 'Jasje van tarwebloem', risk: 'hoog', alternatives: ['Naturel of gezouten noten'] },
      { name: 'IJs met koek', summary: 'Cookie dough, brownie, hoorntje', risk: 'middel', alternatives: ['Sorbet', 'IJs in een bakje'] },
      { name: 'Hosties', summary: 'Gemaakt van tarwebloem', risk: 'hoog', alternatives: ['Glutenvrije hosties (vraag de parochie)'] },
      { name: 'Medicijnen & supplementen', summary: 'Zetmeel als vulstof', risk: 'middel', note: 'Vraag bij twijfel je apotheker.', alternatives: ['Navragen bij de apotheek'] },
      { name: 'Speelklei', summary: 'Kinderklei op basis van bloem', risk: 'hoog', note: 'Risico via handen en mond.', alternatives: ['Glutenvrije speelklei'] },
    ],
  },
]

export const INGREDIENT_COUNT = INGREDIENT_TABS.reduce((n, t) => n + t.entries.length, 0)
