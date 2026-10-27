import { Fragment } from 'react'
import { Barcode, ChevronLeft, FileText, QrCode } from 'lucide-react'
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
            className={`rounded px-0.5 font-semibold ${kind === 'danger' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}
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
  onHome: () => void
}

export function ResultPage({ result, onHome }: Props) {
  const { product, analysis } = result
  const meta = SOURCE_META[result.source]
  const details = product?.ingredientsText ?? (result.source === 'photo' || result.source === 'qr' ? result.rawValue : undefined)

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-1">
        <button onClick={onHome} className="-ml-2 flex items-center rounded-full p-2 text-safe active:opacity-60" aria-label="Terug naar start">
          <ChevronLeft size={28} />
        </button>
        <span className="flex items-center gap-1.5 text-[15px] text-muted">
          <meta.icon size={16} />
          {meta.label}
          {result.rawValue && result.source !== 'photo' && result.source !== 'qr' && ` · ${result.rawValue}`}
        </span>
      </header>

      {product && (
        <section className="flex items-center gap-3 px-1">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="h-14 w-14 rounded-2xl bg-white object-contain" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted">
              <Barcode size={26} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-semibold">{product.name}</h1>
            {product.brand && <p className="truncate text-[15px] text-muted">{product.brand}</p>}
          </div>
        </section>
      )}

      {result.imageUrl && !product && (
        <img src={result.imageUrl} alt="Gescande foto" className="max-h-40 w-full rounded-[22px] object-cover" />
      )}

      <ResultCard analysis={analysis} />

      {details && (
        <section className="rounded-[22px] bg-surface p-4">
          <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
            {product ? 'Ingrediënten' : 'Geanalyseerde tekst'}
          </h3>
          <p className="text-[15px] leading-relaxed text-white/85">
            <Highlighted text={details} danger={analysis.matches} warning={analysis.warnings} />
          </p>
        </section>
      )}

      <p className="px-4 text-center text-xs text-muted/70">
        Gebaseerd op Open Food Facts en automatische tekstanalyse. Controleer bij twijfel altijd de verpakking.
      </p>
    </main>
  )
}
