/**
 * Inhoud van de Glutengids. Algemene voorlichting, geen medisch advies: recepten
 * en productsamenstellingen verschillen per merk en land.
 */

export type RiskLevel = 'hoog' | 'middel' | 'laag'

export interface GuideItem {
  name: string
  risk: RiskLevel
  /** Waar de gluten schuilen. */
  where: string
  /** Waarop letten. */
  checklist: string[]
  /** Glutenvrije alternatieven. */
  alternatives: string[]
}

export interface GuideCategory {
  id: string
  title: string
  subtitle: string
  icon: 'gift' | 'candy' | 'soup' | 'croissant' | 'wheat' | 'search' | 'cart' | 'tree' | 'school' | 'label'
  items: GuideItem[]
}

export const GUIDE: GuideCategory[] = [
  {
    id: 'supermarkt',
    title: 'Supermarkt',
    subtitle: 'Gewone dingen die je elke week koopt',
    icon: 'cart',
    items: [
      {
        name: 'Pasta',
        risk: 'hoog',
        where: 'Gewone pasta is gemaakt van durumtarwe. Ook verse pasta, lasagnebladen en mie.',
        checklist: ['Kies pasta met "glutenvrij" op de verpakking', 'Kook glutenvrije pasta in een eigen pan met schoon water'],
        alternatives: ['Glutenvrije pasta van rijst of maïs', 'Rijstnoedels', 'Pasta van linzen of kikkererwten'],
      },
      {
        name: 'Brood & beschuit',
        risk: 'hoog',
        where: 'Brood, beschuit, krentenbollen en croissants zijn van tarwe of rogge.',
        checklist: ['Gebruik een eigen broodrooster of rooster-zakjes', 'Eigen boter en pot, zonder kruimels'],
        alternatives: ['Glutenvrij brood', 'Glutenvrije beschuit', 'Rijstwafels of maïswafels'],
      },
      {
        name: 'Ontbijtgranen & cornflakes',
        risk: 'middel',
        where: 'Cornflakes zijn van maïs, maar er zit vaak moutextract (gerst) in. Muesli en granola bevatten haver of tarwe.',
        checklist: ['Zoek "mout" of "gerst" in de ingrediënten', 'Kies een doos met "glutenvrij" erop'],
        alternatives: ['Glutenvrije cornflakes', 'Glutenvrije muesli', 'Yoghurt met fruit en noten'],
      },
      {
        name: 'Koekjes & crackers',
        risk: 'hoog',
        where: 'Bijna alle koekjes, biscuits en crackers zijn van tarwebloem.',
        checklist: ['Alleen met "glutenvrij" op de verpakking', 'Ook "volkoren" en "spelt" bevatten gluten'],
        alternatives: ['Glutenvrije koekjes', 'Rijstwafels of maïswafels', 'Glutenvrije crackers'],
      },
      {
        name: 'Rijstwafels',
        risk: 'middel',
        where: 'Meestal alleen rijst en zout. Sommige soorten hebben spelt, gerst of een koeklaagje.',
        checklist: ['Lees de ingrediënten', 'Let op "kan sporen van gluten bevatten"'],
        alternatives: ['Rijstwafels met "glutenvrij" erop', 'Maïswafels'],
      },
      {
        name: 'Pannenkoeken & poffertjes',
        risk: 'hoog',
        where: 'Het beslag is van tarwebloem. Boekweitmix heeft vaak óók tarwebloem erbij.',
        checklist: ['Puur boekweitmeel is glutenvrij', 'Bak in een schone pan, niet na gewone pannenkoeken'],
        alternatives: ['Glutenvrije pannenkoekenmix', 'Pannenkoeken van puur boekweitmeel'],
      },
      {
        name: 'Pizza & wraps',
        risk: 'hoog',
        where: 'De bodem en de wraps zijn van tarwe.',
        checklist: ['Bij de pizzeria: vraag naar een glutenvrije bodem én een schone oven', 'Maïstortilla’s zijn soms met tarwe gemengd'],
        alternatives: ['Glutenvrije pizzabodem', 'Glutenvrije wraps', 'Tortilla’s van 100% maïs met "glutenvrij" erop'],
      },
      {
        name: 'Stroopwafels',
        risk: 'hoog',
        where: 'De wafels zijn van tarwebloem.',
        checklist: ['Alleen met "glutenvrij" op de verpakking'],
        alternatives: ['Glutenvrije stroopwafels'],
      },
      {
        name: 'Patat',
        risk: 'middel',
        where: 'Aardappel is glutenvrij. Maar in de snackbar gaat de patat vaak in hetzelfde vet als kroketten en frikandellen.',
        checklist: ['Vraag of de patat een eigen frituurpan heeft', 'Thuis: kijk of er geen bloemlaagje om de friet zit'],
        alternatives: ['Patat uit een eigen frituurpan', 'Ovenfriet met "glutenvrij" erop'],
      },
      {
        name: 'Kroket, frikandel & bitterbal',
        risk: 'hoog',
        where: 'De vulling is gebonden met bloem en de korst is paneermeel. In frikandellen zit vaak ook tarwe of paneermeel.',
        checklist: ['Gewone snacks uit de snackbar zijn niet glutenvrij', 'Glutenvrije snacks moeten in een eigen pan'],
        alternatives: ['Glutenvrije kroketten en frikandellen (diepvries)'],
      },
      {
        name: 'Hagelslag & pindakaas',
        risk: 'laag',
        where: 'Meestal glutenvrij. Soms staat er "kan sporen bevatten" op.',
        checklist: ['Kijk even op het etiket', 'Gebruik een schoon mes, zonder broodkruimels'],
        alternatives: ['Geen alternatief nodig'],
      },
    ],
  },
  {
    id: 'sinterklaas',
    title: 'Sinterklaas',
    subtitle: 'Pepernoten, letters en de zak van Sint',
    icon: 'gift',
    items: [
      {
        name: 'Pepernoten & kruidnoten',
        risk: 'hoog',
        where: 'Gemaakt van tarwebloem. Ook kruidnoten met chocolade.',
        checklist: ['Alleen met "glutenvrij" op de zak', 'Strooien in de klas? Neem een eigen zakje mee'],
        alternatives: ['Glutenvrije kruidnoten'],
      },
      {
        name: 'Speculaas',
        risk: 'hoog',
        where: 'Speculaas, speculaasbrokken en gevulde speculaas zijn van tarwebloem.',
        checklist: ['Ook in speculaaspasta en toetjes met speculaas'],
        alternatives: ['Glutenvrije speculaas'],
      },
      {
        name: 'Banketstaaf & banketletter',
        risk: 'hoog',
        where: 'Het bladerdeeg is van tarwebloem. De amandelspijs zelf is meestal wel glutenvrij.',
        checklist: ['Alleen gelabeld glutenvrij is veilig'],
        alternatives: ['Glutenvrije banketstaaf', 'Een stukje amandelspijs of marsepein'],
      },
      {
        name: 'Taaitaai',
        risk: 'hoog',
        where: 'Gemaakt van roggemeel en tarwebloem.',
        checklist: ['Ook taaitaai-poppen en -figuren'],
        alternatives: ['Glutenvrije kruidkoek'],
      },
      {
        name: 'Chocoladeletter',
        risk: 'middel',
        where: 'Gewone melk- of pure chocolade is meestal glutenvrij. Letters met koek, krokant of "crispy" vaak niet.',
        checklist: ['Lees de ingrediënten', 'Let op "kan sporen bevatten"'],
        alternatives: ['Een letter van gewone chocolade zonder vulling'],
      },
      {
        name: 'Marsepein & schuimpjes',
        risk: 'laag',
        where: 'Marsepein is van amandel en suiker, schuimpjes van eiwit en suiker. Meestal glutenvrij.',
        checklist: ['Kijk toch even op het etiket'],
        alternatives: ['Geen alternatief nodig'],
      },
    ],
  },
  {
    id: 'school',
    title: 'School & feestjes',
    subtitle: 'Traktaties, logeren en kamp',
    icon: 'school',
    items: [
      {
        name: 'Traktaties in de klas',
        risk: 'hoog',
        where: 'Veel traktaties zijn koekjes, cake, wafels of snoep met tarwe.',
        checklist: ['Geef de juf of meester een doosje met eigen traktaties', 'Vraag ouders vooraf wat ze trakteren'],
        alternatives: ['Eigen voorraad: glutenvrije koek, rozijntjes, fruit'],
      },
      {
        name: 'Kinderfeestje',
        risk: 'middel',
        where: 'Taart, pizza, pannenkoeken en chips met smaak kunnen gluten bevatten.',
        checklist: ['Vertel het vooraf aan de ouders', 'Neem een eigen taartje of snack mee'],
        alternatives: ['Patat uit een eigen pan, fruit, naturel chips'],
      },
      {
        name: 'Logeren',
        risk: 'middel',
        where: 'Bij het ontbijt en avondeten: brood, boter met kruimels, sauzen.',
        checklist: ['Neem eigen brood en beleg mee', 'Vraag om een schoon mes en eigen boter'],
        alternatives: ['Eigen glutenvrij brood en broodbeleg'],
      },
      {
        name: 'Schoolreis & kamp',
        risk: 'middel',
        where: 'Lunchpakketjes, patat en pannenkoeken op locatie.',
        checklist: ['Bel of mail de school ruim van tevoren', 'Geef een eigen lunchpakket en snacks mee'],
        alternatives: ['Eigen lunchpakket', 'Laat de kaart voor de bediening zien'],
      },
      {
        name: 'Kantine & sportclub',
        risk: 'hoog',
        where: 'Tosti’s, broodjes, kroketten. Patat gaat vaak in hetzelfde vet.',
        checklist: ['Vraag of er glutenvrije dingen zijn', 'Patat alleen uit een eigen frituurpan'],
        alternatives: ['Eigen snack in de sporttas', 'Fruit, rijstwafels, naturel chips'],
      },
    ],
  },
  {
    id: 'etiket',
    title: 'Etiket lezen',
    subtitle: 'Wat staat er op de verpakking?',
    icon: 'label',
    items: [
      {
        name: '"Glutenvrij" op de verpakking',
        risk: 'laag',
        where: 'Dit mag alleen als er bijna geen gluten in zitten (minder dan 20 mg per kilo). Dat is veilig bij coeliakie.',
        checklist: ['Dit is het beste teken dat je kunt vinden'],
        alternatives: ['Geen alternatief nodig'],
      },
      {
        name: 'Logo met doorgestreepte graanaar',
        risk: 'laag',
        where: 'Een graanaar met een streep erdoor in een rondje. Het product is gecontroleerd glutenvrij.',
        checklist: ['Staat vaak op de voorkant of achterkant'],
        alternatives: ['Geen alternatief nodig'],
      },
      {
        name: 'Vetgedrukte woorden in de ingrediënten',
        risk: 'hoog',
        where: 'Allergenen staan dik gedrukt. Staat er tarwe, gerst, rogge, spelt of haver vetgedrukt? Dan zit er gluten in.',
        checklist: ['Lees de hele lijst, ook de kleine letters', 'Uitzondering: "glutenvrij tarwezetmeel" mag wel'],
        alternatives: ['Zoek een variant met "glutenvrij" erop'],
      },
      {
        name: '"Kan sporen van gluten bevatten"',
        risk: 'middel',
        where: 'Er zit geen gluten in het recept, maar het is gemaakt in een fabriek waar ook gluten zijn. Er kan een klein beetje in komen.',
        checklist: ['Strikte coeliakie? Liever niet eten', 'In Instellingen kies je of dit oranje of rood wordt'],
        alternatives: ['Een variant met "glutenvrij" erop'],
      },
      {
        name: 'Glucosestroop, dextrose & maltodextrine',
        risk: 'laag',
        where: 'Kan van tarwe gemaakt zijn, maar is zo gezuiverd dat het glutenvrij is.',
        checklist: ['Dit mag gewoon'],
        alternatives: ['Geen alternatief nodig'],
      },
      {
        name: 'Geen gluten-woorden, geen waarschuwing',
        risk: 'laag',
        where: 'Staat er geen tarwe, gerst, rogge, spelt, haver of mout in, en geen "kan sporen"? Dan is het meestal veilig.',
        checklist: ['Twijfel je? Scan het etiket met de app'],
        alternatives: ['Geen alternatief nodig'],
      },
    ],
  },
  {
    id: 'feestdagen',
    title: 'Kerst & feestdagen',
    subtitle: 'Kerst, oud & nieuw en andere feesten',
    icon: 'tree',
    items: [
      {
        name: 'Kerststol',
        risk: 'hoog',
        where: 'Het deeg is van tarwebloem; ook de amandelspijs wordt soms aangelengd met bloem of paneermeel.',
        checklist: ['Alleen gelabeld glutenvrij is veilig', 'Let bij de bakker op gedeelde ovens en snijmachines'],
        alternatives: ['Glutenvrije kerststol (supermarkt of glutenvrije bakker)', 'Zelf bakken met een glutenvrije broodmix'],
      },
      {
        name: 'Panettone',
        risk: 'hoog',
        where: 'Rijk gistdeeg van tarwebloem, vaak met tarwegluten toegevoegd voor de luchtige structuur.',
        checklist: ['Zoek naar "senza glutine" op Italiaanse verpakkingen', 'Let op "frumento" en "glutine" in de ingrediënten'],
        alternatives: ['Glutenvrije panettone (senza glutine)', 'Vruchtenbrood op basis van rijst- en maismeel'],
      },
      {
        name: 'Christmas pudding',
        risk: 'hoog',
        where: 'Bevat broodkruim en bloem; vaak ook stout of bier (gerst) en niervet (suet) dat met tarwebloem is bestoven.',
        checklist: ['Controleer het niervet: "suet" bevat vaak tarwebloem', 'Let op stout, ale of "malt" in het recept'],
        alternatives: ['Glutenvrije christmas pudding', 'Zelf maken met glutenvrij broodkruim en plantaardig vet'],
      },
      {
        name: 'Mince pies',
        risk: 'hoog',
        where: 'Kruimeldeeg van tarwebloem; de vulling (mincemeat) bevat vaak niervet met bloem.',
        checklist: ['Zowel deeg als vulling controleren', 'Mincemeat uit een pot kan "suet (wheat flour)" bevatten'],
        alternatives: ['Glutenvrije mince pies', 'Deeg van glutenvrije bloemmix met plantaardig vet'],
      },
      {
        name: 'Kerststronk (bûche de Noël)',
        risk: 'hoog',
        where: 'De opgerolde biscuit is gemaakt met tarwebloem; decoraties soms met koekkruim.',
        checklist: ['Vraag bij de patissier naar de biscuit', 'Let op koekjes of crumble als decoratie'],
        alternatives: ['Biscuit met amandelmeel en maïzena', 'Glutenvrije rolcake'],
      },
      {
        name: 'Vruchtencake',
        risk: 'hoog',
        where: 'Cakebeslag van tarwebloem; gekonfijt fruit wordt soms door bloem gerold.',
        checklist: ['Controleer ook gekonfijt fruit los gekocht', 'Alleen gelabeld glutenvrij is veilig'],
        alternatives: ['Cake van glutenvrije bloemmix', 'Notencake op basis van amandelmeel'],
      },
      {
        name: 'Crumble',
        risk: 'hoog',
        where: 'De kruimellaag bestaat uit tarwebloem en vaak gewone havermout.',
        checklist: ['Vraag of er bloem én havermout in zit', 'Gewone havervlokken zijn vrijwel altijd besmet'],
        alternatives: ['Kruimellaag van amandelmeel en boter', 'Gecertificeerd glutenvrije havervlokken of boekweitvlokken'],
      },
      {
        name: 'Geglazuurde ham',
        risk: 'middel',
        where: 'Het glazuur bevat soms sojasaus, bier of mosterd met tarwe; kant-en-klare ham kan bindmiddelen bevatten.',
        checklist: ['Lees de ingrediënten van het glazuur', 'Let op sojasaus, bier en "zetmeel (tarwe)"'],
        alternatives: ['Ahornsiroop-glazuur', 'Honing met glutenvrije mosterd'],
      },
      {
        name: 'Oliebollen & appelflappen',
        risk: 'hoog',
        where: 'Beslag en bladerdeeg van tarwebloem, gebakken in olie die ook voor ander gebak wordt gebruikt.',
        checklist: ['Kraam-oliebollen zijn nooit glutenvrij', 'Thuis: gebruik schone olie die niet gedeeld wordt'],
        alternatives: ['Glutenvrije oliebollenmix', 'Zelf bakken in een eigen pan met verse olie'],
      },
      {
        name: 'Kalkoenvulling',
        risk: 'hoog',
        where: 'Vulling op basis van brood of broodkruim; de jus wordt vaak met bloem gebonden.',
        checklist: ['Vraag naar de vulling én de jus', 'Vulling die in de kalkoen gaart besmet het vlees'],
        alternatives: ['Vulling met rijst, kastanjes of glutenvrij brood', 'Jus gebonden met maïzena'],
      },
    ],
  },
  {
    id: 'snoep-borrel',
    title: 'Snoep & snacks',
    subtitle: 'Chocolade, snacks en borrelplanken',
    icon: 'candy',
    items: [
      {
        name: 'Chocolade met gerstemout',
        risk: 'hoog',
        where: 'Melkchocolade, repen en "crispy" chocolade bevatten vaak gerstemoutextract of gepofte rijst met mout.',
        checklist: ['Let op "gerstemout", "moutextract" en "malt"', 'Krokante vulling = extra controleren'],
        alternatives: ['Pure chocolade zonder mout', 'Chocolade met een glutenvrij-logo'],
      },
      {
        name: 'Snacks in bierbeslag',
        risk: 'hoog',
        where: 'Calamares, uienringen en vis in beslag van tarwebloem en bier; kroketten en bitterballen hebben een paneerlaag.',
        checklist: ['Beslag en paneerlaag zijn vrijwel altijd tarwe', 'Gedeelde frituur maakt ook "veilige" snacks onveilig'],
        alternatives: ['Glutenvrije kroketten en bitterballen', 'Ongepaneerde snacks uit een aparte frituur'],
      },
      {
        name: 'Surimi / imitatiekrab',
        risk: 'middel',
        where: 'Vispasta die vaak gebonden is met tarwezetmeel.',
        checklist: ['Lees de ingrediënten: "tarwezetmeel" of "zetmeel (tarwe)"', 'Ook in sushi en salades verwerkt'],
        alternatives: ['Echte krab of garnalen', 'Surimi met maïs- of aardappelzetmeel (op label controleren)'],
      },
      {
        name: 'Croutons',
        risk: 'hoog',
        where: 'Geroosterde stukjes tarwebrood, vaak op salades en in soep.',
        checklist: ['Vraag de salade zonder croutons', 'Even eraf halen is niet genoeg: de kruimels blijven achter'],
        alternatives: ['Geroosterde noten of zaden', 'Croutons van glutenvrij brood'],
      },
      {
        name: 'Drop',
        risk: 'hoog',
        where: 'Nederlandse drop bevat bijna altijd tarwebloem als basis.',
        checklist: ['Controleer elk merk en elke soort apart', 'Ook in snoepmixen en dropveters'],
        alternatives: ['Glutenvrije drop (gelabeld)', 'Winegums zonder tarwe (label controleren)'],
      },
      {
        name: 'Borrelnoten & chips met smaak',
        risk: 'middel',
        where: 'Het jasje van borrelnoten is tarwebloem; smaakpoeders bevatten soms tarwe of moutazijn.',
        checklist: ['Borrelnoten met jasje zijn nooit glutenvrij', 'Let op "aroma", "kruiden" en "moutazijn" bij chips'],
        alternatives: ['Naturel of gezouten noten', 'Naturel chips'],
      },
      {
        name: 'Bier',
        risk: 'hoog',
        where: 'Gebrouwen van gerstemout, soms ook tarwe (witbier).',
        checklist: ['Alcoholvrij bier bevat óók gluten', 'Alleen bier met glutenvrij-logo is geschikt'],
        alternatives: ['Glutenvrij bier', 'Wijn, cider of sterke drank'],
      },
    ],
  },
  {
    id: 'jus-bouillon',
    title: 'Sauzen & bouillon',
    subtitle: 'Sauzen, bindmiddelen en smaakmakers',
    icon: 'soup',
    items: [
      {
        name: 'Traditionele jus',
        risk: 'hoog',
        where: 'Gebonden met een roux van boter en tarwebloem, of met kant-en-klare jus op basis van tarwe.',
        checklist: ['Vraag hoe de jus gebonden is', 'Pakjes jus en sausbinders bevatten vaak tarwe'],
        alternatives: ['Jus gebonden met maïzena of aardappelzetmeel', 'Glutenvrije sausbinder'],
      },
      {
        name: 'Bouillonblokjes',
        risk: 'middel',
        where: 'Kunnen tarwebloem, tarwe-eiwit of gistextract op basis van gerst bevatten.',
        checklist: ['Lees de ingrediënten per smaak', 'Let op "gehydrolyseerd tarwe-eiwit" en "gistextract"'],
        alternatives: ['Glutenvrije bouillon (gelabeld)', 'Zelf getrokken bouillon'],
      },
      {
        name: 'Marinades met sojasaus',
        risk: 'hoog',
        where: 'Gewone sojasaus wordt gebrouwen met tarwe; ook in teriyaki-, hoisin- en oestersaus.',
        checklist: ['Let op sojasaus, teriyaki en hoisin in recepten', 'In Aziatische restaurants expliciet vragen'],
        alternatives: ['Tamari (glutenvrije sojasaus)', 'Kokosaminos (saus van kokos)'],
      },
      {
        name: 'Kruidenmixen',
        risk: 'middel',
        where: 'Tarwebloem of tarwezetmeel wordt soms als drager of antiklontermiddel gebruikt.',
        checklist: ['Controleer mixen voor gehakt, kip en wok', '"Zetmeel" zonder bron is meestal mais of aardappel'],
        alternatives: ['Losse kruiden en specerijen', 'Mixen met glutenvrij-logo'],
      },
      {
        name: 'Worcestershiresaus',
        risk: 'middel',
        where: 'Sommige merken gebruiken moutazijn (gerst).',
        checklist: ['Merk per merk controleren', 'Ook in Caesar-dressing en Bloody Mary'],
        alternatives: ['Glutenvrije worcestershiresaus', 'Tamari met een scheutje azijn'],
      },
    ],
  },
  {
    id: 'brood-desserts',
    title: 'Bakker & desserts',
    subtitle: 'Bakkerij, restaurant en toetjes',
    icon: 'croissant',
    items: [
      {
        name: 'Broodmandjes',
        risk: 'hoog',
        where: 'Het brood zelf, maar ook kruimels op tafel, in boter en in dipsauzen.',
        checklist: ['Vraag het mandje niet op tafel te zetten', 'Gebruik eigen boter en dip, niet de gedeelde'],
        alternatives: ['Glutenvrij brood vragen (soms los verpakt)', 'Eigen glutenvrij brood meenemen'],
      },
      {
        name: 'Taartbodems',
        risk: 'hoog',
        where: 'Kruimeldeeg, bladerdeeg of een koekbodem (bijv. bij cheesecake) van tarwebloem.',
        checklist: ['Bij cheesecake: de bodem is het probleem', 'Een vulling zonder bodem kan besmet zijn'],
        alternatives: ['Bodem van glutenvrije koekjes en boter', 'Bodem van amandelmeel'],
      },
      {
        name: 'Peperkoek & kruidkoek',
        risk: 'hoog',
        where: 'Ontbijtkoek en kruidkoek worden gemaakt met roggemeel, soms ook tarwe.',
        checklist: ['"Rogge" is net zo goed gluten', 'Ook in speculaas en kruidnoten (tarwe)'],
        alternatives: ['Glutenvrije ontbijtkoek', 'Kruidkoek van glutenvrije bloemmix'],
      },
      {
        name: 'Tiramisu',
        risk: 'hoog',
        where: 'Lange vingers (savoiardi) zijn van tarwebloem.',
        checklist: ['Vraag of er glutenvrije lange vingers zijn gebruikt', 'Let op koekkruim als topping'],
        alternatives: ['Tiramisu met glutenvrije lange vingers', 'Panna cotta of crème brûlée'],
      },
      {
        name: 'IJs & desserts met koek',
        risk: 'middel',
        where: 'Koekjesdeeg, brownie-stukjes, wafels en hoorntjes bevatten tarwe; het ijs zelf vaak niet.',
        checklist: ['Smaken met koek of cookie overslaan', 'Bij de ijsboer: schep wordt gedeeld tussen bakken'],
        alternatives: ['IJs in een bekertje i.p.v. hoorntje', 'Sorbet of ijs met glutenvrij-logo'],
      },
    ],
  },
]
