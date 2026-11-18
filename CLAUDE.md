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
- **Hamburgermenu (☰)** linksboven in de scanner: dezelfde onderdelen als de kop van
  de website (Hoe het werkt, In actie, Glutengids, Vragen), elk als eigen
  scherm. De code staat in `src/components/landing/LandingPanels.tsx` en
  `src/components/landing/panels.ts`. Zolang het menu open is, reageert de camera niet
  op barcodes.

Belangrijke bestanden:

| Bestand | Wat |
|---|---|
| `src/hooks/useBarcodeScanner.ts` | Camera en barcodelezer. Gebruikt zxing-cpp (WebAssembly, via `barcode-detector`) en op Android de ingebouwde `BarcodeDetector` van Chrome. Leest elke ~120 ms een uitsnede in het midden van het beeld, met af en toe het hele beeld als vangnet. Een code telt pas na 2 gelijke lezingen. |
| `src/services/secureContext.ts` | De camera werkt alleen via https. Wordt de site onbeveiligd geopend, dan stuurt hij door naar https://glutenscanner.vercel.app. Zit hij in een frame (domein doorgestuurd met maskering), dan toont de scanner een knop "Open de scanner". Nooit techtaal zoals "HTTPS" aan de gebruiker tonen. |
| `src/components/scanner/ScannerView.tsx` | Camerascherm met de keuze **Foto / Barcode**, het kader, de zaklamp en de ☰-knop. |
| `src/components/scanner/PhotoAnalysis.tsx` | Na een foto zoekt hij eerst een barcode, daarna leest OCR (Tesseract, `nld`+`eng`) de tekst. Of het een etiket of menukaart is, raadt `src/services/textKind.ts`. De gebruiker kan dat nog omzetten. |
| `src/services/glutenParser.ts` | Glutenanalyse van de tekst in 11 talen, met restaurantrisico's voor menukaarten. |
| `src/services/openFoodFacts.ts` | Zoekt productgegevens op bij een barcode. |
| `src/data/ingredientGuide.ts`, `src/data/glutenGuide.ts` | Inhoud van de glutengids. |
| `src/components/landing/PhoneScreens.tsx` | Nagebouwde telefoonschermen voor de website, geen screenshots. Pas ze aan als de echte app verandert. |

Privacy: foto's en geschiedenis blijven op de telefoon (localStorage). Alleen een
barcode wordt naar Open Food Facts gestuurd.

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
  "© jaar · Gemaakt met ♥ in Nederland". Herhaal er niets uit de kop.
- De carrousel "Bekijk het zelf" (pagina In actie) laat precies 4 kaarten zien en niets half buiten beeld.

**Scanner (telefoon)**
- Hij moet eruitzien als een **echte scanner**: zwart scherm, camerabeeld, een duidelijk
  kader met groene hoeken en een scanlijn, en de keuze **Foto / Barcode** bovenin. Een
  versie met één scherm zonder die keuze vond de gebruiker niet mooi.
- Gebruik niet de zin "Onbeperkt gratis scannen" in de scanner of in de nagebouwde
  telefoonschermen.
- Zo min mogelijk tikken. De uitslag moet in één oogopslag te lezen zijn: groen =
  glutenvrij, oranje = twijfel, rood = bevat gluten.

**Glutengids (tabblad Gids, `src/pages/GuidePage.tsx`)**
- Opzet "Mag ik dit eten?": één zoekbalk met een groot gekleurd antwoord (Nee / Let op /
  Mag), één zin waarom, een tip en "Neem liever". Daaronder drie
  kleurvakken en de thema's (Supermarkt, Sinterklaas, School & feestjes, Etiket lezen,
  Kerst & feestdagen, Snoep & snacks, Sauzen & bouillon, Bakker & desserts), dan "Per soort"
  (de acht groepen met een kleurbalkje: Tarwe, Gerst, Rogge, Haver, Gemaakt van graan,
  E-nummers, Via fabriek of keuken, Zit er stiekem in; geen woorden als "Derivaten"), plus de "Kaart voor de bediening" (vroeger Reiskaart; geen "ziek" in de tekst, wel "Ook een klein beetje is al te veel").
- **Niet doen:** dezelfde standaard-risicotekst bij elk ingrediënt, woorden als
  "Risiconiveau-informatie", "Hoog risico" of Engelse termen. De gebruiker liet een andere
  app zien die het zo doet; wij willen het mooier, slimmer en eenvoudiger. Neem nooit
  teksten of beelden over uit andere apps.
- **Kaart voor de bediening** (`src/pages/TravelCardPage.tsx`): eigen tekst in 10 talen met
  een titel, één zin uitleg en drie gekleurde blokken (Niet in mijn eten / In de keuken / Dit
  kan meestal wel). Slimme taalknop: kiest op reis vanzelf de taal via de tijdzone van de
  telefoon (label "Hier"), anders de laatst gekozen taal. "Lees mee in het Nederlands" toont
  de vertaling. Pas bij een tekstwijziging alle 10 talen aan.
  De kaart staat alleen in de Gids, niet (nog eens) bij Instellingen.
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
