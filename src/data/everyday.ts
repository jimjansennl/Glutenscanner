import type { IngredientEntry } from './ingredientGuide'

/**
 * Dagelijkse dingen en drinken die mensen opzoeken ("thee", "cola", "ketchup").
 * Alleen in zoeken en de kleurlijsten, niet bij "Per soort".
 * Geen alcohol als advies: wijn en cider staan erin omdat volwassenen het opzoeken,
 * maar nooit bij "Neem liever".
 */

export const DRINKS: IngredientEntry[] = [
  { name: 'Thee', summary: 'Gewone thee en kruidenthee zijn glutenvrij', risk: 'laag', tip: 'Let op thee met stukjes koek of "chai latte" uit een poeder: daar zit soms mout in.', alternatives: [] },
  { name: 'Koffie', summary: 'Koffie zelf is glutenvrij', risk: 'laag', tip: 'Let op gerstekoffie en koffievervangers: die zijn van gerst. Ook het koekje bij de koffie natuurlijk.', alternatives: [] },
  { name: 'Melk', summary: 'Koemelk, chocomel en karnemelk zijn glutenvrij', risk: 'laag', tip: 'Havermelk is een uitzondering: die is van haver, tenzij er "glutenvrij" op staat.', alternatives: [] },
  { name: 'Chocolademelk', summary: 'Meestal glutenvrij', risk: 'middel', note: 'Poeders met mout, zoals sommige ontbijtdranken, bevatten gerst.', tip: 'Staat er "mout" of "malt" in het poeder? Dan is het van gerst.', alternatives: [] },
  { name: 'Sap & smoothie', summary: 'Vruchtensap en smoothies zijn glutenvrij', risk: 'laag', tip: 'Een smoothie met havervlokken erin is dat níet. Vraag het bij een smoothiebar.', alternatives: [] },
  { name: 'Limonade & siroop', summary: 'Ranja en siroop zijn glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Frisdrank & cola', summary: 'Cola, sinas en ijsthee zijn glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Water', summary: 'Ook bruiswater en water met een smaakje', risk: 'laag', alternatives: [] },
  { name: 'Sportdrank & energiedrank', summary: 'Meestal glutenvrij', risk: 'laag', tip: 'Eiwitshakes en hersteldrankjes kunnen tarwe-eiwit of haver bevatten. Kijk daar wel op.', alternatives: [] },
  { name: 'Wijn', summary: 'Wijn is glutenvrij', risk: 'laag', note: 'Alleen voor volwassenen.', alternatives: [] },
  { name: 'Cider', summary: 'Gemaakt van appels, meestal glutenvrij', risk: 'laag', note: 'Alleen voor volwassenen. Let op "cider" met gerstemout erin.', alternatives: [] },
]

export const EVERYDAY: IngredientEntry[] = [
  { name: 'Ketchup & mayonaise', summary: 'Meestal glutenvrij', risk: 'laag', tip: 'Frietsaus en mayonaise zijn bijna altijd goed. Let op sauzen met "moutazijn".', alternatives: [] },
  { name: 'Mosterd', summary: 'Meestal glutenvrij', risk: 'middel', note: 'Grove mosterd en Engelse mosterd hebben soms tarwebloem.', alternatives: [] },
  { name: 'Hummus', summary: 'Van kikkererwten, glutenvrij', risk: 'laag', tip: 'Let op wat je erbij dipt: pitabroodje en soepstengels zijn van tarwe.', alternatives: ['Komkommer en wortel om te dippen'] },
  { name: 'Popcorn', summary: 'Van maïs, glutenvrij', risk: 'laag', tip: 'Popcorn met karamel of een smaakje: kijk even op de zak.', alternatives: [] },
  { name: 'Chocolade', summary: 'Gewone melk- en pure chocolade is meestal glutenvrij', risk: 'middel', note: 'Let op chocolade met koek, wafel, crispy of mout.', tip: 'Repen met "crispy" of "knapperig" hebben vaak gerstemout of tarwe.', alternatives: [] },
  { name: 'Snoep', summary: 'Veel snoep is glutenvrij, maar niet alles', risk: 'middel', note: 'Drop, Engelse drop en snoep met een laagje bloem bevatten gluten.', tip: 'Winegums en zure matjes zijn vaak goed. Drop bijna nooit.', alternatives: [] },
  { name: 'Kauwgom & pepermunt', summary: 'Meestal glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Jam & honing', summary: 'Glutenvrij', risk: 'laag', tip: 'Gebruik een schoon mes. Met een mes vol broodkruimels in de pot komt er toch gluten in.', alternatives: [] },
  { name: 'Boter & olie', summary: 'Glutenvrij', risk: 'laag', tip: 'Een eigen botervloot voorkomt kruimels van gewoon brood.', alternatives: [] },
  { name: 'Suiker & zout', summary: 'Glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Eieren', summary: 'Glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Kaas', summary: 'Gewone kaas is glutenvrij', risk: 'laag', tip: 'Let op kaas in een korstje of geraspte kaas met een poeder ertegen het plakken.', alternatives: [] },
  { name: 'Yoghurt & vla', summary: 'Meestal glutenvrij', risk: 'laag', tip: 'Let op yoghurt met muesli, koekjes of stroopwafel erin.', alternatives: [] },
  { name: 'Sushi', summary: 'Rijst en vis zijn goed, de saus vaak niet', risk: 'middel', note: 'Sojasaus, tempura en surimi bevatten vaak tarwe.', tip: 'Neem een eigen flesje tamari mee.', alternatives: ['Sashimi met tamari'] },
  { name: 'Tortillachips & nacho’s', summary: 'Van maïs, vaak glutenvrij', risk: 'middel', note: 'Sommige merken mengen tarwebloem erdoor of gebruiken een kruidenmix met tarwe.', alternatives: [] },
  { name: 'Appelmoes', summary: 'Glutenvrij', risk: 'laag', alternatives: [] },
  { name: 'Fruit', summary: 'Vers fruit is glutenvrij', risk: 'laag', tip: 'Gedroogde dadels en vijgen zijn soms door bloem gerold. Kijk op de zak.', alternatives: [] },
  { name: 'Groente', summary: 'Verse groente is glutenvrij', risk: 'laag', tip: 'Let op groente uit de diepvries met een sausje of paneerlaag.', alternatives: [] },
  { name: 'Vlees & kip', summary: 'Puur vlees is glutenvrij', risk: 'laag', tip: 'Gemarineerd of gepaneerd vlees vaak niet. Ook kipnuggets en schnitzels hebben een paneerlaag.', alternatives: [] },
  { name: 'Vis', summary: 'Verse vis is glutenvrij', risk: 'laag', tip: 'Kibbeling, vissticks en lekkerbekjes hebben beslag van tarwe.', alternatives: [] },
  { name: 'Cake, muffins & donuts', summary: 'Gemaakt met tarwebloem', risk: 'hoog', tip: 'Een cakemix met "glutenvrij" erop is net zo lekker. Bak hem in een schone vorm.', alternatives: ['Glutenvrije cakemix'] },
  { name: 'Taart & gebak', summary: 'Bodem en biscuit zijn van tarwebloem', risk: 'hoog', tip: 'Bij een verjaardag: vraag of er een stuk zonder bodem kan, zoals de vulling van een cheesecake. Of neem een eigen gebakje mee.', alternatives: ['Glutenvrij gebak van de bakker'] },
  { name: 'Croissant & broodjes', summary: 'Van tarwebloem', risk: 'hoog', alternatives: ['Glutenvrije croissants uit de diepvries'] },
]
