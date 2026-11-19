# Glutenscanner: instructies voor Claude

Gratis webapp die laat zien of er gluten in een product of gerecht zit. Live op
www.glutenscanner.nl (Vercel, deployt automatisch elke push naar `main`).
Gemaakt voor de eigen familie, vooral een vrouw en een dochter van 12, en verder voor
iedereen met coeliakie of glutengevoeligheid.

## Werkafspraken

- **Taal:** praat Nederlands met de gebruiker en schrijf alle teksten in de app in
  eenvoudig Nederlands. Een kind van 12 moet het snappen: korte zinnen en concreet,
  zonder vakjargon.
- **Eerst kijken, dan bouwen.** Wil de gebruiker iets anders zonder te zeggen hoe, kies
  dan de kleinste verandering die het probleem oplost. Gooi geen ontwerp weg dat hij goed
  vindt. Twijfel je bij een grote ombouw, vraag het dan eerst en geef 2 of 3 opties.
- **Push direct naar `main`.** Er zijn geen pull requests, tenzij de gebruiker erom
  vraagt. Controleer na het pushen of de Vercel-deploy gelukt is:
  `gh api repos/jimjansennl/glutenscanner/commits/<sha>/status --jq .state`
- **Commitberichten** zijn in het Nederlands: een korte titel en daaronder in een paar
  regels wat er voor de gebruiker veranderd is.
- **Vóór elke commit:** `npm run build` (typecheck en build) en `npm run lint` (oxlint)
  zonder fouten of waarschuwingen.
- **Laat zien wat je gemaakt hebt.** Maak screenshots van desktop (1440×900 en
  1280×720) en mobiel (390×844) en stuur die mee. Zeg eerlijk wat je niet op een echte
  iPhone hebt kunnen testen.
- **Kort afsluiten:** zeg wat er veranderd is, wat de gebruiker moet testen en wat nog
  openstaat. Geen lange verslagen.

## Commando's

```bash
npm install
npm run dev       # ontwikkelserver
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npx vite preview --port 4173   # gebouwde versie bekijken
```

## Hoe de app in elkaar zit

- **Desktop met muis** (`(min-width:1024px) and (hover:hover) and (pointer:fine)`):
  hier toont de app de **informatiesite** `src/components/landing/LandingPage.tsx`,
  met een eigen pagina per menu-item.
  `#app` in de URL opent de scanner ook op de desktop.
- **Telefoon of tablet:** de app opent direct de **scanner** (`ScannerApp` in `src/App.tsx`).
  Onderin staat een tabbalk: Scan, Geschiedenis, Gids en Instellingen.
  Kop van de scanner: **logo links** (tik = de website), **☰ rechts**.
- **Website op de telefoon:** dezelfde site, maar alles onder elkaar (basis = telefoon,
  `lg:` = desktop; de desktop moet er precies hetzelfde uit blijven zien). Wie welke kant
  ziet, regelt `src/services/siteNav.ts`: op de telefoon is `/` de scanner; het logo opent
  `/` met een vlaggetje in de geschiedenis (terugknop = scanner); `/glutengids`, `/vragen`
  enz. zijn altijd de site. Op de telefoon worden de groene knoppen "Open de scanner"
  (geen QR-code, je bent er al) en staat rechts in de kop een knop "Scan" en ☰.
- **Hamburgermenu (☰)** rechtsboven in de scanner: dezelfde onderdelen als de kop van
  de website (Hoe het werkt, In actie, Glutengids, Vragen), elk als eigen
  scherm. De code staat in `src/components/landing/LandingPanels.tsx` en
  `src/components/landing/panels.ts`. Zolang het menu open is, reageert de camera niet
  op barcodes.

Belangrijke bestanden:

