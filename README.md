# Glutenscanner

Mobiele webapp om barcodes van producten te scannen en te controleren of ze glutenvrij zijn.

## Functies

- **Barcode & QR-scan** (EAN/UPC/QR) met productdata van Open Food Facts
- **Duidelijke status**: Glutenvrij, Bevat Gluten! (met de getraceerde glutenbron) of Twijfelgeval
- **Meertalige analyse**: herkent glutenbronnen in NL, EN, DE, FR, ES, IT, PT en PL en meldt ze in het Nederlands (bijv. *trigo → tarwe*)
- **Menukaart-analyse**: let op gebonden sauzen, dressings, sojasaus, paneermeel, croutons, beslag, gedeelde frituur en kruisbesmetting, met concrete vragen voor de bediening
- **Echte tekstherkenning (OCR)** van etiketten en menukaarten met Tesseract.js, volledig in de browser (de foto verlaat het toestel niet). Taalmodellen (NL + EN, ca. 6 MB) worden bij de eerste foto geladen en daarna bewaard
- **Glutengids**: feestdagen, snoep & borrel, jus & bouillon, brood & desserts, granen met risiconiveaus en verborgen bronnen, met zoekfunctie
- **Reiskaart** in 7 talen om aan de bediening te laten zien
- **Veiligheidsprofiel**: *Strikte coeliakie* (sporen = rood) of *Glutenintolerant / gevoelig* (sporen = oranje); geldt ook direct voor de historie
- **Historie** met filters (Alles / Glutenvrij / Bevat gluten / Twijfel) en voelbare feedback per status
- Gratis, onbeperkt, geen account; eenmalige medische disclaimer

> Deze app is een hulpmiddel voor dubbele controle en geen medisch advies. Controleer altijd de fysieke verpakking.

**Stack:** React · Vite · TypeScript · Tailwind CSS · @zxing/library · lucide-react · Supabase

## Aan de slag

```bash
npm install
cp .env.example .env.local   # vul je Supabase URL en anon key in
npm run dev
```

## Mappenstructuur

```
src/
├── components/
│   ├── result/    # resultaatkaarten (veilig / gluten / twijfel)
│   ├── scanner/   # camera, barcode/QR-scanner (ZXing) en foto-analyse
├── pages/         # schermen/pagina's
├── hooks/         # custom React hooks
├── lib/           # clients en helpers (o.a. supabase.ts)
├── services/      # Open Food Facts, gluten-parser, OCR-koppelpunt
└── types/         # gedeelde TypeScript types
```
