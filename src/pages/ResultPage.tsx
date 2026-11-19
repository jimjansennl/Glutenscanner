import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Barcode, Camera, ExternalLink, Eye, EyeOff, FileText, Info, QrCode } from 'lucide-react'
import { ResultCard } from '../components/result/ResultCard'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { PageHeader } from '../components/ui/PageHeader'
import type { GlutenMatch, ScanResult } from '../types/product'
import { saveScanMode } from '../services/scanMode'
import { fold, findSpans } from '../lib/fold'
import { translateIngredients } from '../services/translateIngredients'

const SOURCE_META = {
  barcode: { icon: Barcode, label: 'Barcode' },
  qr: { icon: QrCode, label: 'QR-code' },
  photo: { icon: FileText, label: 'Tekst' },
  manual: { icon: Barcode, label: 'Handmatig' },
}

/** Markeert gevonden termen in de ingrediëntentekst (rood = gluten, oranje = twijfel), ook met accenten. */
function Highlighted({ text, danger, warning }: { text: string; danger: GlutenMatch[]; warning: GlutenMatch[] }) {
  const kinds = new Map<string, 'danger' | 'warning'>()
  for (const m of warning) kinds.set(fold(m.term), 'warning')
  for (const m of danger) kinds.set(fold(m.term), 'danger')
  const spans = findSpans(text, [...kinds.keys()])
  if (spans.length === 0) return <>{text}</>

  const parts: ReactNode[] = []
  let pos = 0
  spans.forEach((s, i) => {
    if (s.start > pos) parts.push(<Fragment key={`t${i}`}>{text.slice(pos, s.start)}</Fragment>)
    const kind = kinds.get(s.term)
    parts.push(
      <mark
        key={`m${i}`}
        className={`rounded px-0.5 font-semibold ${kind === 'danger' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}
      >
        {text.slice(s.start, s.end)}
      </mark>,
    )
    pos = s.end
  })
  if (pos < text.length) parts.push(<Fragment key="end">{text.slice(pos)}</Fragment>)
  return <>{parts}</>
}

const MARK = { danger: 'bg-danger/20 text-danger', warning: 'bg-warning/20 text-warning' }

/** "Lees mee in het Nederlands": de buitenlandse ingrediëntenlijst vertaald, gluten gemarkeerd. */
function ReadAlong({ text, danger, warning }: { text: string; danger: GlutenMatch[]; warning: GlutenMatch[] }) {
  const [open, setOpen] = useState(false)
  const tr = useMemo(() => translateIngredients(text), [text])
  // Alleen tonen als de lijst echt buitenlands is en we het meeste kennen.
  if (!tr || tr.known < 0.5) return null
  const kinds = new Map<string, 'danger' | 'warning'>()
  for (const m of warning) kinds.set(fold(m.term), 'warning')
  for (const m of danger) kinds.set(fold(m.term), 'danger')

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold text-white active:bg-white/20"
      >
        {open ? <EyeOff size={17} /> : <Eye size={17} />}
        {open ? 'Verberg Nederlands' : 'Lees mee in het Nederlands'}
      </button>
      {open && (
        <div className="animate-slide-up mt-3 rounded-2xl bg-white/[0.06] p-3 text-left">
          <p className="mb-1.5 text-[13px] font-medium text-muted">Vertaald uit {tr.langName}</p>
          <p className="text-[15px] leading-relaxed text-white/90">
            {tr.pieces.map((p, i) => {
              if (p.kind === 'sep') return <Fragment key={i}>{p.text}</Fragment>
              const kind = p.source.map((w) => kinds.get(w)).find(Boolean)
              if (kind) {
                return (
                  <mark key={i} className={`rounded px-0.5 font-semibold ${MARK[kind]}`}>
                    {p.text}
                  </mark>
                )
              }
              return p.kind === 'raw' ? (
                <span key={i} className="italic text-white/45">
                  {p.text}
                </span>
              ) : (
                <Fragment key={i}>{p.text}</Fragment>
              )
            })}
          </p>
          <p className="mt-2 text-[12px] leading-snug text-muted">
            Vertaald met een ingebouwde woordenlijst. Grijze woorden ken ik niet. Twijfel? Kijk naar de verpakking.
          </p>
        </div>
      )}
    </div>
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
  // Open Food Facts zet allergenen tussen liggende streepjes (_blé_): die laten we niet zien.
  const details = (product?.ingredientsText ?? (isCodeScan && result.source !== 'qr' ? undefined : result.rawValue))?.replace(/_/g, '')
  const headerLabel =
    result.source === 'photo' ? (result.context === 'menu' ? 'Menukaart' : 'Etiket') : meta.label

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 pb-6">
      <PageHeader title="Resultaat" onBack={onHome} className="-mx-4" />
      <span className="flex items-center justify-center gap-1.5 text-[15px] font-medium text-muted">
        <meta.icon size={16} />
        {headerLabel}
        {result.rawValue && isCodeScan && result.source !== 'qr' && ` · ${result.rawValue}`}
      </span>

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

      {/* Product onbekend, of wel bekend maar zonder ingrediënten: dan zelf het etiket lezen. */}
      {isCodeScan && result.source !== 'qr' && !product?.ingredientsText && analysis.matches.length === 0 && (
        <button
          onClick={() => {
            // Meteen in de stand etiket/menu, met de sluiterknop klaar.
            saveScanMode('text')
            onPhotoScan()
          }}
          className="flex items-center justify-center gap-3 rounded-[22px] bg-accent p-4 text-left text-black active:opacity-80"
        >
          <Camera size={26} className="shrink-0" />
          <span className="flex flex-col">
            <span className="text-[17px] font-bold">Fotografeer de ingrediënten</span>
            <span className="text-[14px] font-medium text-black/70">Dan lees ik het etiket zelf</span>
          </span>
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
          <ReadAlong text={details} danger={analysis.matches} warning={analysis.warnings} />
        </section>
      )}

      {product && (
        <a
          href={`https://world.openfoodfacts.org/product/${encodeURIComponent(product.barcode)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 text-[15px] text-accent active:opacity-60"
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