| Bestand | Wat |
|---|---|
| `src/hooks/useBarcodeScanner.ts` | Camera en barcodelezer. Gebruikt zxing-cpp (WebAssembly, via `barcode-detector`) en op Android de ingebouwde `BarcodeDetector` van Chrome. Leest elke ~120 ms een uitsnede in het midden van het beeld, met af en toe het hele beeld als vangnet. Een code telt pas na 2 gelijke lezingen. |
| `src/services/secureContext.ts` | De camera werkt alleen via https. Wordt de site onbeveiligd geopend, dan stuurt hij door naar https://www.glutenscanner.nl (het domein staat sinds november 2026 goed in Vercel, zonder maskering). Zit hij in een frame (domein doorgestuurd met maskering), dan toont de scanner een knop "Open de scanner". Nooit techtaal zoals "HTTPS" aan de gebruiker tonen. |
| `src/components/scanner/ScannerView.tsx` | Camerascherm met een keuze van twee icoontjes (zonder tekst): **barcode** (breed laag kader, leest vanzelf, het kader springt om de code via `onSeen`, géén sluiterknop) en **etiket of menukaart** (groot kader tot net boven de knoppen, sluiterknop, geen live barcodes). De keuze wordt onthouden (`src/services/scanMode.ts`). De knop "Fotografeer de ingrediënten" op een uitslag zet de stand op etiket. Verder zaklamp, galerij en ☰-knop. |
| `src/services/capture.ts`, `src/services/enhance.ts` | Sluiterknop: de camera gaat heel even naar 4K en pakt alleen het kader (plus wat rand). Voor het lezen knapt `enhance.ts` de foto op: schaduw en glans weg, lichte letters op donker omdraaien, contrast en scherpte. Is de uitslag onzeker, dan leest `ocr.ts` ook de gewone foto en kiest de beste. Gemeten op testfoto's: van 18–64% naar 94–100% goed gelezen woorden bij schaduw, glans, kleine letters en gekleurde verpakkingen. |
| `src/components/scanner/PhotoAnalysis.tsx` | Na een foto zoekt hij eerst een barcode, daarna leest OCR (Tesseract, `nld`+`eng`) de tekst. Of het een etiket of menukaart is, raadt `src/services/textKind.ts`. De gebruiker kan dat nog omzetten. |
| `src/services/glutenParser.ts` | Glutenanalyse van de tekst in 11 talen tegelijk (taal kiezen hoeft niet), met restaurantrisico's voor menukaarten. Een recept op de verpakking ("200 g speltmeel") wordt eruit gehaald (`stripRecipe`); staat er alleen een recept op de foto, dan vraagt hij om het stukje "Ingrediënten:". "Kan glutenbevattende granen bevatten" telt als sporen. Testfoto van een echte zak: `ocrbench/zon_achter.jpg` (buiten de repo). |
| `src/services/openFoodFacts.ts` | Zoekt productgegevens op bij een barcode (wereldwijde database, dus ook buitenlandse producten). `fetchGlutenFreeAlternatives`: bij rood zoekt hij in dezelfde soort met label `en:no-gluten` ("Probeer liever"); de app keurt elk alternatief zelf nog na. |
| `src/services/products.ts` | Onthoudt per barcode de ingrediënten: anders dan de vorige keer → banner "Het recept is veranderd!" (`recipeChange`). Ster = "Onze vaste producten", bovenaan Geschiedenis. |
| `src/lib/haptics.ts` | Uitslag voelen: groen 1, oranje 2, rood 3 tikjes. iPhone via een onzichtbaar `<input type=checkbox switch>` (iOS 18+). |
| `src/data/menuQuestions.ts` | Menukaart: per risico één vraag voor de bediening, in 10 talen. Op reis (`zoneLang`) groot in de taal van het land, Nederlands klein eronder. Pas bij een wijziging alle talen aan. |
| `src/services/translateIngredients.ts`, `src/data/ingredientWords.ts` | "Lees mee in het Nederlands" onder een buitenlandse ingrediëntenlijst. Ingebouwde woordenlijst per taal (10 talen, geen internet): raadt de taal, vertaalt vaste combinaties eerst ("farine de blé" → tarwebloem), gluten rood/oranje, onbekende woorden grijs. Knop alleen als de lijst niet Nederlands is en we ≥50% kennen. Woorden toevoegen: gewoon met accenten in `ingredientWords.ts`. |
| `src/lib/fold.ts` | Accenten gelijkmaken bij zoeken ("BLÉ" = "ble") en weer terug naar het echte woord om te tonen. |
| `src/data/ingredientGuide.ts`, `src/data/glutenGuide.ts` | Inhoud van de glutengids. |
| `src/data/guideItems.ts`, `src/components/guide/*`, `src/data/travelCards.ts` | Gedeelde gidsinhoud en bouwstenen. De app (`GuidePage.tsx`) en de website (`SiteGuide.tsx`, pagina `/glutengids`) gebruiken dezelfde data: pas de gids op één plek aan. |
| `src/components/landing/PhoneScreens.tsx` | Nagebouwde telefoonschermen voor de website, geen screenshots. Pas ze aan als de echte app verandert. |

