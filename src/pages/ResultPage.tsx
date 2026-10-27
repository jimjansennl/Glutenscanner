import { Fragment } from 'react'
import { Barcode, Camera, ChevronLeft, ExternalLink, FileText, Info, QrCode } from 'lucide-react'
import { ResultCard } from '../components/result/ResultCard'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
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
  onPhotoScan: () => void
}

export function ResultPage({ result, onHome, onPhotoScan }: Props) {
  const { product, analysis } = result
  const meta = SOURCE_META[result.source]
  const isCodeScan = result.source !== 'photo'
  const details = product?.ingredientsText ?? (isCodeScan && result.source !== 'qr' ? undefined : result.rawValue)
  const headerLabel =
    result.source === 'photo' ? (result.context === 'menu' ? 'Menukaart' : 'Etiket') : meta.label

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="relative flex h-11 items-center justify-center">
        <button
          onClick={onHome}
          className="absolute left-0 -ml-2 rounded-full p-2 text-safe active:opacity-60"
          aria-label="Terug naar start"
        >
          <ChevronLeft size={28} />
        </button>
        <span className="flex items-center gap-1.5 text-[15px] font-medium text-muted">
          <meta.icon size={16} />
          {headerLabel}
          {result.rawValue && isCodeScan && result.source !== 'qr' && ` · ${result.rawValue}`}
        </span>
      </header>

      {product && (
        <section className="flex flex-col items-center gap-2 text-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt="" className="h-20 w-20 rounded-2xl bg-white object-contain" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface text-muted">
              <Barcode size={32} />
            </span>
          )}
          <div>
            <h1 className="text-[22px] font-semibold leading-tight">{product.name}</h1>
            {product.brand && <p className="text-[15px] text-muted">{product.brand}</p>}
          </div>
        </section>
      )}

      {result.imageUrl && !product && (
        <img src={result.imageUrl} alt="Gescande foto" className="max-h-40 w-full rounded-[22px] object-cover" />
      )}

      <ResultCard analysis={analysis} />

      {!product && isCodeScan && (
        <button
          onClick={onPhotoScan}
          className="flex flex-col items-center gap-1 rounded-[22px] bg-surface p-4 text-center active:bg-surface-raised"
        >
          <Camera size={22} className="text-warning" />
          <span className="text-[17px] font-semibold">Fotografeer de ingrediënten</span>
          <span className="text-[13px] text-muted">Dan analyseren we het etiket zelf</span>
        </button>
      )}

      {details && (
        <section className="rounded-[22px] bg-surface p-4 text-center">
          <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
            {product ? 'Ingrediënten' : 'Geanalyseerde tekst'}
          </h3>
          <p className="text-[15px] leading-relaxed text-white/85">
            <Highlighted text={details} danger={analysis.matches} warning={analysis.warnings} />
          </p>
        </section>
      )}

      {product && (
        <a
          href={`https://world.openfoodfacts.org/product/${encodeURIComponent(product.barcode)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-[15px] text-safe active:opacity-60"
        >
          Bekijk of verbeter op Open Food Facts
          <ExternalLink size={14} />
        </a>
      )}

      <p className="flex flex-col items-center gap-1 px-4 text-center text-xs leading-relaxed text-muted/80">
        <Info size={14} aria-hidden />
        {DISCLAIMER_SHORT}
      </p>
    </main>
  )
}
