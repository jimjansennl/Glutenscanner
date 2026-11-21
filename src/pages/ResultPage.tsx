import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, Barcode, Camera, ExternalLink, Eye, EyeOff, FileText, Info, MessageCircleQuestion, QrCode, ShieldCheck, Star } from 'lucide-react'
import { ResultCard } from '../components/result/ResultCard'
import { DISCLAIMER_SHORT } from '../components/ui/DisclaimerModal'
import { IngredientChips } from '../components/result/IngredientChips'
import { parseIngredientList } from '../services/ingredientList'
import { NO_LIST_REASON } from '../services/glutenParser'
import { PageHeader } from '../components/ui/PageHeader'
import type { GlutenMatch, GlutenStatus, RecipeChange, ScanResult } from '../types/product'
import { checkedAt, isStarred, setChecked, setStarred } from '../services/products'
import { fetchGlutenFreeAlternatives, type OffProduct } from '../services/openFoodFacts'
import { analyzeOffProduct } from '../services/glutenParser'
import type { Product } from '../types/product'
import { MENU_QUESTIONS } from '../data/menuQuestions'
import { CARDS, zoneLang } from '../data/travelCards'
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

const STATUS_WORD: Record<GlutenStatus, string> = { safe: 'groen', warning: 'oranje', danger: 'rood' }
const dateFormat = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

/** Waarschuwing: de fabrikant heeft de ingrediënten veranderd sinds de vorige scan. */
/** Uitkomst van de dubbele check: database en etiket naast elkaar. */
function CheckBanner({ agree, safe, text }: { agree: boolean; safe: boolean; text: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[22px] p-4 text-[15px] leading-snug ${
        !agree ? 'bg-warning/10 text-warning ring-1 ring-warning/30' : safe ? 'bg-safe/10 text-safe ring-1 ring-safe/25' : 'bg-surface text-white/80'
      }`}
    >
      {agree ? <ShieldCheck size={22} className="mt-0.5 shrink-0" /> : <AlertTriangle size={22} className="mt-0.5 shrink-0" />}
      <span className="font-medium">{text}</span>
    </div>
  )
}

function RecipeChanged({ change, status }: { change: RecipeChange; status: GlutenStatus }) {
  const worse = change.statusBefore === 'safe' && status !== 'safe'
  return (
    <section className="animate-slide-up flex flex-col gap-2 rounded-[22px] bg-warning/15 p-4 text-left ring-2 ring-warning">
      <p className="flex items-center gap-2 text-[19px] font-extrabold text-warning">
        <AlertTriangle size={22} className="shrink-0" />
        Het recept is veranderd!
      </p>
      <p className="text-[15px] leading-snug text-white/85">
        Sinds je laatste scan op {dateFormat.format(change.since)} staan er andere ingrediënten op.
        {worse && <strong className="text-white"> Eerst was hij {STATUS_WORD[change.statusBefore]}, nu {STATUS_WORD[status]}.</strong>}
        {' '}Kijk extra goed naar de verpakking.
      </p>
      {change.added.length > 0 && (
        <p className="text-[15px] leading-snug">
          <span className="font-bold text-white">Nieuw: </span>
          <span className="text-white/85">{change.added.join(', ')}</span>
        </p>
      )}
      {change.removed.length > 0 && (
        <p className="text-[15px] leading-snug">
          <span className="font-bold text-white">Weg: </span>
          <span className="text-white/60 line-through">{change.removed.join(', ')}</span>
        </p>
      )}
    </section>
  )
}

/** Ster: bewaar bij "Onze vaste producten". */
/** "Wij hebben de verpakking zelf gecontroleerd": de sterkste zekerheid. Vervalt bij een nieuw recept. */
function CheckedButton({ at, onToggle }: { at: number | null; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={!!at}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
        at ? 'bg-safe/15 text-safe' : 'bg-white/10 text-white active:bg-white/20'
      }`}
    >
      <ShieldCheck size={17} />
      {at ? 'Door ons gecontroleerd' : 'Wij hebben het gecontroleerd'}
    </button>
  )
}

