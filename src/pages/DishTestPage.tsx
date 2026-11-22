import { useState } from 'react'
import { DISH_PARTS } from '../data/dishParts'
import { askDish, shrink, type DishAnswer } from '../services/dish'

interface Row {
  name: string
  url: string
  answer?: DishAnswer
  error?: string
}

/**
 * Testpagina (niet in een menu): /test-gerecht. Kies veel foto's tegelijk; elke foto gaat langs de
 * AI en je ziet per foto het gerecht en de onderdelen. Zo meten we hoe goed de herkenning is.
 * Kost per foto een fractie van een cent van het tegoed in de Claude Console.
 */
export function DishTestPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [busy, setBusy] = useState(false)

  const run = async (files: FileList | null) => {
    if (!files?.length) return
    const list: Row[] = [...files].map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))
    setRows(list)
    setBusy(true)
    for (let i = 0; i < files.length; i++) {
      let row: Row
      try {
        row = { ...list[i], answer: await askDish(await shrink(files[i])) }
      } catch (e) {
        row = { ...list[i], error: typeof e === 'string' ? e : 'mislukt' }
      }
      setRows((r) => r.map((x, k) => (k === i ? row : x)))
    }
    setBusy(false)
  }

  const done = rows.filter((r) => r.answer || r.error).length

  return (
    <div className="min-h-dvh bg-black p-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
      <h1 className="text-[22px] font-bold">Test: gerechten herkennen</h1>
      <p className="mt-1 text-[15px] text-white/70">Kies een paar foto's tegelijk. Ze worden één voor één bekeken.</p>
      <label className="mt-4 inline-flex cursor-pointer items-center rounded-full bg-safe px-5 py-3 text-[16px] font-semibold text-black">
        Kies foto's
        <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => void run(e.target.files)} />
      </label>
      {rows.length > 0 && (
        <p className="mt-3 text-[14px] text-white/60">
          {done} van {rows.length} bekeken{busy ? '…' : '.'}
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => (
          <div key={r.url} className="overflow-hidden rounded-[20px] bg-surface">
            <img src={r.url} alt="" className="h-40 w-full object-cover" />
            <div className="p-3">
              <p className="text-[13px] text-white/50">
                {i + 1}. {r.name}
              </p>
              {!r.answer && !r.error && <p className="text-[15px] text-white/60">Wacht…</p>}
              {r.error && <p className="text-[15px] font-semibold text-warning">Fout: {r.error}</p>}
              {r.answer && (
                <>
                  <p className="text-[17px] font-bold">
                    {r.answer.food ? r.answer.dish || '(geen naam)' : 'Geen eten'}
                    {r.answer.several && <span className="ml-2 text-[13px] font-normal text-white/50">meer gerechten</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.answer.parts.map((p) => {
                      const d = DISH_PARTS[p.id]
                      const tone = d.group === 'let' ? 'bg-white text-black' : d.group === 'vraag' ? 'bg-white/25' : 'bg-white/10 text-white/70'
                      return (
                        <span key={p.id} className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${tone}`}>
                          {d.emoji} {d.label}
                          {p.alt && <span className="font-normal opacity-60"> / {DISH_PARTS[p.alt].label.toLowerCase()}</span>}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
