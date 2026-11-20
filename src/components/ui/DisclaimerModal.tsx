import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { readJson, writeJson } from '../../lib/storage'

const KEY = 'glutenscanner.disclaimer.v1'

export const DISCLAIMER_SHORT =
  'De app helpt je, maar kan zich vergissen. Kijk daarom altijd zelf nog op de verpakking.'

/** Eenmalige medische disclaimer bij de eerste start; akkoord wordt in localStorage bewaard. */
export function DisclaimerModal() {
  const [open, setOpen] = useState(() => !readJson<boolean>(KEY, false))
  if (!open) return null

  function accept() {
    writeJson(KEY, true)
    setOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="animate-slide-up flex w-full max-w-sm flex-col items-center gap-4 rounded-[28px] bg-surface p-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/15 ring-2 ring-warning">
          <ShieldAlert size={32} className="text-warning" />
        </span>
        <h2 id="disclaimer-title" className="text-[22px] font-bold tracking-tight">
          Even belangrijk
        </h2>
        <p className="text-[15px] leading-relaxed text-white/80">
          De app helpt je, maar kan zich vergissen. Kijk daarom altijd zelf nog op de verpakking. Het is geen medisch
          advies.
        </p>
        <p className="text-[13px] leading-relaxed text-muted">
          De productgegevens komen van Open Food Facts. Die kunnen oud zijn of niet compleet. En een fabriek kan een
          recept veranderen.
        </p>
        <button
          onClick={accept}
          autoFocus
          className="mt-2 w-full rounded-full bg-safe py-3.5 text-[17px] font-semibold text-black active:opacity-80"
        >
          Ik begrijp het
        </button>
      </div>
    </div>
  )
}