Privacy: foto's, geschiedenis en vaste producten blijven op de telefoon (localStorage).
Naar Open Food Facts gaat alleen een barcode, en bij een rood product de soort product
(bijv. "koekjes") om een glutenvrij alternatief te zoeken.

**Echte app (PWA):** `vite-plugin-pwa` in `vite.config.ts` met manifest, iconen
(`public/icon-*.png`, `apple-touch-icon.png`, `favicon.svg`) en een service worker. De app
werkt offline: de app zelf staat meteen klaar, de tekstherkenning (±10 MB, zelf geleverd via
`scripts/copy-tesseract.mjs` → `public/tesseract`, niet in git) wordt bij de eerste foto
bewaard, eerder gescande producten en alternatieven ook. Koppen gebruiken
`env(safe-area-inset-top)`, want schermvullend loopt de app onder de statusbalk door.

## Ontwerp: wat de gebruiker wil (niet terugdraaien zonder te vragen)

**Website (desktop)**
- Het **donkere bovenstuk** blijft zoals het is: groene gloed, de kop "Eet met een gerust
  hart.", drie telefoons in een waaier en de zwevende labels. Daar is de gebruiker blij mee.
- Er staat **één knop** in het bovenstuk: "Open op je telefoon". De knop "Hoe werkt het?"
  is bewust weggehaald, want die staat al in de kop.
- De **kop** blijft zoals hij is: logo, de menu-items Hoe het werkt, In actie,
  Glutengids en Vragen, en de groene knop "Op je telefoon". "Functies" is bewust
  opgegaan in Hoe het werkt (te veel overlap); `/functies` stuurt door naar `/hoe-het-werkt`. De menu-items staan in
  dezelfde vette displayletter als het logo "glutenscanner" (`font-display font-bold`).
