# Glutenscanner

Mobiele webapp om barcodes van producten te scannen en te controleren of ze glutenvrij zijn.

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
│   ├── scanner/   # barcode-scanner componenten (ZXing)
│   └── ui/        # herbruikbare UI-componenten
├── pages/         # schermen/pagina's
├── hooks/         # custom React hooks
├── lib/           # clients en helpers (o.a. supabase.ts)
├── services/      # data-ophaal logica (producten, API's)
└── types/         # gedeelde TypeScript types
```
