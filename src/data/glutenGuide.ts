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
  icon: 'gift' | 'candy' | 'soup' | 'croissant' | 'wheat' | 'search'
  items: GuideItem[]
}

export const GUIDE: GuideCategory[] = [
  {
    id: 'feestdagen',
    title: 'Feestdagengerechten',
    subtitle: 'Kerst, oud & nieuw en andere feesten',
    icon: 'gift',
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
    title: 'Snoep & borrelhapjes',
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
    title: 'Jus, bouillon & kruiden',
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
        alternatives: ['Tamari (glutenvrije sojasaus)', 'Coconut aminos'],
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
    title: 'Brood, taarten & desserts',
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
  {
    id: 'graan',
    title: 'Graan & risiconiveaus',
    subtitle: 'Welke granen bevatten gluten?',
    icon: 'wheat',
    items: [
      {
        name: 'Tarwe',
        risk: 'hoog',
        where: 'Ook spelt, kamut, durum, griesmeel, couscous, bulgur, freekeh en seitan zijn (soorten) tarwe.',
        checklist: [
          'Let op: tarwebloem, tarwezetmeel, tarwe-eiwit, paneermeel',
          'Buitenland: trigo, frumento, blé, Weizen',
          'Glutenvrij tarwezetmeel is wél toegestaan',
        ],
        alternatives: ['Rijst (ook bruine rijst)', 'Quinoa', 'Boekweit (geen tarwe!)', 'Maïs en polenta'],
      },
      {
        name: 'Gerst',
        risk: 'hoog',
        where: 'Zit in mout, moutextract, gerstemout, bier, moutazijn en sommige koffievervangers.',
        checklist: ['Let op "mout" en "malt" in chocolade en ontbijtgranen', 'Buitenland: cebada, orzo, orge, Gerste'],
        alternatives: ['Bruine rijst', 'Gierst', 'Sorghum', 'Ahornsiroop of honing als zoetmiddel i.p.v. moutsiroop'],
      },
      {
        name: 'Rogge',
        risk: 'hoog',
        where: 'Roggebrood, ontbijtkoek, knäckebröd en sommige crackers.',
        checklist: ['Donker brood is vaak (deels) rogge', 'Buitenland: centeno, segale, seigle, Roggen'],
        alternatives: ['Glutenvrij donker brood (met boekweit of teff)', 'Rijstwafels en maïswafels'],
      },
      {
        name: 'Haver',
        risk: 'hoog',
        where:
          'Haver zelf bevat avenine, maar gewone haver is bijna altijd besmet met tarwe. Een deel van de mensen met coeliakie reageert ook op pure haver.',
        checklist: ['Alleen gecertificeerd glutenvrije haver gebruiken', 'Overleg met je arts of diëtist of haver voor jou veilig is'],
        alternatives: ['Gecertificeerd glutenvrije havervlokken', 'Quinoavlokken', 'Boekweitvlokken', 'Rijstvlokken'],
      },
      {
        name: 'Van nature glutenvrij',
        risk: 'laag',
        where: 'Rijst, mais, aardappel, quinoa, boekweit, gierst, amarant, teff, sorghum, peulvruchten en noten.',
        checklist: ['Let op besmetting bij verwerking (bijv. boekweitmeel in een tarwemolen)', 'Kies bij meel bij voorkeur een glutenvrij-logo'],
        alternatives: ['Bruine rijst', 'Quinoa', 'Boekweit', 'Amarant', 'Teff'],
      },
    ],
  },
  {
    id: 'verborgen',
    title: 'Verborgen bronnen & additieven',
    subtitle: 'Waar je het niet verwacht',
    icon: 'search',
    items: [
      {
        name: 'Moutextract & moutazijn',
        risk: 'hoog',
        where: 'Van gerst gemaakt; zit in ontbijtgranen, chocolade, koffievervangers en sauzen.',
        checklist: ['"Mout" = gerst, ook als er geen "gerst" staat', 'Moutazijn: overleg met je diëtist (kleine hoeveelheden)'],
        alternatives: ['Ontbijtgranen met glutenvrij-logo', 'Wijnazijn of appelazijn i.p.v. moutazijn'],
      },
      {
        name: 'Glucosestroop, dextrose & maltodextrine',
        risk: 'laag',
        where: 'Kunnen van tarwe gemaakt zijn, maar zijn zo bewerkt dat ze volgens de EU-wet geen gluten meer bevatten.',
        checklist: ['Deze hoef je niet te vermijden', 'Verwar maltodextrine niet met mout (gerst)'],
        alternatives: ['Geen alternatief nodig: veilig'],
      },
      {
        name: '(Gemodificeerd) zetmeel',
        risk: 'laag',
        where: 'In de EU moet tarwe als bron altijd genoemd worden; "zetmeel" zonder bron is meestal mais of aardappel.',
        checklist: ['"Zetmeel (tarwe)" of "tarwezetmeel" = gluten', 'Buiten de EU geldt deze regel niet altijd'],
        alternatives: ['Maïszetmeel, aardappelzetmeel, tapioca'],
      },
      {
        name: 'Gistextract & tarwe-eiwit',
        risk: 'middel',
        where: 'Gistextract kan van biergist (gerst) komen; gehydrolyseerd tarwe-eiwit zit in sauzen, soepen en vleesvervangers.',
        checklist: ['Let op "tarwe-eiwit", "seitan" en "HVP (tarwe)"', 'Vleesvervangers zijn vaak op tarwe gebaseerd'],
        alternatives: ['Vleesvervangers met glutenvrij-logo', 'Tofu, tempeh of peulvruchten'],
      },
      {
        name: 'Gedeelde keukenspullen',
        risk: 'hoog',
        where: 'Broodrooster, botervloot, snijplank, zeef, frituur en pastawater dragen gluten over.',
        checklist: ['Eigen broodrooster of toasterzakjes gebruiken', 'Nooit pasta koken in gebruikt water'],
        alternatives: ['Aparte botervloot en jampot', 'Aparte pan en vergiet voor glutenvrij'],
      },
    ],
  },
]