- Zoekbalk in de gids (app én website): wit, rond, met groene knop "Zoek"; de vakken Nee/Let op/Mag zijn donker met alleen kleur in icoon en woord (gebruiker koos optie A).
- De pagina **Glutengids** is dezelfde gids als in de app (zoeken, Nee/Let op/Mag, thema's, per soort,
  kaart, feestelijk eten), breed opgezet in één raster van 4 kolommen (Thema's, Per soort, Ook handig); lijsten openen in een venster. In het ☰-menu van de
  app opent "Glutengids" direct het tabblad Gids.
- **Elk menu-item is een eigen pagina** met een eigen adres: `/hoe-het-werkt`,
  `/in-actie`, `/glutengids` en `/vragen`. Hoe het werkt heeft: de drie manieren van
  scannen, wat de kleuren betekenen en "Wat de scanner nog meer kan" (11 talen, jouw
  profiel, geschiedenis, kaart voor de bediening). Elke pagina begint met een
  donkere band in de stijl van het bovenstuk. De router zit in `LandingPage.tsx`
  (History API, geen extra pakket). `vercel.json` stuurt alle adressen naar `index.html`.
- De **startpagina** (`/`) heeft: het donkere bovenstuk, de drie stappen ("Drie stappen. Zo gedaan."), "Waarom gratis?", het blok met de QR-code (`#telefoon`) en de footer.
  Scrollen mag. Een pagina van één scherm vond de gebruiker te kaal en "wit en saai".
- **Niet terugzetten:** een aparte pagina Functies, en op de startpagina de cijferblokken
  (€ 0, ∞, 11, 106), het functieblok, het glutengidsblok, de carrousel en de vragen. Die staan op hun eigen
  pagina, of zijn weg (de cijferblokken).
- De **footer** is plat, één regel: logo, disclaimer met Open Food Facts en
  "© jaar · Nederland" (geen hartje), dun (py-3). Herhaal er niets uit de kop.
- De carrousel "Bekijk het zelf" (pagina In actie) laat precies 4 kaarten zien en niets half buiten beeld.

**Scanner (telefoon)**
- Hij moet eruitzien als een **echte scanner**: zwart scherm, camerabeeld, een duidelijk
  kader met groene hoeken en een scanlijn. **Twee standen met alleen een icoon** (gebruiker
  koos dit na het slimme scherm zonder keuze): barcode (leest vanzelf, geen sluiterknop,
  want die vond hij zinloos) en etiket of menukaart (groot kader zoals de documentscanner
  van de iPhone, met sluiterknop). Icoontjes: alleen streepjes (`Barcode`) en een blaadje
  met regels (`FileText`), niet twee iconen met scanhoekjes. Alle knoppen zo laag mogelijk:
  barcode = [zaklamp] [keuze] [galerij]; etiket = [zaklamp] [sluiterknop, iets
  kleiner, in het midden] [galerij]. Het etiketkader is zo groot mogelijk (tot net boven die
  rij); de keuzeknop zweeft onderin over het kader. Na een foto raadt de app zelf etiket of menukaart.
- Geen uitlegzinnen in het camerabeeld (zoals "Barcode? Die lees ik vanzelf."): die vond
  de gebruiker storend. Alleen korte meldingen als er iets gebeurt.
- Geen "Tekstherkenning GRATIS"-labeltje of andere gratis-reclame in de scanner.
- Gebruik niet de zin "Onbeperkt gratis scannen" in de scanner of in de nagebouwde
  telefoonschermen.
- Zo min mogelijk tikken. De uitslag moet in één oogopslag te lezen zijn: groen =
  glutenvrij, oranje = twijfel, rood = bevat gluten.

**Glutengids (tabblad Gids, `src/pages/GuidePage.tsx`)**
- Opzet "Mag ik dit eten?": één zoekbalk met een groot gekleurd antwoord (Nee / Let op /
  Mag), één zin waarom, een tip en "Neem liever". Daaronder drie
  kleurvakken, de thema's (Supermarkt, Sinterklaas, School & feestjes, Etiket lezen), dan "Per soort"
  (de acht groepen met een kleurbalkje: Tarwe, Gerst, Rogge, Haver, Gemaakt van graan,
  E-nummers, Via fabriek of keuken, Zit er stiekem in; geen woorden als "Derivaten"), plus de "Kaart voor de bediening" en daaronder "Feestelijk eten" (één pagina met Kerst &
  feestdagen, Snoep & snacks, Sauzen & bouillon en Bakker & desserts; die staan niet los bij Thema's) (vroeger Reiskaart; geen "ziek" in de tekst, wel "Ook een klein beetje is al te veel").
- **Niet doen:** dezelfde standaard-risicotekst bij elk ingrediënt, woorden als
  "Risiconiveau-informatie", "Hoog risico" of Engelse termen. De gebruiker liet een andere
  app zien die het zo doet; wij willen het mooier, slimmer en eenvoudiger. Neem nooit
  teksten of beelden over uit andere apps.
- **Kaart voor de bediening** (`src/pages/TravelCardPage.tsx`): eigen tekst in 10 talen met
  een titel, één zin uitleg en drie gekleurde blokken (Niet in mijn eten / In de keuken / Dit
  kan meestal wel). Begint **standaard in het Nederlands**. Slimme taalknop: kiest op reis
  vanzelf de taal van het land (label "Hier"). Op reis = tijdzone anders dan "thuis" (de
  tijdzone van de eerste keer dat de kaart openging); een iPhone in Nederland kan namelijk
  ook Europe/Berlin melden. Een gekozen taal wordt niet onthouden. "Lees mee in het Nederlands" toont
  de vertaling. Pas bij een tekstwijziging alle 10 talen aan.
  De kaart staat alleen in de Gids, niet (nog eens) bij Instellingen.
- **"Neem liever" alleen als het echt iets toevoegt.** Niet "Een versie zonder X" of
  "Navragen bij…": dat vond de gebruiker te logisch en dommig. Liever een slimme `tip`
  waar je zelf niet aan denkt (bijv. bij medicijnen: laat de apotheek "coeliakie" in je
  dossier zetten). De antwoordkaart op de website staat in het midden (`AnswerCard center`), met "Ook gevonden" eronder (niet ernaast), even breed als de zoekbalk.
- Glutenvrij-keurmerk wint van sporen, maar níet van een glutengraan in de ingrediënten
  (glutenvrij + speltmeel = oranje "Kijk goed op de verpakking").
- Wat je wél mag staat in `NATURALLY_GLUTEN_FREE` (`ingredientGuide.ts`). De lijsten
  Nee / Let op / Mag tonen alleen eten; Etiket lezen en School & feestjes alleen via zoeken en thema.

## Scanner testen zonder telefoon

Chrome kan een nepcamera gebruiken:
`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`. Met
`--use-file-for-fake-video-capture=bestand.y4m` laat hij een eigen beeld zien, bijvoorbeeld
een barcode. Gebruik `playwright-core` met `/usr/bin/google-chrome`. Zet
`localStorage['glutenscanner.disclaimer.v1'] = 'true'`, dan komt de disclaimer niet in beeld.
Een echte iPhone-test blijft nodig. Vraag de gebruiker om dat te doen en een screenshot
te sturen.
