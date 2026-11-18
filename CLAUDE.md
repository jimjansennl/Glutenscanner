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
  hier toont de app de **informatiesite** `src/components/landing/LandingPage.tsx`.
  `#app` in de URL opent de scanner ook op de desktop.
- **Telefoon of tablet:** de app opent direct de **scanner** (`ScannerApp` in `src/App.tsx`).
  Onderin staat een tabbalk: Scan, Geschiedenis, Gids en Instellingen.
- **Hamburgermenu (☰)** linksboven in de scanner: dezelfde onderdelen als de kop van
  de website (Hoe het werkt, Functies, In actie, Glutengids, Vragen), elk als eigen
  scherm. De code staat in `src/components/landing/LandingPanels.tsx` en
  `src/components/landing/panels.ts`. Zolang het menu open is, reageert de camera niet
  op barcodes.

Belangrijke bestanden:

| Bestand | Wat |
|---|---|
| `src/hooks/useBarcodeScanner.ts` | Camera en barcodelezer. Gebruikt zxing-cpp (WebAssembly, via `barcode-detector`) en op Android de ingebouwde `BarcodeDetector` van Chrome. Leest elke ~120 ms een uitsnede in het midden van het beeld, met af en toe het hele beeld als vangnet. Een code telt pas na 2 gelijke lezingen. |
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
- De **kop** heeft de menu-items Hoe het werkt, Functies, In actie, Glutengids en Vragen,
  in dezelfde vette displayletter als het logo "glutenscanner" (`font-display font-bold`).
- Onder het bovenstuk staan, in deze volgorde: de drie stappen ("Drie seconden. Drie
  stappen."), de carrousel "Bekijk het zelf", "Waarom gratis?", het blok met de QR-code,
  de veelgestelde vragen en de footer. Scrollen mag. Een pagina van één scherm vond de
  gebruiker te kaal en "wit en saai".
- **Bewust weggehaald, niet terugzetten:** de cijferblokken (€ 0, ∞, 11, 106), het
  functieblok met de gekleurde tegels en het glutengidsblok. "Functies" en "Glutengids"
  in de kop openen daarom een venster over de pagina (`DesktopPanel` in
  `LandingPanels.tsx`). De andere menu-items springen naar hun blok.
- De **footer** is plat, één regel: logo, disclaimer met Open Food Facts en
  "© jaar · Gemaakt met ♥ in Nederland". Herhaal er niets uit de kop.
- De carrousel "Bekijk het zelf" laat precies 4 kaarten zien en niets half buiten beeld.

**Scanner (telefoon)**
- Hij moet eruitzien als een **echte scanner**: zwart scherm, camerabeeld, een duidelijk
  kader met groene hoeken en een scanlijn, en de keuze **Foto / Barcode** bovenin. Een
  versie met één scherm zonder die keuze vond de gebruiker niet mooi.
- Gebruik niet de zin "Onbeperkt gratis scannen" in de scanner of in de nagebouwde
  telefoonschermen.
- Zo min mogelijk tikken. De uitslag moet in één oogopslag te lezen zijn: groen =
  glutenvrij, oranje = twijfel, rood = bevat gluten.

## Scanner testen zonder telefoon

Chrome kan een nepcamera gebruiken:
`--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`. Met
`--use-file-for-fake-video-capture=bestand.y4m` laat hij een eigen beeld zien, bijvoorbeeld
een barcode. Gebruik `playwright-core` met `/usr/bin/google-chrome`. Zet
`localStorage['glutenscanner.disclaimer.v1'] = 'true'`, dan komt de disclaimer niet in beeld.
Een echte iPhone-test blijft nodig. Vraag de gebruiker om dat te doen en een screenshot
te sturen.