function StarButton({ result }: { result: ScanResult }) {
  const barcode = result.product?.barcode ?? ''
  const [on, setOn] = useState(() => isStarred(barcode))
  return (
    <button
      onClick={() => {
        setStarred(result, result.analysis.status, !on)
        setOn(!on)
      }}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
        on ? 'bg-warning/15 text-warning' : 'bg-white/10 text-white active:bg-white/20'
      }`}
    >
      <Star size={17} fill={on ? 'currentColor' : 'none'} />
      {on ? 'Bij onze vaste producten' : 'Bewaar als vast product'}
    </button>
  )
}

/** Menukaart: per risico een vraag voor de bediening. Op reis in de taal van het land. */
function MenuQuestions({ warnings }: { warnings: GlutenMatch[] }) {
  const abroad = useMemo(() => zoneLang(), [])
  const byLabel = new Map<string, string[]>()
  for (const w of warnings) {
    if (!MENU_QUESTIONS[w.label]) continue
    const terms = byLabel.get(w.label) ?? []
    if (!terms.includes(w.term)) terms.push(w.term)
    byLabel.set(w.label, terms)
  }
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center justify-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-warning">
        <MessageCircleQuestion size={15} />
        Vraag de bediening
        {abroad && <span className="ml-1 normal-case tracking-normal">{CARDS[abroad].flag}</span>}
      </h3>
      <ul className="flex flex-col gap-2">
        {[...byLabel.entries()].map(([label, terms]) => {
          const q = MENU_QUESTIONS[label]
          return (
            <li key={label} className="rounded-[18px] bg-surface p-4 text-left">
              <p className="mb-1 text-[13px] text-muted">
                Bij <span className="font-semibold text-white/80">{terms.slice(0, 3).join(', ')}</span>
              </p>
              <p className="text-[18px] font-semibold leading-snug">{abroad ? q[abroad] : q.nl}</p>
              {abroad && <p className="mt-1 text-[14px] leading-snug text-muted">{q.nl}</p>}
            </li>
          )
        })}
      </ul>
      <p className="px-2 text-center text-[13px] leading-snug text-muted">
        Zeg altijd dat je geen gluten mag, ook niet een klein beetje. De Kaart voor de bediening in de Gids helpt daarbij.
      </p>
    </section>
  )
}

/** Rood product? Dan zoeken we glutenvrije producten van dezelfde soort. */
function Alternatives({ product, onOpen }: { product: Product; onOpen: (barcode: string) => void }) {
  const [items, setItems] = useState<OffProduct[] | null>(null)
  useEffect(() => {
    const ctrl = new AbortController()
    fetchGlutenFreeAlternatives(product.categories ?? [], product.barcode, ctrl.signal)
      // Zelf nog eens nakijken: alleen wat bij ons ook groen is.
      .then((found) =>
        setItems(
          found
            .filter((p) => {
              const a = analyzeOffProduct(p)
              return a.status === 'safe' && !(a.conflicts?.length ?? 0)
            })
            .slice(0, 4),
        ),
      )
      .catch(() => setItems([]))
    return () => ctrl.abort()
  }, [product])

  if (items === null) {
    return <p className="animate-pulse text-center text-[14px] text-muted">Ik zoek een glutenvrij alternatief…</p>
  }
  if (items.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-center text-[13px] font-bold uppercase tracking-wide text-safe">Probeer liever</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((p) => (
          <button
            key={p.code}
            onClick={() => onOpen(p.code!)}
            className="flex flex-col items-center gap-1.5 rounded-[18px] bg-surface p-3 text-center active:bg-surface-raised"
          >
            {p.image_front_small_url ? (
              <img src={p.image_front_small_url} alt="" className="h-16 w-16 rounded-xl bg-white object-contain" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-raised text-muted">
                <Barcode size={24} />
              </span>
            )}
            <span className="line-clamp-2 text-[14px] font-semibold leading-tight">{p.product_name_nl || p.product_name}</span>
            {p.brands && <span className="truncate text-[12px] text-muted">{p.brands.split(',')[0]}</span>}
            <span className="flex items-center gap-1 text-[12px] font-semibold text-safe">
              <span className="h-2 w-2 rounded-full bg-safe" />
              Glutenvrij
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

interface Props {
  result: ScanResult
  onHome: () => void
  onPhotoScan: () => void
  /** Een alternatief product openen (zelfde stappen als een barcode scannen). */
  onOpenBarcode: (barcode: string) => void
}

export function ResultPage({ result, onHome, onPhotoScan, onOpenBarcode }: Props) {
  const { product } = result
  // Zelf gecontroleerd (en recept niet veranderd)? Dan wordt twijfel groen: een mens heeft gekeken.
  const [checked, setCheckedState] = useState(() => checkedAt(result))
  const analysis =
    checked && result.analysis.status === 'warning'
      ? { ...result.analysis, status: 'safe' as const, reasons: ['Jullie hebben de verpakking zelf gecontroleerd.'] }
      : result.analysis
  const meta = SOURCE_META[result.source]
  const isCodeScan = result.source !== 'photo'
  // Open Food Facts zet allergenen tussen liggende streepjes (_blé_): die laten we niet zien.
  // Dubbele check: zeiden database en etiket iets anders (of had de database niets), dan tonen we het etiket.
  const fromLabel = !!result.labelText && (!result.check?.agree || !product?.ingredientsText)
  const details = (fromLabel ? result.labelText : (product?.ingredientsText ?? (isCodeScan && result.source !== 'qr' ? undefined : result.rawValue)))?.replace(/_/g, '')
  const fromDb = !fromLabel && !!product?.ingredientsText
  // Etiket of database: de ingrediënten als losse blokjes. Menukaarten blijven gewone tekst.
  const ingredientList = useMemo(
    () => (details && result.context !== 'menu' ? parseIngredientList(details, fromDb) : null),
    [details, result.context, fromDb],
  )
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
          <div className="flex flex-wrap justify-center gap-2">
            <StarButton key={product.barcode} result={result} />
            {product.ingredientsText && result.analysis.status !== 'danger' && (
              <CheckedButton
                at={checked}
                onToggle={() => {
                  const on = !checked
                  setChecked(result, result.analysis.status, on)
                  setCheckedState(on ? Date.now() : null)
                }}
              />
            )}
          </div>
        </section>
      )}


      {result.imageUrl && !product && (
        <img src={result.imageUrl} alt="Gescande foto" className="max-h-40 w-full rounded-[22px] object-cover" />
      )}

      {/* Menukaart: de vragen hieronder vervangen de losse tips. */}
      <ResultCard analysis={result.context === 'menu' ? { ...analysis, tips: [] } : analysis} hideMatches={!!ingredientList} />

      {result.context === 'menu' && <MenuQuestions warnings={analysis.warnings} />}

      {checked && (
        <CheckBanner
          agree
          safe
          text={`Door jullie zelf gecontroleerd op ${new Date(checked).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}. Het recept is sindsdien niet veranderd.`}
        />
      )}

      {result.check && <CheckBanner agree={result.check.agree} safe={analysis.status === 'safe'} text={result.check.text} />}

      {result.recipeChange && <RecipeChanged change={result.recipeChange} status={analysis.status} />}

      {/* Wel productgegevens, nog geen dubbele check: het etiket erbij pakken maakt het zekerder. */}
      {isCodeScan && product?.ingredientsText && !result.check && !checked && (
        <button
          onClick={() => {
            saveScanMode('text')
            onPhotoScan()
          }}
          className="flex items-center justify-center gap-2.5 rounded-[22px] bg-surface p-3.5 text-[16px] font-semibold text-accent ring-1 ring-accent/30 active:opacity-70"
        >
          <ShieldCheck size={20} />
          Dubbel checken met het etiket
        </button>
      )}

      {product && analysis.status === 'danger' && (product.categories?.length ?? 0) > 0 && (
        <Alternatives key={product.barcode} product={product} onOpen={onOpenBarcode} />
      )}

      {/* Product onbekend, of wel bekend maar zonder ingrediënten: dan zelf het etiket lezen. */}
      {((isCodeScan && result.source !== 'qr' && !product?.ingredientsText && analysis.matches.length === 0) ||
        analysis.reasons[0] === NO_LIST_REASON) && (
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

      {details && ingredientList && (
        <>
          <IngredientChips
            list={ingredientList}
            danger={analysis.matches}
            warning={analysis.warnings}
            fullText={product ? undefined : <Highlighted text={details} danger={analysis.matches} warning={analysis.warnings} />}
          />
          <ReadAlong text={details} danger={analysis.matches} warning={analysis.warnings} />
        </>
      )}

      {details && !ingredientList && (
        <section className="rounded-[22px] bg-surface p-4 text-center">
          <h3 className="mb-2 text-[13px] font-medium uppercase tracking-wide text-muted">
            {product ? 'Ingrediënten' : 'Dit las de scanner'}
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
