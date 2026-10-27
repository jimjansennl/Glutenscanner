import { Fragment } from 'react'
import { ArrowLeft, Barcode, FileText, QrCode, ScanBarcode } from 'lucide-react'
import { ResultCard } from '../components/result/ResultCard'
import type { GlutenMatch, ScanResult } from '../types/product'

const SOURCE_META = {
  barcode: { icon: Barcode, label: 'Barcode' },
  qr: { icon: QrCode, label: 'QR-code' },
  photo: { icon: FileText, label: 'Tekst' },
  manual: { icon: Barcode, label: 'Handmatig' },
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Markeert gevonden termen in de ingrediëntentekst (rood = gluten, oranje = twijfel). */
function Highlighted({ text, danger, warning }: { text: string; danger: GlutenMatch[]; warning: GlutenMatch[] }) {
  const terms = new Map<string, 'danger' | 'warning'>()
  for (const m of warning) terms.set(m.term.toLowerCase(), 'warning')
  for (const m of danger) terms.set(m.term.toLowerCase(), 'danger')
  if (terms.size === 0) return <>{text}</>

  const pattern = new RegExp(
    `(?<!\\p{L})(${[...terms.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp).join('|')})(?!\\p{L})`,
    'giu',
  )
  return (
    <>
      {text.split(pattern).map((part, i) => {
        const kind = terms.get(part.toLowerCase())
        if (!kind) return <Fragment key={i}>{part}</Fragment>
        return (
          <mark
            key={i}
            className={`rounded px-0.5 font-semibold ${kind === 'danger' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}
          >
            {part}
          </mark>
        )
      })}
    </>
  )
}

interface Props {
  result: ScanResult
  onScanAgain: () => void
  onHome: () => void
}

export function ResultPage({ result, onScanAgain, onHome }: Props) {
  const { product, analysis } = result
  const meta = SOURCE_META[result.source]
  const details = product?.ingredientsText ?? (result.source === 'photo' || result.source === 'qr' ? result.rawValue : undefined)

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-4 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-2">
        <button onClick={onHome} className="-ml-1 rounded-full p-2 active:bg-gray-200" aria-label="Terug naar start">
          <ArrowLeft size={22} />
        </button>
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
          <meta.icon size={16} />
          {meta.label}
          {result.rawValue && result.source !== 'photo' && result.source !== 'qr' && ` · ${result.rawValue}`}
        </span>
      </header>

      {product && (
        <section className="flex items-center gap-3 px-1">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="h-16 w-16 rounded-2xl bg-white object-contain ring-1 ring-gray-200" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Barcode size={28} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold">{product.name}</h1>
            {product.brand && <p className="truncate text-sm text-gray-500">{product.brand}</p>}
          </div>
        </section>
      )}

      {result.imageUrl && !product && (
        <img src={result.imageUrl} alt="Gescande foto" className="max-h-40 w-full rounded-2xl object-cover" />
      )}

      <ResultCard analysis={analysis} />

      {details && (
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            {product ? 'Ingrediënten' : 'Geanalyseerde tekst'}
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            <Highlighted text={details} danger={analysis.matches} warning={analysis.warnings} />
          </p>
        </section>
      )}

      <p className="px-2 text-center text-xs text-gray-400">
        Gebaseerd op Open Food Facts en automatische tekstanalyse. Controleer bij twijfel altijd de verpakking.
      </p>

      <button
        onClick={onScanAgain}
        className="sticky bottom-4 mt-auto flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-lg font-bold text-white shadow-xl active:scale-[0.98]"
      >
        <ScanBarcode size={22} />
        Nog een scan
      </button>
    </main>
  )
}
