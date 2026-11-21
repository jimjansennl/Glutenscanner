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
  /** Slimme tip waar je zelf niet zo snel aan denkt. */
  tip?: string
  alternatives: string[]
}

export interface IngredientTab {
  id: string
  label: string
  intro: string
  entries: IngredientEntry[]
}

export const INGREDIENT_TABS: IngredientTab[] = [
  {
    id: 'tarwe',
    label: 'Tarwe',
    intro: 'Hier zitten de meeste gluten in. Ook oude soorten tarwe en dingen met een andere naam, zoals couscous.',
    entries: [
      { name: 'Tarwe', summary: 'Het graan met de meeste gluten', risk: 'hoog', alternatives: ['Rijstmeel', 'Boekweitmeel', 'Maïsmeel'] },
      {
        name: 'Tarwebloem / tarwemeel',
        summary: 'Het meel voor brood, koek en taart',
        risk: 'hoog',
        note: 'Staat op etiketten vaak gewoon als "bloem" of "meel".',
        alternatives: ['Glutenvrije bloemmix', 'Rijstmeel', 'Amandelmeel'],
      },
      { name: 'Volkoren tarwe', summary: 'In volkorenbrood, crackers en pasta', risk: 'hoog', alternatives: ['Teffmeel', 'Boekweitmeel', 'Volkoren rijstmeel'] },
      {
        name: 'Tarwezetmeel',
        summary: 'Maakt saus, snoep en vleeswaren dik of stevig',
        risk: 'hoog',
        note: 'Uitzondering: "glutenvrij tarwezetmeel" is speciaal gezuiverd en wettelijk glutenvrij.',
        alternatives: ['Maïszetmeel (maïzena)', 'Aardappelzetmeel', 'Tapiocazetmeel'],
      },
      { name: 'Tarwekiemen', summary: 'In ontbijtgranen en smoothies', risk: 'hoog', alternatives: ['Chiazaad', 'Lijnzaad', 'Hennepzaad'] },
      { name: 'Tarwezemelen', summary: 'Vezels in brood en muesli', risk: 'hoog', alternatives: ['Rijstzemelen', 'Psylliumvezels', 'Lijnzaad'] },
      { name: 'Griesmeel', summary: 'Grof gemalen tarwe, voor pap en pasta', risk: 'hoog', alternatives: ['Maïsgries (polenta)', 'Rijstgries'] },
      { name: 'Durumtarwe', summary: 'Harde tarwe voor gewone pasta', risk: 'hoog', alternatives: ['Pasta van mais, rijst of peulvruchten'] },
      {
        name: 'Spelt',
        summary: 'Een oude soort tarwe',
        risk: 'hoog',
        note: 'Wordt soms als "gezonder" verkocht, maar bevat net zoveel gluten.',
        alternatives: ['Boekweit', 'Quinoa', 'Gierst'],
      },
      { name: 'Kamut (khorasan)', summary: 'Een oude soort tarwe, ook khorasan genoemd', risk: 'hoog', alternatives: ['Quinoa', 'Amarant'] },
      { name: 'Eenkoorn', summary: 'Een oude soort tarwe, in speciaal brood', risk: 'hoog', alternatives: ['Gierst', 'Sorghum'] },
      { name: 'Emmer', summary: 'Een oude soort tarwe, ook als farro verkocht', risk: 'hoog', alternatives: ['Sorghum', 'Teff'] },
      { name: 'Farro', summary: 'Italiaanse naam voor emmer of spelt', risk: 'hoog', alternatives: ['Bruine rijst', 'Wilde rijst'] },
      { name: 'Bulgur', summary: 'Voorgekookte, gebroken tarwe', risk: 'hoog', alternatives: ['Quinoa', 'Boekweit'] },
      { name: 'Couscous', summary: 'Kleine korrels gemaakt van tarwe', risk: 'hoog', alternatives: ['Quinoa', 'Gierst', 'Glutenvrije maïscouscous'] },
      { name: 'Freekeh', summary: 'Jonge, geroosterde tarwe', risk: 'hoog', alternatives: ['Wilde rijst', 'Boekweit'] },
      { name: 'Seitan', summary: 'Vleesvervanger van puur tarwegluten', risk: 'hoog', alternatives: ['Tofu', 'Tempeh', 'Peulvruchten'] },
      { name: 'Orzo', summary: 'Pasta in de vorm van rijstkorrels', risk: 'hoog', note: 'Gemaakt van tarwe. In Italië betekent "orzo" ook gerst.', tip: 'Orzo lijkt op rijst, maar het is pasta. Let op in soep en salades.', alternatives: ['Rijst'] },
      {
        name: 'Mie, ramen & udon',
        summary: 'Noedels van tarwe',
        risk: 'hoog',
        note: 'Ook soba is vaak gemengd met tarwe, al lijkt het boekweit.',
        alternatives: ['Rijstnoedels', 'Glasnoedels', 'Soba van 100% boekweit'],
      },
      { name: 'Gnocchi', summary: 'Balletjes van aardappel én tarwebloem', risk: 'hoog', tip: 'Gnocchi lijkt van aardappel, maar er zit bijna altijd tarwebloem in.', alternatives: ['Gebakken aardappeltjes'] },
      { name: 'Matze', summary: 'Plat, knapperig brood van tarwe', risk: 'hoog', note: 'Ook in matzemeel en matzeballetjes in soep.', tip: 'Ook matzemeel en matzeballetjes in soep zijn van tarwe.', alternatives: ['Rijstwafels'] },
      { name: 'Triticale', summary: 'Kruising van tarwe en rogge', risk: 'hoog', alternatives: ['Teff', 'Amarant'] },
      { name: 'Paneermeel / panko', summary: 'Gedroogd, gemalen tarwebrood', risk: 'hoog', tip: 'Handig trucje: vermaal glutenvrije cornflakes. Dat wordt lekker krokant.', alternatives: ['Gemalen maïsvlokken', 'Amandelmeel'] },
    ],
  },
  {
    id: 'gerst',
    label: 'Gerst',
    intro: 'Gerst zit vaak verstopt als mout: in chocolade, cornflakes, bier en snoep.',
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
      {
        name: 'Moutaroma',
        summary: 'Smaakje van gerst',
        risk: 'hoog',
        note: 'Staat soms als "aroma (gerst)" of "malt flavouring". Zit vaak in cornflakes, chocolade en koekjes.',
        tip: 'Gewone cornflakes zijn van maïs, maar er zit moutaroma in.',
        alternatives: ['Cornflakes met "glutenvrij" erop', 'Chocolade zonder mout'],
      },
      { name: 'Moutsiroop', summary: 'Stroop van gerstemout', risk: 'hoog', alternatives: ['Ahornsiroop', 'Agavesiroop'] },
      { name: 'Gerstemeel', summary: 'Gemalen gerst', risk: 'hoog', note: 'Soms door brood en koek gemengd.', alternatives: ['Rijstmeel', 'Boekweitmeel'] },
      {
        name: 'Gemout meel',
        summary: 'Meel van gekiemde gerst',
        risk: 'hoog',
        note: 'Bakkers doen het in brood voor een bruin kleurtje en een zoete smaak.',
        tip: 'Zit vaak in donker en "meergranen" brood, voor de kleur en de smaak.',
        alternatives: [],
      },
      {
        name: 'Moutazijn',
        summary: 'Azijn gemaakt van gerst',
        risk: 'hoog',
        note: 'Er blijft maar weinig gluten in, maar het is niet glutenvrij. Bij coeliakie liever niet. Vraag je diëtist of een klein beetje mag.',
        tip: 'Zit vaak in augurken, zilveruitjes, piccalilly en chips met azijnsmaak. Gewone natuurazijn is wel glutenvrij.',
        alternatives: [],
      },
      { name: 'Bier & maltdranken', summary: 'Gebrouwen van gerstemout', risk: 'hoog', note: 'Ook alcoholvrij bier bevat gluten.', tip: 'Alleen bier met het glutenvrij-logo is goed.', alternatives: [] },
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
    intro: 'Rogge heeft ook gluten. Vooral in donker brood en ontbijtkoek.',
    entries: [
      { name: 'Rogge', summary: 'Graan met gluten (secaline)', risk: 'hoog', alternatives: ['Boekweit', 'Teff'] },
      { name: 'Roggemeel', summary: 'Basis van ontbijtkoek en roggebrood', risk: 'hoog', alternatives: ['Boekweitmeel', 'Teffmeel'] },
      { name: 'Roggebrood', summary: 'Compact, donker brood', risk: 'hoog', alternatives: ['Glutenvrij donker brood', 'Glutenvrij zadenbrood'] },
      { name: 'Ontbijtkoek & peperkoek', summary: 'Kruidige koek met roggemeel', risk: 'hoog', tip: 'Ontbijtkoek is vaak van rogge. Dat is net zo goed gluten.', alternatives: [] },
      { name: 'Pumpernickel', summary: 'Duits roggebrood', risk: 'hoog', alternatives: ['Glutenvrij zadenbrood'] },
      { name: 'Knäckebröd', summary: 'Knapperig roggebrood uit Scandinavië', risk: 'hoog', alternatives: ['Rijstcrackers', 'Maïswafels'] },
      { name: 'Roggevlokken', summary: 'In muesli en granola', risk: 'hoog', alternatives: ['Quinoavlokken', 'Boekweitvlokken'] },
    ],
  },
  {
    id: 'haver',
    label: 'Haver',
    intro:
      'Gewone haver zit bijna altijd vol tarwe-kruimels. Haver met "glutenvrij" erop mag vaak wel, maar niet iedereen kan er goed tegen.',
    entries: [
      { name: 'Haver', summary: 'Graan, bijna altijd besmet met tarwe', risk: 'hoog', alternatives: ['Haver met "glutenvrij" erop', 'Quinoa'] },
      { name: 'Havermout / havervlokken', summary: 'Ontbijtpap en bakken', risk: 'hoog', alternatives: ['Glutenvrije havervlokken', 'Quinoavlokken', 'Boekweitvlokken'] },
      { name: 'Havermelk', summary: 'Plantaardige melk', risk: 'hoog', note: 'Alleen veilig als er "glutenvrij" op staat.', tip: 'In een café is het bijna altijd gewone havermelk. Vraag om een andere melk.', alternatives: ['Rijstmelk', 'Amandelmelk', 'Glutenvrije havermelk'] },
      { name: 'Havermeel', summary: 'Meel van gemalen haver', risk: 'hoog', alternatives: ['Glutenvrij havermeel', 'Rijstmeel'] },
      { name: 'Haverzemelen', summary: 'Vezels in ontbijt en brood', risk: 'hoog', alternatives: ['Rijstzemelen', 'Psylliumvezels'] },
      { name: 'Muesli & granola', summary: 'Mix van vlokken, vaak met haver en mout', risk: 'hoog', alternatives: ['Glutenvrije granola', 'Zelfgemaakt met boekweit en noten'] },
      {
        name: 'Haver met "glutenvrij" erop',
        summary: 'Apart geteeld en verwerkt',
        risk: 'middel',
        note: 'Een deel van de mensen met coeliakie reageert ook op pure haver. Overleg met je arts of diëtist.',
        alternatives: ['Quinoavlokken', 'Rijstvlokken'],
      },
    ],
  },
  {
    id: 'derivaten',
    label: 'Gemaakt van graan',
    intro: 'Dingen die van graan gemaakt zijn. Soms zijn ze zo schoongemaakt dat er geen gluten meer in zitten, soms niet.',
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
        alternatives: [],
      },
      {
        name: 'Gedistilleerde drank uit graan',
        summary: 'Wodka, whisky, jenever',
        risk: 'laag',
        note: 'Destillatie verwijdert gluten. Let wel op toegevoegde smaakstoffen.',
        tip: 'Let op likeuren en mixdrankjes: daar kan na het stoken iets bij gedaan zijn.',
        alternatives: [],
      },
      { name: 'Gehydrolyseerd tarwe-eiwit', summary: 'Smaakversterker in soep en saus', risk: 'hoog', alternatives: ['Gistextract (glutenvrij)', 'Tamari'] },
      {
        name: 'Tarwe-eiwit / tarwegluten',
        summary: 'In vleesvervangers en brood',
        risk: 'hoog',
        note: 'Heet ook "vitaal tarwegluten". Het is bijna pure gluten.',
        alternatives: ['Soja-eiwit', 'Erwteneiwit'],
      },
      {
        name: 'Tarwepeptiden',
        summary: 'Kleine stukjes tarwe-eiwit',
        risk: 'hoog',
        note: 'In sportdrankjes, eiwitpoeder en soms in shampoo of crème.',
        alternatives: ['Erwteneiwit', 'Rijsteiwit'],
      },
      {
        name: 'Gistextract',
        summary: 'Hartige smaakmaker',
        risk: 'middel',
        note: 'Kan van biergist komen en dan gerst bevatten.',
        tip: 'Staat er "biergist" of "gerst" bij, dan zit er gluten in.',
        alternatives: ['Zout en kruiden'],
      },
      { name: 'Biergist', summary: 'Supplement en smaakmaker', risk: 'middel', note: 'Restproduct van bier; kan gerst bevatten.', alternatives: ['Edelgistvlokken'] },
    ],
  },
  {
    id: 'additieven',
    label: 'E-nummers',
    intro: 'Stofjes met een E-nummer. Komt er een van tarwe, dan moet dat op het etiket staan. De meeste mogen gewoon.',
    entries: [
      {
        name: 'Gemodificeerd zetmeel (E1404–E1452)',
        summary: 'Maakt saus en toetjes dik',
        risk: 'laag',
        note: 'In de EU staat "(tarwe)" erbij als het van tarwe is. Buiten de EU: extra opletten.',
        tip: 'Is het van tarwe, dan moet "tarwe" erbij staan.',
        alternatives: [],
      },
      { name: 'Dextrine (E1400)', summary: 'Maakt dingen dikker of plakkeriger', risk: 'laag', note: 'Van tarwe? Dan moet dat in de EU vermeld worden.', alternatives: ['Geen alternatief nodig'] },
      {
        name: 'Tarwedextrine',
        summary: 'Vezels van tarwe, in vezelpoeder en drankjes',
        risk: 'middel',
        note: 'Vaak zo gezuiverd dat er bijna geen gluten in zit. Kies een product met "glutenvrij" erop.',
        tip: 'Zit vaak in vezelpoeder om door je drinken te roeren.',
        alternatives: ['Psylliumvezels', 'Inuline'],
      },
      { name: 'Karamel (E150a–d)', summary: 'Kleurstof in cola, saus en drop', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Maltol (E636)', summary: 'Maakt de smaak sterker', risk: 'laag', note: 'Ondanks de naam niet van mout gemaakt.', alternatives: ['Geen alternatief nodig'] },
      { name: 'Maltitol (E965)', summary: 'Suikervervanger', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Xanthaangom (E415)', summary: 'Maakt deeg en saus dik, ook bij glutenvrij bakken', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      { name: 'Guarpitmeel (E412)', summary: 'Maakt ijs en saus dik', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
      {
        name: 'Aroma / natuurlijk aroma',
        summary: 'Smaakstoffen',
        risk: 'middel',
        note: 'Kan moutextract bevatten. In de EU moet een glutenbron vet of apart vermeld worden.',
        tip: 'Gluten in een aroma moet op het etiket staan. Staat er alleen "aroma", dan is het meestal goed.',
        alternatives: [],
      },
      {
        name: 'Zetmeel (zonder bron)',
        summary: 'Maakt saus en soep dik',
        risk: 'laag',
        note: 'In de EU meestal mais of aardappel; tarwe moet genoemd worden.',
        alternatives: ['Geen alternatief nodig'],
      },
    ],
  },
  {
    id: 'hulpstoffen',
    label: 'Via fabriek of keuken',
    intro: 'Gluten die erin komen door hoe iets gemaakt wordt, zoals bloem op de lopende band of gedeeld frituurvet.',
    entries: [
      {
        name: 'Bloem als strooimiddel',
        summary: 'Tegen plakken van deeg en gedroogd fruit',
        risk: 'middel',
        note: 'Bakkers bestuiven bakplaten en deeg met bloem; soms ook dadels of rozijnen.',
        tip: 'Losse dadels en vijgen zijn soms door bloem gerold, zodat ze niet plakken.',
        alternatives: [],
      },
      {
        name: 'Gedeelde frituurolie',
        summary: 'Friet uit dezelfde olie als gepaneerde snacks',
        risk: 'hoog',
        alternatives: ['Friet uit een aparte frituurpan', 'Friet thuis in schone olie'],
      },
      {
        name: 'Gedeelde productielijnen',
        summary: 'Oorzaak van "kan sporen bevatten"',
        risk: 'middel',
        note: 'Bij Strikte coeliakie geldt dit in de app als onveilig.',
        tip: '"Kan sporen bevatten" hoeft er niet op. Staat het er niet, dan is het dus nog niet zeker. Het logo met de doorgestreepte graanaar wordt wel gecontroleerd.',
        alternatives: [],
      },
      {
        name: 'Enzymen in brood',
        summary: 'Bakhulpmiddel, soms van gerstemout',
        risk: 'middel',
        alternatives: [],
      },
      {
        name: 'Losmiddel op snoep',
        summary: 'Tarwezetmeel of bloem tegen plakken',
        risk: 'middel',
        note: 'Bijvoorbeeld op spekjes, drop en kauwgom.',
        tip: 'Snoep uit losse bakken heeft geen etiket. Laat dat liever staan.',
        alternatives: [],
      },
      {
        name: 'Gedeelde keukenspullen',
        summary: 'Broodrooster, botervloot, zeef, pastawater',
        risk: 'hoog',
        alternatives: ['Een eigen broodrooster of toasterzakjes', 'Een eigen botervloot en jampot'],
      },
    ],
  },
  {
    id: 'verborgen',
    label: 'Zit er stiekem in',
    intro: 'Dingen waar je geen gluten verwacht, maar die er vaak wel in zitten.',
    entries: [
      { name: 'Sojasaus', summary: 'Gebrouwen met tarwe', risk: 'hoog', note: 'Ook in teriyaki-, hoisin- en oestersaus.', tip: 'Ga je sushi eten? Neem een eigen flesje tamari mee. Ook in wokgerechten en marinades zit gewone sojasaus.', alternatives: ['Tamari met "glutenvrij" erop', 'Kokosaminos (saus van kokos)'] },
      { name: 'Teriyakisaus', summary: 'Zoete saus met sojasaus', risk: 'hoog', note: 'Ook in kip teriyaki en sushi-sausjes.', alternatives: ['Zelf maken met tamari, honing en gember'] },
      {
        name: 'Miso',
        summary: 'Japanse pasta van soja, voor soep',
        risk: 'middel',
        note: 'Soms met gerst gemaakt (mugi miso). Rijst- of sojamiso is meestal glutenvrij.',
        tip: 'Witte rijstmiso is meestal zonder gerst. "Mugi miso" is van gerst.',
        alternatives: [],
      },
      { name: 'Drop', summary: 'Nederlandse drop bevat tarwebloem', risk: 'hoog', tip: 'Let ook op dropijsjes, Engelse drop en snoepmixen met drop erin.', alternatives: ['Winegums (kijk op de zak)'] },
      { name: 'Jus & kant-en-klare sauzen', summary: 'Vaak gebonden met bloem', risk: 'middel', alternatives: ['Saus gebonden met maïzena', 'Glutenvrije sausbinder'] },
      { name: 'Bouillonblokjes', summary: 'Soms met tarwe of gistextract', risk: 'middel', tip: 'Elke smaak is anders: kip kan glutenvrij zijn en rund van hetzelfde merk niet.', alternatives: ['Zelf getrokken bouillon'] },
      {
        name: 'Soep uit pakje of blik',
        summary: 'Vaak dik gemaakt met tarwebloem',
        risk: 'middel',
        note: 'Ook soepballetjes en vermicelli in de soep bevatten vaak tarwe.',
        tip: 'Soepballetjes en vermicelli in soep bevatten ook gluten.',
        alternatives: ['Zelf soep maken met maïzena'],
      },
      {
        name: 'Saladedressing',
        summary: 'Soms met sojasaus, moutazijn of bloem',
        risk: 'middel',
        note: 'Vooral romige dressings en Caesar-dressing.',
        tip: 'Let op moutazijn en sojasaus in de dressing.',
        alternatives: ['Olijfolie met citroen of wijnazijn'],
      },
      {
        name: 'Plantaardig eiwit',
        summary: 'Eiwit uit planten, in vleesvervangers en snacks',
        risk: 'middel',
        note: 'Staat er "(tarwe)" achter? Dan zit er gluten in. Soja- en erwteneiwit zijn glutenvrij.',
        alternatives: ['Soja-eiwit', 'Erwteneiwit'],
      },
      { name: 'Vleeswaren & worst', summary: 'Paneermeel of beschuit als bindmiddel', risk: 'middel', note: 'Denk aan rookworst, gehaktballen en hamburgers.', tip: 'Bij de slager kan de snijmachine ook paneervlees of broodbeleg met gluten hebben gesneden.', alternatives: ['Puur vlees'] },
      { name: 'Surimi / imitatiekrab', summary: 'Vaak met tarwezetmeel', risk: 'middel', alternatives: ['Echte krab of garnalen'] },
      { name: 'Chips met smaak', summary: 'Smaakpoeder met tarwe of moutazijn', risk: 'middel', alternatives: ['Naturel chips'] },
      { name: 'Borrelnoten', summary: 'Jasje van tarwebloem', risk: 'hoog', alternatives: ['Naturel of gezouten noten'] },
      { name: 'IJs met koek', summary: 'Cookie dough, brownie, hoorntje', risk: 'middel', alternatives: ['Sorbet', 'IJs in een bakje'] },
      { name: 'Hosties', summary: 'Gemaakt van tarwebloem', risk: 'hoog', tip: 'Veel kerken hebben glutenvrije hosties. Vraag het van tevoren, dan liggen ze klaar.', alternatives: [] },
      {
        name: 'Medicijnen & supplementen',
        summary: 'Soms tarwezetmeel als vulmiddel',
        risk: 'middel',
        note: 'Het staat in de bijsluiter bij "hulpstoffen".',
        tip: 'Laat de apotheek "coeliakie" in je dossier zetten. Dan let de apotheek er bij elk nieuw medicijn vanzelf op.',
        alternatives: [],
      },
      { name: 'Speelklei', summary: 'Kinderklei op basis van bloem', risk: 'hoog', note: 'Risico via handen en mond.', tip: 'Zelf maken kan: maïzena, zout, water en een beetje olie.', alternatives: [] },
    ],
  },
]

/** Wat je wél mag: van nature glutenvrij. Voor de groene "Mag"-lijst en de zoekfunctie. */
export const NATURALLY_GLUTEN_FREE: IngredientEntry[] = [
  { name: 'Rijst', summary: 'Wit, bruin, zilvervlies: allemaal glutenvrij', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Maïs', summary: 'Ook polenta, maïzena en popcorn', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Aardappel', summary: 'Gekookt, gebakken of als puree', risk: 'laag', note: 'Let op bij patat uit de snackbar: daar is het frituurvet vaak gedeeld.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Boekweit', summary: 'Ondanks de naam geen tarwe', risk: 'laag', note: 'Puur boekweitmeel is glutenvrij. Boekweitmix voor pannenkoeken heeft vaak óók tarwebloem.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Quinoa', summary: 'Zaadje dat je kookt als rijst', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Gierst', summary: 'Klein graan, glutenvrij', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Teff', summary: 'Klein graan uit Ethiopië, glutenvrij', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Amarant', summary: 'Zaadje, glutenvrij', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Tapioca', summary: 'Zetmeel uit cassave', risk: 'laag', alternatives: ['Geen alternatief nodig'] },
  { name: 'Bonen, linzen & kikkererwten', summary: 'Ook hummus en falafel van puur kikkererwt', risk: 'laag', note: 'Falafel uit een snackbar kan bloem bevatten.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Groente & fruit', summary: 'Vers, uit de diepvries of uit blik', risk: 'laag', note: 'Let op groente in een saus of met een krokant laagje.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Noten & zaden', summary: 'Naturel: glutenvrij', risk: 'laag', note: 'Borrelnoten met een jasje hebben vaak tarwebloem.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Vlees, vis & ei', summary: 'Vers en onbewerkt: glutenvrij', risk: 'laag', note: 'Let op gepaneerd vlees, worst, gehakt met paneermeel en marinades.', alternatives: ['Geen alternatief nodig'] },
  { name: 'Melk, kaas & yoghurt', summary: 'Naturel: glutenvrij', risk: 'laag', note: 'Let op toetjes en yoghurt met koek, granola of muesli.', alternatives: ['Geen alternatief nodig'] },
]

export const INGREDIENT_COUNT = INGREDIENT_TABS.reduce((n, t) => n + t.entries.length, 0)
