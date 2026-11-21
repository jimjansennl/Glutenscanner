import type { GlutenStatus, ScanResult } from '../types/product'
import { analyzeText, NO_LIST_REASON } from './glutenParser'

/**
 * Dubbele check: wat de database zegt over een barcode, naast wat er op het etiket staat
 * (foto). De strengste uitslag wint altijd: een fout in één van de twee kan nooit groen geven.
 * Zeggen ze hetzelfde, dan is dat de sterkste uitslag die de app kan geven.
 */

const RANK: Record<GlutenStatus, number> = { safe: 0, warning: 1, danger: 2 }

/** Een foto-scan die bij een barcode-uitslag hoort, mag niet ouder zijn dan dit. */
export const PENDING_MS = 3 * 60 * 1000

export function crossCheck(db: ScanResult, labelText: string): ScanResult {
  const label = analyzeText(labelText, 'label')
  // Geen ingrediënten op de foto (alleen de barcode of de voorkant): niets om te vergelijken.
  if (label.reasons[0] === NO_LIST_REASON) return db

  const dbHasData = !!db.product?.ingredientsText?.trim()
  if (!dbHasData) {
    // De database kende de ingrediënten niet: dan telt het etiket, met de productnaam erbij.
    return {
      ...db,
      labelText,
      analysis: label,
      check: { agree: true, text: 'De database kende de ingrediënten niet. Ik heb ze van het etiket gelezen.' },
    }
  }

  // Alleen de allergenenlijst van de database noemde gluten (waarschijnlijk een invoerfout), en het etiket
  // op de foto is schoon: dan zeggen de ingrediënten in de database én het etiket hetzelfde. Groen.
  const dbAllergenError = db.analysis.reasons.some((r) => r.includes('Alleen de database noemt gluten'))
  if (dbAllergenError && label.status === 'safe') {
    return {
      ...db,
      labelText,
      analysis: label,
      check: {
        agree: true,
        text: 'De database noemde per ongeluk gluten. Maar de ingrediënten en het etiket zeggen allebei: geen gluten.',
      },
    }
  }

  const d = RANK[db.analysis.status]
  const l = RANK[label.status]
  if (d === l) {
    const text =
      db.analysis.status === 'safe'
        ? 'Dubbel gecheckt: de database en het etiket zeggen allebei dat er geen gluten in zit.'
        : db.analysis.status === 'danger'
          ? 'Dubbel gecheckt: de database en het etiket zeggen allebei dat er gluten in zit.'
          : 'De database en het etiket twijfelen allebei. Kijk zelf goed op de verpakking.'
    return { ...db, labelText, check: { agree: true, text } }
  }
  if (l > d) {
    // Het etiket is strenger (en nieuwer): dat wint.
    return {
      ...db,
      labelText,
      analysis: label,
      check: {
        agree: false,
        text: 'Op het etiket staat iets anders dan in de database. Het etiket is nieuwer, dus dat telt.',
      },
    }
  }
  // De database is strenger dan wat de camera las: veilig houden, maar wel uitleggen.
  return {
    ...db,
    labelText,
    check: {
      agree: false,
      text: 'De database zegt iets anders dan het etiket. Misschien is het recept veranderd, of kon de camera niet alles lezen. Kijk zelf goed op de verpakking.',
    },
  }
}
